import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import districtsData from "../data/districts";

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

function ShopModal({
  shop,
  onClose,
  onDelete,
  onUpdate,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);

  // Edit rejimi
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(shop.name);
  const [editDistrictId, setEditDistrictId] = useState(
    shop.district_id.toString()
  );
  const [editLat, setEditLat] = useState(shop.lat.toString());
  const [editLng, setEditLng] = useState(shop.lng.toString());
  const [editPrice, setEditPrice] = useState(shop.price_per_kg.toString());
  const [saving, setSaving] = useState(false);

  const openYandex = () => {
    window.open(
      `https://yandex.uz/maps/?text=${shop.lat},${shop.lng}&z=17`,
      "_blank"
    );
  };

  // Tortib yopish (iPhone kabi)
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientY < 120) {
        startY.current = e.touches[0].clientY;
        modal.style.transition = "none";
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      e.preventDefault();

      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY > 0) {
        modal.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const handleTouchEnd = () => {
      if (startY.current === null) return;

      const deltaY = modal.getBoundingClientRect().top;
      modal.style.transition = "transform 0.3s ease-out";

      if (deltaY > 150) {
        modal.style.transform = "translateY(100vh)";
        setTimeout(onClose, 300);
      } else {
        modal.style.transform = "translateY(0)";
      }

      startY.current = null;
    };

    modal.addEventListener("touchstart", handleTouchStart, { passive: true });
    modal.addEventListener("touchmove", handleTouchMove, { passive: false });
    modal.addEventListener("touchend", handleTouchEnd);

    return () => {
      modal.removeEventListener("touchstart", handleTouchStart);
      modal.removeEventListener("touchmove", handleTouchMove);
      modal.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onClose]);

  // Tahrirlash → saqlash
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("shops")
      .update({
        name: editName,
        district_id: parseInt(editDistrictId),
        lat: parseFloat(editLat),
        lng: parseFloat(editLng),
        price_per_kg: parseInt(editPrice),
      })
      .eq("id", shop.id);

    setSaving(false);
    if (error) {
      alert("Xato: " + error.message);
    } else {
      setIsEditing(false);
      onUpdate();
    }
  };

  return (
    <>
      {/* Orqa fon – bosganda yopiladi */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl p-6 z-50"
        style={{
          transform: "translateY(0)",
          transition: "transform 0.3s ease-out",
        }}
      >
        {/* Tutqich */}
        <div className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-6" />

        {/* Rasm */}
        {shop.image_url ? (
          <img
            src={shop.image_url}
            alt={shop.name}
            className="w-full h-64 object-cover rounded-2xl mb-4"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-2xl mb-4 flex items-center justify-center">
            <span className="text-gray-500 text-xl">Rasm yoʻq</span>
          </div>
        )}

        {/* Edit rejimi */}
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
              placeholder="Do'kon nomi"
            />
            <select
              value={editDistrictId}
              onChange={(e) => setEditDistrictId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
            >
              <option value="">Tumanni tanlang</option>
              {districtsData.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
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
              placeholder="Narx"
              className="w-full px-4 py-3 border-2 rounded-xl"
            />

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
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-xl font-bold"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-center mb-2">{shop.name}</h3>
            <p className="text-xl text-center text-green-600 font-bold mb-8">
              {shop.price_per_kg.toLocaleString()} so'm/kg
            </p>

            <button
              onClick={openYandex}
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
export default ShopModal;