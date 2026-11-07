interface PresignResponse {
  url: string;
  key: string;
  publicUrl: string;
}

async function safeFetch(url: string, init: RequestInit, errorMessage: string): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(errorMessage);
  }
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export async function uploadImage(file: File): Promise<string> {
  const presignResponse = await safeFetch(
    "/api/presign",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    },
    "No pudimos conectarnos con el servidor para subir la imagen.",
  );
  if (!presignResponse.ok) {
    throw new Error(
      await readErrorMessage(presignResponse, "No se pudo preparar la subida de la imagen."),
    );
  }

  const { url, publicUrl } = (await presignResponse.json()) as PresignResponse;

  const uploadResponse = await safeFetch(
    url,
    { method: "PUT", headers: { "Content-Type": file.type }, body: file },
    "Se cortó la conexión mientras subíamos la imagen.",
  );
  if (!uploadResponse.ok) {
    throw new Error("No se pudo subir la imagen. Intentá de nuevo.");
  }

  return publicUrl;
}
