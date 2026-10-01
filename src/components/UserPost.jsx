import { Edit3, Eye, MapPin, Plus, Settings, Trash2, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useUser } from "../contexts/UserDetailsContext";

export const UserPost = () => {
  const { user } = useUser();
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserPosts = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (isMounted) {
          setMyAds(data || []);
        }
      } catch (err) {
        console.error("Error fetching user posts:", err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserPosts();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Post delete handler
  const handleDeletePost = async (postId, imageUrl) => {
    const confirmDelete = window.confirm("Kya aap zaroor is ad ko delete karna chahte hain?");
    if (!confirmDelete) return;

    try {
      setDeletingId(postId);

      const { data, error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user?.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("Delete fail ho gaya! Supabase RLS Policy check karein (Permission Denied).");
        return;
      }

      // Storage se image delete
      if (imageUrl) {
        const urlParts = imageUrl.split("/posts-images/");
        if (urlParts[1]) {
          const filePath = urlParts[1];
          await supabase.storage.from("posts-images").remove([filePath]);
        }
      }

      setMyAds((prev) => prev.filter((item) => item.id !== postId));
      alert("Ad kamyabi se delete ho gaya!");
    } catch (err) {
      console.error("Delete error:", err.message);
      alert("Ad delete nahi ho saka: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="mt-16 p-3 sm:p-6 max-w-7xl mx-auto select-none min-h-[calc(100vh-4rem)] bg-gray-50">

      {/* Profile Header Banner */}
      <div className="bg-[#effffb] border border-[#0a4d3c]/20 p-4 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex justify-center items-center text-[33px] rounded-full bg-[#3b053d] font-semibold text-white">
              <p className="pb-1">{user?.user_metadata?.full_name?.[0] || "U"}</p>
            </div>
            <div className="flex flex-col">
              <h2 className="text-gray-900 text-xl sm:text-2xl font-bold">
                {userName}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                {user?.email}
              </p>
            </div>
          </div>

          <Link
            to="/userprofile"
            className="flex items-center gap-2 bg-white text-[#0a4d3c] border border-[#0a4d3c]/30 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0a4d3c] hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <Settings
              className="w-4 h-4 animate-spin"
              style={{ animation: "spin 2s ease-in-out infinite" }}
            />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Section Title & Header Info */}
      <div className="flex items-center justify-between my-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">My Posted Ads</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-medium text-[#0a4d3c] bg-[#effffb] px-3 py-1 rounded-full border border-[#0a4d3c]/20">
            Total: {myAds.length} Ads
          </span>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#0a4d3c]">
          <Loader2 className="w-10 h-10 animate-spin mb-2" />
          <p className="text-sm font-semibold">Aapke ads load ho rahe hain...</p>
        </div>
      ) : myAds.length === 0 ? (
        /* ✅ Empty State — Full Width Stylish Card */
        <div className="w-full">
          <Link
            to="/postad"
            className="group w-full min-h-80 sm:min-h-96 border-2 border-dashed border-[#0a4d3c]/40 hover:border-[#0a4d3c] bg-gradient-to-br from-[#effffb] to-white hover:from-[#dffff5] hover:to-[#effffb] rounded-3xl flex flex-col justify-center items-center p-8 sm:p-12 text-center transition-all cursor-pointer shadow-sm hover:shadow-lg"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#0a4d3c]/10 group-hover:bg-[#0a4d3c] text-[#0a4d3c] group-hover:text-white rounded-full flex items-center justify-center transition-all duration-300 mb-5 group-hover:scale-110">
              <Plus className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-[#0a4d3c] transition-colors mb-2">
              Post Your First Ad
            </h3>

            <p className="text-sm sm:text-base text-gray-500 max-w-md leading-relaxed mb-4">
              Aap ne abhi tak koi ad post nahi ki. Apni pehli cheez post karein aur hazaron buyers tak pohanchayein.
            </p>

            <div className="flex items-center gap-2 bg-[#0a4d3c] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md group-hover:bg-[#D4AF37] group-hover:text-[#0a4d3c] transition-all">
              <Plus className="w-4 h-4" />
              <span>Post New Ad</span>
            </div>

            <p className="text-xs text-gray-400 mt-4 font-medium">
              FREE • 2 minute mein post ho jayegi
            </p>
          </Link>
        </div>
      ) : (
        /* ✅ Ads Grid — Jab Ads Hain */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">

          {/* Post New Ad Card (chhota) */}
          <Link
            to="/postad"
            className="group min-h-75 border-2 border-dashed border-[#0a4d3c]/40 hover:border-[#0a4d3c] bg-[#effffb]/30 hover:bg-[#effffb] rounded-2xl flex flex-col justify-center items-center p-4 text-center transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0a4d3c]/10 group-hover:bg-[#0a4d3c] text-[#0a4d3c] group-hover:text-white rounded-full flex items-center justify-center transition-colors mb-3">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h4 className="font-bold text-gray-800 text-sm sm:text-base group-hover:text-[#0a4d3c] transition-colors">
              Post New Ad
            </h4>
            <p className="text-gray-500 text-[10px] sm:text-xs mt-1">
              Create a new item
            </p>
          </Link>

          {/* User Posted Ads */}
          {myAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-square overflow-hidden flex justify-center items-center p-2 bg-gray-100">
                  <img
                    src={ad.image_url || "https://via.placeholder.com/300"}
                    alt={ad.title}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                <div className="p-2 sm:p-3 w-full">
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-1">
                    {ad.title}
                  </h4>
                  <p className="text-[#0a4d3c] font-extrabold text-xs sm:text-sm mt-1">
                    PKR {Number(ad.price)?.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mt-1.5">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate">{ad.location || "Swabi"}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 sm:p-3 pt-0 flex flex-col gap-1.5 mt-1">
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to={`/postad/${ad.id}`}
                    className="bg-gray-100 text-gray-700 hover:bg-[#0a4d3c] hover:text-white flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </Link>
                  <button
                    type="button"
                    disabled={deletingId === ad.id}
                    onClick={() => handleDeletePost(ad.id, ad.image_url)}
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === ad.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3" /> Delete
                      </>
                    )}
                  </button>
                </div>

                <Link
                  to={`/singleproductdetails/${ad.id}`}
                  className="bg-[#effffb] text-[#0a4d3c] border border-[#0a4d3c]/30 hover:bg-[#0a4d3c] hover:text-white flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3 h-3" /> View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
