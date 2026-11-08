// @vitest-environment node
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/presign";

vi.hoisted(() => {
  process.env.AWS_REGION = "us-east-1";
  process.env.AWS_ACCESS_KEY_ID = "test-key";
  process.env.AWS_SECRET_ACCESS_KEY = "test-secret";
  process.env.S3_BUCKET = "bucket-de-prueba";
  process.env.VITE_FIREBASE_PROJECT_ID = "proyecto-de-prueba";
});

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {},
  PutObjectCommand: class {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  },
}));
vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: vi.fn() }));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function fakeToken(uid: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: uid })).toString("base64url");
  return `header.${payload}.firma`;
}

function firestoreReturnsRole(role: string) {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ fields: { role: { stringValue: role } } }), { status: 200 }),
  );
}

function createRequest(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: "POST",
    headers: { authorization: `Bearer ${fakeToken("u_admin")}` },
    body: { filename: "Foto Cámara.PNG", contentType: "image/png" },
    ...overrides,
  } as VercelRequest;
}

function createResponse() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(data: unknown) {
      res.body = data;
      return res;
    },
    setHeader(name: string, value: string) {
      res.headers[name] = value;
      return res;
    },
  };
  return res;
}

async function callHandler(req: VercelRequest) {
  const res = createResponse();
  await handler(req, res as unknown as VercelResponse);
  return res;
}

describe("POST /api/presign", () => {
  beforeEach(() => {
    vi.mocked(getSignedUrl).mockResolvedValue("https://s3.example.com/url-firmada");
  });

  it("rechaza métodos que no son POST (405)", async () => {
    const res = await callHandler(createRequest({ method: "GET" }));

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("POST");
  });

  it("sin token responde 401 y no firma nada", async () => {
    const res = await callHandler(createRequest({ headers: {} }));

    expect(res.statusCode).toBe(401);
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it("un customer recibe 403 y no firma nada", async () => {
    firestoreReturnsRole("customer");

    const res = await callHandler(createRequest());

    expect(res.statusCode).toBe(403);
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it("un token inválido recibe 403 (Firestore lo rechaza)", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));

    const res = await callHandler(createRequest());

    expect(res.statusCode).toBe(403);
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it("un admin con un tipo de archivo no permitido recibe 400", async () => {
    firestoreReturnsRole("admin");

    const res = await callHandler(
      createRequest({ body: { filename: "virus.exe", contentType: "application/x-msdownload" } }),
    );

    expect(res.statusCode).toBe(400);
  });

  it("un admin recibe la URL firmada y la URL pública con el nombre limpio", async () => {
    firestoreReturnsRole("admin");

    const res = await callHandler(createRequest());
    const body = res.body as { url: string; key: string; publicUrl: string };

    expect(res.statusCode).toBe(200);
    expect(body.url).toBe("https://s3.example.com/url-firmada");
    expect(body.key).toMatch(/^products\/[0-9a-f-]{36}-foto-camara\.png$/);
    expect(body.publicUrl).toBe(`https://bucket-de-prueba.s3.us-east-1.amazonaws.com/${body.key}`);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/documents/users/u_admin"), {
      headers: { Authorization: `Bearer ${fakeToken("u_admin")}` },
    });
  });
});
