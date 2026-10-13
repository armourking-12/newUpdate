import { uploadToCloudinary, deleteFromCloudinary } from "./cloudinary";
import { uploadToPostgres, deleteFromPostgres } from "./postgres";

export interface DocumentStorageMetadata {
  university?: string;
  course?: string;
  semester?: number;
  subject?: string;
  year?: number;
  examType?: string;
}

export interface StorageUploadResult {
  url: string;
  provider: "cloudinary" | "postgres";
  publicId?: string;
}

/**
 * Automatically routes the upload to Cloudinary (images) or Neon PostgreSQL (documents like PDFs).
 */
export async function uploadResource(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  _metadata?: DocumentStorageMetadata
): Promise<StorageUploadResult> {
  // If file is an image, use Cloudinary
  if (mimeType.startsWith("image/")) {
    const result = await uploadToCloudinary(fileBuffer, fileName);
    return {
      url: result.url,
      provider: "cloudinary",
      publicId: result.publicId,
    };
  }

  // Otherwise (PDF, DOCX, PPTX), store in Neon PostgreSQL
  const url = await uploadToPostgres(fileBuffer, fileName, mimeType);
  return { url, provider: "postgres" };
}

/**
 * Delete a resource from its respective storage provider
 */
export async function deleteResource(
  urlOrPublicId: string,
  provider: "cloudinary" | "postgres" | "github"
): Promise<void> {
  if (provider === "postgres") {
    await deleteFromPostgres(urlOrPublicId);
  } else if (provider === "cloudinary") {
    await deleteFromCloudinary(urlOrPublicId);
  } else if (provider === "github") {
    // Legacy support: GitHub storage removed
    console.warn("Legacy GitHub resource deletion skipped:", urlOrPublicId);
  }
}
