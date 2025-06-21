import supabase from "./supabaseClient.js";

export const deleteImages = async (imageUrls, bucket) => {
  try {
    const imagePaths = imageUrls.map((imageUrl) => {
      return imageUrl.split(`/object/public/${bucket}/`)[1];
    });
    const { error, data } = await supabase.storage
      .from(bucket)
      .remove(imagePaths);

    if (error) throw error;
    console.log(`Deleted images:`, data);
    return data;
  } catch (error) {
    console.error("Error deleting images from Supabase:", err.message);
    throw err;
  }
};
