import heic2any from 'heic2any'

export async function ensureJpeg(file: File): Promise<File> {
  let blob: Blob = file

  // convert HEIC first
  if (file.type.includes('heic') || file.name.toLowerCase().endsWith('.heic')) {
    const heic2any = (await import('heic2any')).default
    blob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.7,
    }) as Blob
  }

  // resize if over 1.5MB — receipts don't need to be huge
  if (blob.size > 1.5 * 1024 * 1024) {
    blob = await resizeImage(blob)
  }

  return new File(
    [blob],
    file.name.replace(/\.heic$/i, '.jpg'),
    { type: 'image/jpeg' }
  )
}

async function resizeImage(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      const MAX = 1800  // max dimension in pixels, enough for Claude to read text
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((result) => resolve(result!), 'image/jpeg', 0.75)
    }
    img.src = url
  })
}