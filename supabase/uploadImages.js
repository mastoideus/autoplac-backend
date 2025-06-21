import supabase from "./supabaseClient.js";

export async function uploadImages(imageFiles, bucketName) {
  const uploadedImageUrls = [];

  for (const file of imageFiles) {
    const { buffer, originalname, mimetype } = file;

    const filePath = `cars/${Date.now()}_${originalname}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, { contentType: mimetype });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return res.status(500).json({ message: "Image upload failed" });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    uploadedImageUrls.push(publicUrlData.publicUrl);
  }

  return uploadedImageUrls;
}
