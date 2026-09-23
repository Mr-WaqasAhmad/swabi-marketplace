
import React, { useState, useEffect } from 'react'
import { Mail, Lock, Globe, Loader2, ArrowLeft } from 'lucide-react'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const userValidations = z.object({
    userEmailOrPhoneNumber: z
        .string()
        .min(3, "Email or Phone number must be at least 3 characters")
        .max(50, "Identifier cannot exceed 50 characters"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(15, "Password cannot exceed 15 characters"),
    checkbox: z.boolean().optional()
});

export const LoginBottom = () => {
    const navigate = useNavigate();
    const [authError, setAuthError] = useState("");
    const [authSuccess, setAuthSuccess] = useState("");
    const [isForgotView, setIsForgotView] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting, isValid }
    } = useForm({ resolver: zodResolver(userValidations), mode: 'onChange' });

    // 1. REMEMBER ME LOGIC: Load saved credentials on component mount
    useEffect(() => {
        const savedIdentifier = localStorage.getItem("rememberedUser");
        const rememberMeFlag = localStorage.getItem("rememberMe");

        if (rememberMeFlag === "true" && savedIdentifier) {
            setValue("userEmailOrPhoneNumber", savedIdentifier, { shouldValidate: true });
            setValue("checkbox", true);
        }
    }, [setValue]);

    // 2. SUBMIT LOGIN
    const onSubmit = async (data) => {
        setAuthError("");
        setAuthSuccess("");

        try {
            let identifier = data.userEmailOrPhoneNumber.trim();
            let loginEmail = identifier;

            const isPhone = /^[0-9+]+$/.test(identifier);

            if (isPhone) {
                let rawPhone = identifier.startsWith("+92") ? "0" + identifier.slice(3) : identifier;
                let formattedPhone = identifier.startsWith("0") ? "+92" + identifier.slice(1) : identifier;

                // Search in profiles table
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("email")
                    .or(`phone.eq.${rawPhone},phone.eq.${formattedPhone}`)
                    .maybeSingle();

                if (profileData && profileData.email) {
                    loginEmail = profileData.email;
                } else {
                    setAuthError("No account found with this phone number. Please use your email address.");
                    return;
                }
            }

            // Supabase Login
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: data.password,
            });

            if (loginError) throw loginError;

            // Handle Remember Me Storage
            if (data.checkbox) {
                localStorage.setItem("rememberMe", "true");
                localStorage.setItem("rememberedUser", identifier);
            } else {
                localStorage.removeItem("rememberMe");
                localStorage.removeItem("rememberedUser");
            }

            setAuthSuccess("Login successful! Redirecting...");

            setTimeout(() => {
                navigate('/home');
            }, 1200);

        } catch (error) {
            setAuthError(error.message || "Invalid Email/Phone or Password!");
        }
    };

    // 3. FORGOT PASSWORD LOGIC
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setAuthError("");
        setAuthSuccess("");

        if (!forgotEmail || !forgotEmail.includes("@")) {
            setAuthError("Please enter a valid email address to reset password.");
            return;
        }

        setForgotLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setAuthSuccess("Password reset link sent to your email! Please check your inbox.");
            setForgotEmail("");
        } catch (error) {
            setAuthError(error.message || "Failed to send reset link. Try again.");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-start gap-3 px-4 pb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] my-2 text-center">
                {isForgotView ? "Reset Password" : "Welcome Back"}
            </h1>

            <div className="bg-[#e8eae8] flex flex-col items-center gap-4 p-6 sm:p-8 w-full sm:w-10/12 md:w-8/12 lg:max-w-md border border-gray-300 rounded-2xl shadow-lg transition-all duration-300">
                
                {/* Alert Messages */}
                {authError && (
                    <div className="w-full p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl font-semibold text-center">
                        {authError}
                    </div>
                )}

                {authSuccess && (
                    <div className="w-full p-3 bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs rounded-xl font-semibold text-center">
                        {authSuccess}
                    </div>
                )}

                {/* --- FORGOT PASSWORD FORM --- */}
                {isForgotView ? (
                    <form onSubmit={handleForgotPassword} className="w-full flex flex-col gap-4">
                        <p className="text-xs text-gray-600 text-center font-medium">
                            Enter your registered email address and we will send you a password reset link.
                        </p>

                        <div className="relative w-full">
                            <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                name="email"
                                id="forgot-email"
                                autoComplete="email"
                                placeholder="Your Email Address"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-3 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={forgotLoading}
                            className="w-full py-3 text-base font-semibold rounded-xl bg-[#0a4d3c] text-white shadow-md hover:bg-[#D4AF37] hover:text-[#0a4d3c] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {forgotLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Sending Link...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsForgotView(false);
                                setAuthError("");
                                setAuthSuccess("");
                            }}
                            className="flex items-center justify-center gap-1.5 font-semibold text-[#0a3a0c] text-sm mt-1 hover:underline cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </button>
                    </form>
                ) : (
                    /* --- STANDARD LOGIN FORM --- */
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                        
                        {/* Email or Phone Input */}
                        <div className="relative w-full">
                            <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                name="username"
                                id="username"
                                autoComplete="username"
                                placeholder="Email or Phone Number"
                                {...register("userEmailOrPhoneNumber")}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-3 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                            />
                            {errors.userEmailOrPhoneNumber && (
                                <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                    {errors.userEmailOrPhoneNumber.message}
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="relative w-full">
                            <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                name="password"
                                id="password"
                                autoComplete="current-password"
                                placeholder="Password"
                                {...register("password")}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-3 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                            />
                            {errors.password && (
                                <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Options Row */}
                        <div className="w-full flex justify-between items-center text-xs px-1">
                            <span className="flex items-center gap-1.5">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    {...register("checkbox")}
                                    className="accent-[#0a4d3c] w-4 h-4 cursor-pointer rounded"
                                />
                                <label htmlFor="rememberMe" className="font-semibold text-gray-700 cursor-pointer">
                                    Remember Me
                                </label>
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotView(true);
                                    setAuthError("");
                                    setAuthSuccess("");
                                }}
                                className="font-semibold text-[#0a3a0c] cursor-pointer hover:underline focus:outline-none"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className={`w-full py-3 text-base font-semibold rounded-xl mt-2 bg-[#0a4d3c] text-white shadow-md hover:bg-[#D4AF37] hover:text-[#0a4d3c] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 ${
                                isSubmitting || !isValid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Logging in...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>

                        <div className="text-center">
                            <Link
                                to="/signup"
                                className="font-semibold text-[#0a3a0c] text-sm mt-1 inline-block hover:underline"
                            >
                                New user? Sign up here
                            </Link>
                        </div>
                    </form>
                )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 mt-2">
                <Globe className="w-4 h-4 text-[#0a4d3c]" />
                <span>Language:</span>
                <span className="font-semibold text-[#0a4d3c] hover:underline cursor-pointer">
                    Pashto / Urdu
                </span>
            </div>
        </div>
    );
};