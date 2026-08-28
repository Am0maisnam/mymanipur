export interface Media {
  id: number;
  r2Key: string;
  width: number | null;
  height: number | null;
  altText: string | null;
}

export async function createMedia(
  db: D1Database,
  r2Key: string,
  altText: string | null,
  uploadedBy: number | null
): Promise<Media> {
  const row = await db
    .prepare(
      "INSERT INTO media (r2_key, alt_text, uploaded_by) VALUES (?, ?, ?) RETURNING id, r2_key AS r2Key, width, height, alt_text AS altText"
    )
    .bind(r2Key, altText, uploadedBy)
    .first<Media>();
  return row!;
}
