import React, { useState, useEffect } from "react";
import { ImagePlus, MapPin, ShieldCheck, Upload, X, Loader2, Tag, ArrowLeft } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useUser } from "../contexts/UserDetailsContext";
import { categories } from "./CategorySelector";

export const PostAd = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ ID se edit mode pata chalega
  const { user } = useUser();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    warranty: "",
    location: "",
    description: "",
    category: "",
  });

  const [compressedFile, setCompressedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ EDIT MODE: Purani details load karein
  useEffect(() => {
    const fetchAdData = async () => {
      if (!id || !user?.id) return;
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Ad nahi mili ya aap owner nahi hain.");

        setFormData({
          title: data.title || "",
          price: data.price || "",
          warranty: data.warranty || "",
          location: data.location || "",
          description: data.description || "",
          category: data.category || "",
        });
        setCurrentImageUrl(data.image_url || "");
      } catch (err) {
        setErrorMsg(err.message || "Ad load nahi ho saki.");
      } finally {
        setFetching(false);
      }
    };
    fetchAdData();
  }, [id, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDimension = 1000;

          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const newFile = new File([blob], `${Date.now()}.jpg`, {
                  type: "image/jpeg",
                });
                resolve(newFile);
              } else {
                reject(new Error("Compression failed"));
              }
            },
            "image/jpeg",
            0.6
          );
        };
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMsg("");
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setCompressedFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch (error) {
      setErrorMsg("Image process karne me masla aaya.");
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveNewImage = () => {
    setCompressedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      setErrorMsg("Pehle login karein.");
      return;
    }

    if (!isEditMode && !compressedFile) {
      setErrorMsg("Kripya item ki picture select karein.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = currentImageUrl;

      if (compressedFile) {
        const fileName = `${user.id}/${Date.now()}.jpg`;

        const { error: storageError } = await supabase.storage
          .from("posts-images")
          .upload(fileName, compressedFile, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: false,
          });

        if (storageError) throw storageError;

        const { data: publicUrlData } = supabase.storage
          .from("posts-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;

        // Edit mode: purani image delete
        if (isEditMode && currentImageUrl) {
          const oldPath = currentImageUrl.split("/posts-images/")[1];
          if (oldPath) {
            await supabase.storage.from("posts-images").remove([oldPath]);
          }
        }
      }

      if (isEditMode) {
        // ✅ UPDATE
        const { data: updatedRows, error: dbError } = await supabase
          .from("posts")
          .update({
            title: formData.title,
            price: Number(formData.price),
            warranty: formData.warranty,
            location: formData.location,
            description: formData.description,
            category: formData.category,
            image_url: imageUrl,
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select();

        if (dbError) throw dbError;
        if (!updatedRows || updatedRows.length === 0) {
          throw new Error("Update nahi hua — permission issue.");
        }

        alert("Ad successfully update ho gayi!");
        navigate("/userpost");
      } else {
        // ✅ INSERT
        const { error: dbError } = await supabase.from("posts").insert([
          {
            user_id: user.id,
            title: formData.title,
            price: Number(formData.price),
            warranty: formData.warranty,
            location: formData.location,
            description: formData.description,
            image_url: imageUrl,
            category: formData.category,
          },
        ]);

        if (dbError) throw dbError;

        alert("Ad successfully publish ho gaya!");
        navigate("/userpost");
      }
    } catch (err) {
      setErrorMsg(err.message || "Kuch masla aaya.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="mt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0a4d3c]" />
      </div>
    );
  }

  return (
    <div className="mt-16 p-3 sm:p-6 max-w-7xl mx-auto select-none min-h-[calc(100vh-4rem)] bg-white">
      <div className="w-full">
        <div className="max-w-3xl bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-sm mx-auto">

          {isEditMode && (
            <Link
              to="/userpost"
              className="inline-flex items-center gap-2 text-[#0a4d3c] font-semibold text-sm hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to My Ads
            </Link>
          )}

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
            {isEditMode ? "Edit Ad" : "Post New Ad"}
          </h2>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs sm:text-sm rounded-xl text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

            {/* Image */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4 text-[#0a4d3c]" /> Item Image
                {isEditMode && <span className="text-xs font-normal text-gray-500">(change karna ho to click karein)</span>}
              </label>
              <div className="relative border-2 border-dashed border-gray-300 hover:border-[#0a4d3c] bg-gray-50 hover:bg-[#effffb]/40 rounded-2xl p-4 transition-all flex flex-col items-center justify-center min-h-45 text-center overflow-hidden">
                {!imagePreview && !compressing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    required={!isEditMode}
                  />
                )}
                {compressing ? (
                  <div className="flex flex-col items-center gap-2 text-[#0a4d3c]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-semibold">Compressing Image...</span>
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full h-48 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={handleRemoveNewImage} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full z-20">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-[#0a4d3c] text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
                      New image selected
                    </div>
                  </div>
                ) : currentImageUrl ? (
                  <div className="relative w-full h-48 flex items-center justify-center">
                    <img src={currentImageUrl} alt="Current" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                    <div className="absolute bottom-2 left-2 bg-white/95 text-gray-800 text-[10px] font-semibold px-2 py-1 rounded-lg border border-gray-200">
                      Current image — click to change
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500 pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 text-[#0a4d3c]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">
                      Click or drag photo here to upload
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Auto-compressed (around 80KB - 150KB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Title + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">Ad Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Alto Car 2021 VXR Model" required className="w-full border focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">Price (PKR)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 120000" required className="w-full border focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 transition-all" />
              </div>
            </div>

            {/* Category + Warranty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#0a4d3c]" /> Category
                </label>
                <select name="category" value={formData.category} onChange={handleChange} required className="w-full border focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 transition-all bg-white cursor-pointer">
                  <option value="" hidden>Select Category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0a4d3c]" /> Warranty
                </label>
                <input type="text" name="warranty" value={formData.warranty} onChange={handleChange} required className="w-full border focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 bg-white text-gray-800 transition-all" placeholder="e.g. 1 year / No Warranty" />
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0a4d3c]" /> Location
              </label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Swabi Adda, Swabi" required className="w-full border focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 transition-all" />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <textarea name="description" rows="4" value={formData.description} onChange={handleChange} placeholder="Describe your item condition, features, reason for selling..." required className="w-full border focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 resize-none transition-all"></textarea>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || compressing} className="mt-2 w-full bg-[#0a4d3c] hover:bg-[#07382c] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isEditMode ? "Updating..." : "Publishing..."}</span>
                </>
              ) : (
                isEditMode ? "Save Changes" : "Publish Ad Now"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
