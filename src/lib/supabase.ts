import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://uunkblczibcneidgughs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bmtibGN6aWJjbmVpZGd1Z2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODg0NzUsImV4cCI6MjA4MDI2NDQ3NX0.4V-L0VVvxutGvYG6tPed_sdKdpxZqbDUT0nvBWubQrI"
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