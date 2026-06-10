type CompressOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxBytes?: number;
};

/** Resize/compress an image file for upload (keeps requests under typical proxy limits). */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    maxBytes = 900 * 1024,
  } = options;

  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }

  if (file.size <= maxBytes && file.type === 'image/jpeg') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Could not process image');
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let currentQuality = quality;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 6; attempt++) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', currentQuality);
    });

    if (blob && blob.size <= maxBytes) break;
    currentQuality -= 0.12;
  }

  if (!blob) {
    throw new Error('Could not compress image');
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'product';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}
