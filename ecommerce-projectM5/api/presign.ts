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

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET } = process.env;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET) {
    console.error("Faltan variables de entorno de AWS");
    return res.status(500).json({ error: "Configuración del servidor incompleta" });
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
