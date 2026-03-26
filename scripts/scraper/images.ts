import { supabase } from './db'

export async function downloadAndUploadImage(
  imageUrl: string,
  itemNumber: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) return null

    const buffer = await response.arrayBuffer()
    const storagePath = `items/${itemNumber}/0.jpg`

    const { error } = await supabase.storage
      .from('item-images')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (error) {
      console.error(`Image upload failed for ${itemNumber}:`, error)
      return null
    }

    return storagePath
  } catch (err) {
    console.error(`Image download failed for ${itemNumber}:`, err)
    return null
  }
}