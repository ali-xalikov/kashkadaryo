import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import districtsData from "../data/districts";
import { Map, Placemark } from "@pbe/react-yandex-maps";

type Shop = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  price_per_kg: number;
  district_id: number;
  image_url?: string | null;
};

type Props = {
  shop: Shop;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: () => void;
};

export default function ShopModal({
  shop,
  onClose,
  onDelete,
  onUpdate,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit holati
  const [editName, setEditName] = useState(shop.name);
  const [editDistrictId, setEditDistrictId] = useState(
    shop.district_id.toString()
  );
  const [editLat, setEditLat] = useState(shop.lat.toString());
  const [editLng, setEditLng] = useState(shop.lng.toString());
  const [editPrice, setEditPrice] = useState(shop.price_per_kg.toString());
  const [editImage, setEditImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    shop.image_url || null
  );
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // GPS – kartada markerni harakatlantirish
  const getCurrentLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setEditLat(lat);
        setEditLng(lng);
        setGettingLocation(false);
        alert("Joylashuvingiz aniqlandi!");
      },
      () => {
        alert("GPS topilmadi");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Rasm yuklash
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Saqlash
  const handleSave = async () => {
    setSaving(true);

    let finalImageUrl = shop.image_url;

    // Yangi rasm yuklash
    if (editImage) {
      const fileExt = editImage.name.split(".").pop();
      const fileName = `${shop.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("shop-images")
        .upload(fileName, editImage, { upsert: true });

      if (uploadError) {
        alert("Rasm yuklashda xato: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage
        .from("shop-images")
        .getPublicUrl(fileName);
      finalImageUrl = data.publicUrl;
    }

    // Maʼlumotlarni yangilash
    const { error } = await supabase
      .from("shops")
      .update({
        name: editName,
        district_id: parseInt(editDistrictId),
        lat: parseFloat(editLat),
        lng: parseFloat(editLng),
        price_per_kg: parseInt(editPrice),
        image_url: finalImageUrl,
      })
      .eq("id", shop.id);

    setSaving(false);
    if (error) {
      alert("Xato: " + error.message);
    } else {
      onUpdate();
      setIsEditing(false);
    }
  };

  // Tortib yopish (oldinchi kod bir xil)
  useEffect(() => {
    // ... oldingi tortib yopish kodi
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div
        ref={modalRef}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl p-6 z-50 max-h-screen overflow-y-auto"
      >
        <div className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-6" />

        {isEditing ? (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-center text-indigo-700">
              Do'konni tahrirlash
            </h2>

            {/* Rasm yuklash */}
            <div className="text-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-2xl mb-4"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-2xl mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Rasm yoʻq</span>
                </div>
              )}
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold">
                Rasm tanlash
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Do'kon nomi"
              className="w-full px-4 py-3 border-2 rounded-xl"
            />

            <select
              value={editDistrictId}
              onChange={(e) => setEditDistrictId(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl"
            >
              <option value="">Tumanni tanlang</option>
              {districtsData.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <button
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className={`w-full py-4 rounded-xl text-white font-bold ${
                gettingLocation
                  ? "bg-gray-400"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {gettingLocation ? "Aniqlanmoqda..." : "Mening joylashuvim"}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={editLat}
                onChange={(e) => setEditLat(e.target.value)}
                placeholder="Latitude"
                className="px-4 py-3 border-2 rounded-xl"
              />
              <input
                type="text"
                value={editLng}
                onChange={(e) => setEditLng(e.target.value)}
                placeholder="Longitude"
                className="px-4 py-3 border-2 rounded-xl"
              />
            </div>

            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="Narx (so'm/kg)"
              className="w-full px-4 py-3 border-2 rounded-xl"
            />

            <div className="h-64 rounded-2xl overflow-hidden border-2 border-gray-300">
              <YMaps>
                <Map
                  width="100%"
                  height="100%"
                  defaultState={{
                    center: [
                      parseFloat(editLat) || 38.86,
                      parseFloat(editLng) || 65.78,
                    ],
                    zoom: 15,
                  }}
                >
                  <Placemark
                    geometry={[
                      parseFloat(editLat) || 38.86,
                      parseFloat(editLng) || 65.78,
                    ]}
                  />
                </Map>
              </YMaps>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold"
              >
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-bold"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        ) : (
          // Oddiy koʻrinish (oldinchi kod)
          <>
            {shop.image_url ? (
              <img
                src={shop.image_url}
                alt={shop.name}
                className="w-full h-64 object-cover rounded-2xl mb-4"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-2xl mb-4 flex items-center justify-center">
                <span className="text-gray-500">Rasm yoʻq</span>
              </div>
            )}

            <h3 className="text-2xl font-bold text-center mb-2">{shop.name}</h3>
            <p className="text-xl text-center text-green-600 font-bold mb-8">
              {shop.price_per_kg.toLocaleString()} so'm/kg
            </p>

            <button
              onClick={() =>
                window.open(
                  `https://yandex.uz/maps/?text=${shop.lat},${shop.lng}&z=17`,
                  "_blank"
                )
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl text-xl mb-3"
            >
              Yandexda ochish
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 rounded-2xl text-lg mb-2"
            >
              Tahrirlash
            </button>

            <button
              onClick={onDelete}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-lg mb-2"
            >
              Doʻkonni oʻchirish
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-600 font-bold text-lg"
            >
              Yopish
            </button>
          </>
        )}
      </div>
    </>
  );
}
