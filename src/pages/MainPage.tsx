import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Sidebar } from "../Components/Sidebar";
import { MapComponent } from "../Components/Map";
import ShopModal from "../Components/ShopModal";
import { DeleteModal } from "../Components/DeleteModal";
import { AddButton } from "../Components/AddButton";
import { useNavigate } from "react-router";
import menu from '../assets/menu1.png'

export type Shop = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  price_per_kg: number;
  district_id: number;
  image_url?: string | null; 
};
export const MainPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [modalShop, setModalShop] = useState<Shop | null>(null);
  const [deleteShop, setDeleteShop] = useState<Shop | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mapInstance, setMapInstance] = useState<any>(null);
    
    const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from("shops")
      .select("*")
      .then(({ data }) => setShops(data || []));
    const channel = supabase
      .channel("shops")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shops" },
        () => {
          supabase
            .from("shops")
            .select("*")
            .then(({ data }) => setShops(data || []));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedDistrict && mapInstance) {
      mapInstance.setCenter(selectedDistrict.center, 12, { duration: 800 });
    }
  }, [selectedDistrict, mapInstance]);

  const handleDelete = async (shop: Shop) => {
    await supabase.from("shops").delete().eq("id", shop.id);
    setShops((prev) => prev.filter((s) => s.id !== shop.id));
    setDeleteShop(null);
    setModalShop(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      <header className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-3xl w-10 h-9"
        >
          <img src={menu} alt="" />
        </button>
        <h1 className="text-2xl font-bold max-[385px]:opacity-0">
          {selectedDistrict ? selectedDistrict.name : "Qashqadaryo Do'konlari"}
        </h1>
        <div className="w-10" />
      </header>

      <Sidebar
        selectedDistrict={selectedDistrict}
        onSelect={(d) => {
          setSelectedDistrict(d);
          if (window.innerWidth < 768) setSidebarOpen(false);
        }}
        onBack={() => setSelectedDistrict(null)}
        shops={shops}
        onShopClick={setModalShop}
        onAddClick={(id) =>
          navigate("/add-shop", { state: { districtId: id } })
        }
        onDeleteClick={setDeleteShop}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 mt-16">
        <MapComponent
          selectedDistrict={selectedDistrict}
          shops={
            selectedDistrict
              ? shops.filter((s) => s.district_id === selectedDistrict.id)
              : shops
          }
          onDistrictClick={(d) => {
            setSelectedDistrict(d);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
          onShopClick={setModalShop}
          mapRef={setMapInstance}
        />
      </div>

      <AddButton />

      {modalShop && (
        <ShopModal
          shop={modalShop}
          onUpdate={() => {}}
          onClose={() => setModalShop(null)}
          onDelete={() => setDeleteShop(modalShop)}
        />
      )}

      {deleteShop && (
        <DeleteModal
          shop={deleteShop}
          onConfirm={() => handleDelete(deleteShop)}
          onCancel={() => setDeleteShop(null)}
        />
      )}
    </div>
  );
};
