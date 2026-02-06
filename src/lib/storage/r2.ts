/**
 * Cloudflare R2 Storage Helper
 *
 * Uses the S3-compatible API via @aws-sdk/client-s3.
 * R2 is accessed either via:
 *   1. The R2 binding in Cloudflare Workers/Pages (for server-side operations)
 *   2. The S3 API client (for both local dev and production)
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ""
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ""
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ""
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "document-archive-files"
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ""

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return s3Client
}

/**
 * Upload a file to R2.
 * @param key - The storage path/key (e.g., "userId/timestamp_filename.pdf")
 * @param body - The file content as Buffer or ReadableStream
 * @param contentType - MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  key: string,
  body: Buffer | ReadableStream | Uint8Array,
  contentType: string
): Promise<{ url: string; key: string }> {
  const client = getS3Client()

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )

  const url = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL}/${key}`
    : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`

  return { url, key }
}

/**
 * Generate a signed URL for downloading a file from R2.
 * Time-limited for security.
 * @param key - The storage key
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = getS3Client()
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  })
  return getSignedUrl(client, command, { expiresIn })
}

/**
 * Get the public URL for a file in R2.
 * Only works if the bucket has a public custom domain configured.
 */
export function getPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`
  }
  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev/${key}`
}

/**
 * Delete a single file from R2.
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  )
}

/**
 * Delete multiple files from R2.
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  if (keys.length === 0) return

  const client = getS3Client()
  await client.send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    })
  )
}

/**
 * Extract the R2 storage key from a full URL.
 * Used when migrating from Supabase Storage URLs to R2 keys.
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url) return null

  // Handle R2 public URL format
  if (R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
    return url.slice(R2_PUBLIC_URL.length + 1)
  }

  // Handle R2 dev URL format
  const r2DevPattern = /\.r2\.dev\/(.+)$/
  const r2Match = url.match(r2DevPattern)
  if (r2Match) return r2Match[1]

  // Handle direct R2 storage URL
  const r2StoragePattern = /r2\.cloudflarestorage\.com\/[^/]+\/(.+)$/
  const storageMatch = url.match(r2StoragePattern)
  if (storageMatch) return storageMatch[1]

  return null
}
