import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ptavozhlsokxbyemhhjq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0YXZvemhsc29reGJ5ZW1oaGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODg1MTYsImV4cCI6MjA4MDI2NDUxNn0.TXPEhXW3k3zxLPVCtYIX1xpjO_IGa3Ipeym07murAdY"
);

export const uploadShopImage = async (file: File, shopId: number) => {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${shopId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("shop-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    console.error("Upload xatosi:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from("shop-images").getPublicUrl(fileName);

  return data.publicUrl;
};