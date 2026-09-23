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
      isMounted = false; // Cleanup to prevent memory leak & infinite requests
    };
  }, [user?.id]); // Sirf Specific ID change hone par hi chalaayein (Pura 'user' object nahi)

  // Post delete karne ka handler
  // Post delete karne ka handler
  const handleDeletePost = async (postId, imageUrl) => {
    const confirmDelete = window.confirm("Kya aap zaroor is ad ko delete karna chahte hain?");
    if (!confirmDelete) return;

    try {
      setDeletingId(postId);

      // 1. Database se row delete karna
      const { data, error, count } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user?.id) // Ensure user active session owner hai
        .select(); // Return deleted rows to check success

      if (error) {
        console.error("Database Delete Error:", error);
        throw error;
      }

      // Agar policy block kare gi to 'data' empty array [] ayega
      if (!data || data.length === 0) {
        alert("Delete fail ho gaya! Supabase RLS Policy check karein (Permission Denied).");
        return;
      }

      // 2. Storage se image delete karna
      if (imageUrl) {
        const urlParts = imageUrl.split("/posts-images/");
        if (urlParts[1]) {
          const filePath = urlParts[1];
          await supabase.storage.from("posts-images").remove([filePath]);
        }
      }

      // State update karein
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
              {<p className='pb-1'>{user?.user_metadata?.full_name[0]}</p> || <User2Icon />}
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
      ) : (
        /* Ads Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:p-5 md:gap-10">

          {/* 1. Post New Ad Card */}
          <Link
            to="/postad"
            className="group min-h-75 border-2 border-dashed border-[#0a4d3c]/40 hover:border-[#0a4d3c] bg-[#effffb]/30 hover:bg-[#effffb] rounded-2xl flex flex-col justify-center items-center p-6 text-center transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="w-14 h-14 bg-[#0a4d3c]/10 group-hover:bg-[#0a4d3c] text-[#0a4d3c] group-hover:text-white rounded-full flex items-center justify-center transition-colors mb-3">
              <Plus className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-gray-800 text-base group-hover:text-[#0a4d3c] transition-colors">
              Post New Ad
            </h4>
            <p className="text-gray-500 text-xs mt-1 max-w-45">
              Click here to create and publish a new item
            </p>
          </Link>

          {/* 2. User Posted Live Ads */}
          {myAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-4/3 overflow-hidden flex justify-center items-center p-2 bg-gray-100">
                  <img
                    src={ad.image_url || "https://via.placeholder.com/300"}
                    alt={ad.title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>

                <div className="p-3 w-full">
                  <h4 className="font-bold text-gray-800 text-base line-clamp-1">{ad.title}</h4>
                  <p className="text-[#0a4d3c] font-extrabold text-sm sm:text-base mt-1">
                    PKR {Number(ad.price)?.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{ad.location || "Swabi"}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 pt-0 flex flex-col gap-2 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/editad/${ad.id}`}
                    className="bg-gray-100 text-gray-700 hover:bg-[#0a4d3c] hover:text-white flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    type="button"
                    disabled={deletingId === ad.id}
                    onClick={() => handleDeletePost(ad.id, ad.image_url)}
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === ad.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </>
                    )}
                  </button>
                </div>

                <Link
                  to={`/singleproductdetails/${ad.id}`}
                  className="bg-[#effffb] text-[#0a4d3c] border border-[#0a4d3c]/30 hover:bg-[#0a4d3c] hover:text-white flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View Ad
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};