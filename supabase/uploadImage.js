import supabase from "./supabaseClient";

export async function uploadImage(imageFile, bucketName) {
  const { name: imageName, type: imageType } = imageFile;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(imageName, imageFile, {
      upsert: true,
      contentType: imageType,
    });

  if (uploadError) {
    console.error(`Error uploading ${imageName}:`, uploadError);
    return null;
  }

  const { data, error: urlError } = supabase.storage
    .from(bucketName)
    .getPublicUrl(imageName);

  if (urlError) {
    console.error(`Error getting public URL for ${imageName}:`, urlError);
    return null;
  }

  return data.publicUrl;
}

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
