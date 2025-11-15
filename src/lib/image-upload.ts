import { resolveScheme, upload } from "thirdweb/storage";

import { client } from "@/providers/Thirdweb";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const renameFileWithExtension = (file: File, blob: Blob) => {
  const nameParts = file.name.split(".");
  nameParts.pop();
  const baseName = nameParts.join(".") || file.name;
  return new File([blob], `${baseName}.jpg`, {
    type: blob.type,
    lastModified: Date.now(),
  });
};

export const tryResolveScheme = (uri: string) => {
  if (!uri) {
    return uri;
  }

  try {
    return resolveScheme({ client, uri });
  } catch (error) {
    console.warn("Failed to resolve URI scheme", error);
    return uri;
  }
};

export const resizeImageIfNeeded = async (file: File) => {
  if (file.size <= MAX_IMAGE_SIZE) {
    return file;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("Failed to load image for resizing. Please try another file."));
      img.src = objectUrl;
    });

    let currentWidth = image.width;
    let currentHeight = image.height;
    let quality = 0.9;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to process the image. Please try another file.");
    }

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const width = Math.max(1, Math.round(currentWidth));
      const height = Math.max(1, Math.round(currentHeight));

      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, "image/jpeg", Math.max(0.5, quality)),
      );

      if (!blob) {
        throw new Error("Unable to process the image. Please try another file.");
      }

      if (blob.size <= MAX_IMAGE_SIZE) {
        return renameFileWithExtension(file, blob);
      }

      currentWidth *= 0.85;
      currentHeight *= 0.85;
      quality *= 0.85;
    }

    throw new Error(
      "Unable to resize the image below 5MB. Please choose a smaller image.",
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const uploadImageToIpfs = async (file: File) => {
  const resizedImage = await resizeImageIfNeeded(file);
  const uri = await upload({ client, files: [resizedImage] });
  return tryResolveScheme(uri);
};
