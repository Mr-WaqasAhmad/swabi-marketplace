import React, { useEffect, useState } from "react";
import { Edit2, Mail, MapPin, Save, User, Trash2, Loader2, Phone, LogOut, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "../contexts/UserDetailsContext";
import { supabase } from "./supabaseClient";

const userImg = new URL("../assets/images/profile.jpg", import.meta.url).href;

const profileSchema = z.object({
  fullName: z
    .string()
    .min(3, "Naam kam se kam 3 characters ka hona chahiye")
    .max(50, "Naam ziada se ziada 50 characters ka ho sakta hai"),
  phone: z
    .string()
    .min(10, "Phone number kam se kam 10 digits ka hona chahiye")
    .max(15, "Phone number ziada se ziada 15 digits ka ho sakta hai")
    .regex(/^[0-9+\s-]+$/, "Sahi phone number darj karein"),
  address: z
    .string()
    .min(5, "Address kam se kam 5 characters ka hona chahiye"),
});

export const UserProfile = () => {
  const { user, setUserData } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const firstNameLetter = user?.full_name?.trim()?.[0] || user?.user_metadata?.full_name?.trim()?.[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
    },
  });

  // ✅ Sync form with latest user data (user object change hone par bhi)
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.full_name || user.user_metadata?.full_name || "",
        phone: user.phone || user.user_metadata?.phone || "",
        address: user.location || user.address || user.user_metadata?.location || "",
      });
    }
  }, [user, reset]);

  // ✅ UPDATED: Profile update with .select() confirmation
  const onUpdateProfile = async (formData) => {
    if (!user?.id) {
      setFeedback({ type: "error", message: "User session nahi mila." });
      return;
    }

    setIsUpdating(true);
    setFeedback({ type: "", message: "" });

    try {
      // 1. Auth metadata update (login/session ke liye)
      const { data: authData, error: authErr } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          location: formData.address,
        },
      });

      if (authErr) throw authErr;

      // 2. ✅ Profiles table update WITH .select() — confirm karne ke liye
      const { data: updatedRows, error: dbErr } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          location: formData.address,
        })
        .eq("id", user.id)
        .select();

      if (dbErr) throw dbErr;

      // 3. ✅ Confirm karein ke actually row update hui
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(
          "Profile update DB mein save nahi hua! Supabase RLS UPDATE policy check karein."
        );
      }

      console.log("✅ DB Update Confirmed:", updatedRows[0]);

      // 4. ✅ Local state update — taake UI turant refresh ho
      setUserData((prev) => ({
        ...prev,
        ...authData.user,
        full_name: formData.fullName,
        phone: formData.phone,
        location: formData.address,
        user_metadata: {
          ...prev?.user_metadata,
          full_name: formData.fullName,
          phone: formData.phone,
          location: formData.address,
        },
      }));

      setFeedback({
        type: "success",
        message: "Profile successfully update ho gayi! Ab har jagah naya data show hoga.",
      });
    } catch (err) {
      console.error("Update error:", err);
      setFeedback({
        type: "error",
        message: err.message || "Update karne me masla aaya.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setUserData(null);
      window.location.href = "/login";
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Logout karne mein masla aaya.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Kya aap apna account aur tamam details hamesha ke liye delete karna chahte hain?"
    );

    if (!confirmDelete || !user?.id) return;

    setIsDeleting(true);

    try {
      const { error: profileErr } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileErr) throw profileErr;

      await supabase.rpc("delete_user");
      await supabase.auth.signOut();

      setUserData(null);
      window.location.href = "/login";
    } catch (err) {
      await supabase.auth.signOut();
      setUserData(null);
      window.location.href = "/login";
    } finally {
      setIsDeleting(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
    : "Swabi Market";

  return (
    <div className="mt-16 p-3 sm:p-6 max-w-4xl mx-auto select-none min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="bg-[#effffb] border border-[#0a4d3c]/20 p-4 sm:p-6 rounded-2xl shadow-sm mb-6 flex flex-col items-center gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Manage and update your account details
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-sm">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-25 h-25 rounded-full flex justify-center items-center text-7xl pb-1 bg-[#3b053d] font-semibold text-white">
            {firstNameLetter || <User size={40} />}
          </div>
          <h2 className="mt-3 font-bold text-lg text-gray-800">
            {user?.full_name || user?.user_metadata?.full_name || "User"}
          </h2>
          <p className="text-xs text-gray-500">Member since {memberSince}</p>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs sm:text-sm text-center font-medium ${feedback.type === "success"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-red-100 text-red-800 border border-red-300"
              }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onUpdateProfile)}
          className="flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#0a4d3c]" /> Full Name
                </span>
              </label>
              <input
                type="text"
                {...register("fullName")}
                placeholder="Enter full name"
                className={`w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#0a4d3c] focus:bg-white text-gray-700 ${errors.fullName ? "border-red-500 bg-red-50" : "border-gray-200"
                  }`}
              />
              {errors.fullName && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.fullName.message}
                </span>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#0a4d3c]" /> Phone Number
                </span>
              </label>
              <input
                type="text"
                {...register("phone")}
                placeholder="e.g. 03001234567"
                className={`w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#0a4d3c] focus:bg-white text-gray-700 ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-200"
                  }`}
              />
              {errors.phone && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.phone.message}
                </span>
              )}
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#0a4d3c]" /> Email Address
              </span>
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || ""}
              className="w-full border text-gray-500 bg-gray-100 cursor-not-allowed rounded-xl p-2.5 text-sm focus:outline-none border-gray-200"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0a4d3c]" /> Address
              </span>
            </label>
            <textarea
              rows="3"
              {...register("address")}
              placeholder="Enter your address"
              className={`w-full border rounded-xl p-2.5 text-sm resize-none focus:outline-none focus:border-[#0a4d3c] focus:bg-white text-gray-700 ${errors.address ? "border-red-500 bg-red-50" : "border-gray-200"
                }`}
            ></textarea>
            {errors.address && (
              <span className="text-xs text-red-500 font-medium">
                {errors.address.message}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#0a4d3c] hover:bg-[#07382c] text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer text-sm disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isUpdating ? "Updating..." : "Update Profile"}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-xl transition-all border border-gray-300 flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 text-white" />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-10 border border-red-200 bg-red-50/50 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-red-700">Danger Zone</h3>
          </div>
          <p className="text-xs text-red-600/80 mb-4">
            Aapka account aur usse juda sara data hamesha ke liye delete ho jayega. Yeh action undo nahi ho sakta.
          </p>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full sm:w-auto py-2.5 px-5 bg-red-600 text-white hover:bg-red-700 font-medium rounded-xl shadow-sm transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{isDeleting ? "Deleting Account..." : "Delete Account"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};