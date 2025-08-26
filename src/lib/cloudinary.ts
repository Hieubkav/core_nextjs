import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper functions for common Cloudinary operations
export const uploadImage = async (file: string, options?: Record<string, unknown>) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "uploads",
      ...options,
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export const uploadBuffer = async (buffer: Buffer, options?: Record<string, unknown>) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:image/upload;base64,${buffer.toString('base64')}`,
      {
        folder: "uploads",
        ...options,
      }
    );
    return result;
  } catch (error) {
    console.error("Error uploading buffer to Cloudinary:", error);
    throw error;
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

export const getOptimizedUrl = (publicId: string, options?: Record<string, unknown>) => {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    ...options,
  });
};

export const getTransformedUrl = (publicId: string, transformations: Record<string, unknown>) => {
  return cloudinary.url(publicId, transformations);
};
