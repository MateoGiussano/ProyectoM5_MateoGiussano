import type { VercelRequest, VercelResponse } from "@vercel/node";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

interface PresignBody {
  filename?: unknown;
  contentType?: unknown;
}

interface PresignResponse {
  url: string;
  key: string;
  publicUrl: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const URL_TTL_SECONDS = 600;

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET,
  VITE_FIREBASE_PROJECT_ID,
} = process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: AWS_SECRET_ACCESS_KEY ?? "",
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

function sanitizeFilename(name: string): string {
  const clean = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  return clean || "imagen";
}

function getUidFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as {
      sub?: unknown;
    };
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

async function isAdminToken(token: string): Promise<boolean> {
  const uid = getUidFromToken(token);
  if (!uid) return false;

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${encodeURIComponent(uid)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) return false;

  const profile = (await response.json()) as { fields?: { role?: { stringValue?: string } } };
  return profile.fields?.role?.stringValue === "admin";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (
    !AWS_REGION ||
    !AWS_ACCESS_KEY_ID ||
    !AWS_SECRET_ACCESS_KEY ||
    !S3_BUCKET ||
    !VITE_FIREBASE_PROJECT_ID
  ) {
    console.error("Faltan variables de entorno de AWS o Firebase");
    return res.status(500).json({ error: "Configuración del servidor incompleta" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Tenés que iniciar sesión." });
  }

  try {
    if (!(await isAdminToken(authHeader.slice("Bearer ".length)))) {
      return res.status(403).json({ error: "Solo un administrador puede subir imágenes." });
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    return res.status(500).json({ error: "No se pudo verificar la sesión" });
  }

  const { filename, contentType } = (req.body ?? {}) as PresignBody;
  if (typeof filename !== "string" || filename.trim() === "" || typeof contentType !== "string") {
    return res.status(400).json({ error: "Faltan filename o contentType" });
  }
  if (!ALLOWED_TYPES.includes(contentType)) {
    return res.status(400).json({ error: "Tipo de archivo no permitido (solo JPG, PNG o WebP)" });
  }

  const key = `products/${randomUUID()}-${sanitizeFilename(filename)}`;

  try {
    const command = new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: contentType });
    const url = await getSignedUrl(s3, command, {
      expiresIn: URL_TTL_SECONDS,
      signableHeaders: new Set(["content-type"]),
    });
    const publicUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    const body: PresignResponse = { url, key, publicUrl };
    return res.status(200).json(body);
  } catch (error) {
    console.error("Error al generar la presigned URL:", error);
    return res.status(500).json({ error: "No se pudo generar la URL de subida" });
  }
}
