import React, { useState } from 'react'
import { LoginTop } from './LoginTop'
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Globe, PhoneCall, Home, User2, UserCheck2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { supabase } from './supabaseClient';

const userValidations = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters").max(20, "First name cannot exceed 20 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters").max(20, "Last name cannot exceed 20 characters"),
    email: z.string().email("Invalid email address"),
    userPhoneNumber: z.string().min(11, "Phone number must be at least 11 digits").max(11, "Phone number cannot exceed 11 digits"),
    password: z.string().min(8, "Password must be at least 8 characters").max(15, "Password cannot exceed 15 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters").max(15, "Password cannot exceed 15 characters"),
    userAddress: z.string().min(4, "Address must be at least 4 characters").max(80, "Address cannot exceed 80 characters"),
    checkbox: z.literal(true, {
        errorMap: () => ({ message: "You must agree to the Terms of Service & Privacy Policy" }),
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const Signup = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [authError, setAuthError] = useState("");
    const [authSuccess, setAuthSuccess] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting, isValid }
    } = useForm({
        resolver: zodResolver(userValidations),
        mode: 'onChange'
    });

    const passwordValue = watch("password");
    const confirmPasswordValue = watch("confirmPassword");

    const onSubmit = async (data) => {
        setAuthError("");
        setAuthSuccess("");

        try {
            const trimmedPhone = data.userPhoneNumber.trim();
            let rawPhone = trimmedPhone.startsWith("+92") ? "0" + trimmedPhone.slice(3) : trimmedPhone;
            let formattedPhone = trimmedPhone.startsWith("0") ? "+92" + trimmedPhone.slice(1) : trimmedPhone;

            // 1. Duplicate phone check
            const { data: existingPhone, error: phoneCheckError } = await supabase
                .from("profiles")
                .select("phone")
                .or(`phone.eq.${rawPhone},phone.eq.${formattedPhone}`)
                .maybeSingle();

            if (phoneCheckError) {
                console.error("Phone check error:", phoneCheckError.message);
            }

            if (existingPhone) {
                setAuthError("This phone number is already registered! Please use a different number.");
                return;
            }

            const fullName = `${data.firstName} ${data.lastName}`.trim();

            // 2. Supabase Auth Signup
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: data.email.trim(),
                password: data.password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: rawPhone,
                        location: data.userAddress,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // 3. Save profile details
            if (authData.user) {
                const { error: profileError } = await supabase.from("profiles").upsert([
                    {
                        id: authData.user.id,
                        email: data.email.trim(),
                        full_name: fullName,
                        phone: rawPhone,
                        location: data.userAddress,
                    },
                ]);

                if (profileError) throw profileError;
            }

            // 4. Clear active session so app won't think user is logged in automatically
            await supabase.auth.signOut();

            setAuthSuccess(
                "Account created successfully! Redirecting to login page..."
            );

            reset();

            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1000);

        } catch (error) {
            setAuthError(error.message || "Signup failed. Please try again.");
        }
    }

    return (
        <div className="flex flex-col w-full min-h-screen justify-center items-center select-none bg-[#e8eae8]">
            <LoginTop />

            <div className="w-full flex flex-col items-center justify-start gap-3 px-4 pb-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] my-2 text-center lg:text-4xl">
                    Sign Up
                </h1>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-[#e8eae8] flex flex-col items-center gap-4 p-6 sm:p-8 w-full sm:w-10/12 md:w-8/12 lg:max-w-xl border border-gray-300 rounded-2xl shadow-lg transition-all duration-300"
                >

                    {/* Backend Error/Success Alert Messages */}
                    {authError && (
                        <div className="w-full p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl font-semibold text-center">
                            {authError}
                        </div>
                    )}

                    {authSuccess && (
                        <div className="w-full p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs sm:text-sm rounded-xl font-semibold text-center leading-relaxed">
                            {authSuccess}
                        </div>
                    )}

                    {/* User Name */}
                    <div className='flex flex-col gap-3 w-full sm:flex-row'>
                        <div className="relative w-full">
                            <User2 className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="First Name"
                                autoComplete='off'
                                {...register("firstName")}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-3 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                            />
                            {errors.firstName && (
                                <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>

                        <div className="relative w-full">
                            <UserCheck2 className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Last Name"
                                autoComplete='off'
                                {...register("lastName")}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-3 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                            />
                            {errors.lastName && (
                                <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* User Password */}
                    <div className='flex flex-col gap-3 w-full sm:flex-row'>
                        <div className="relative w-full">
                            <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                autoComplete='off'
                                {...register("password")}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-10 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>

                            {errors.password && (
                                <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="relative w-full">
                            <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                autoComplete='off'
                                {...register("confirmPassword")}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-10 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>

                            {(errors.confirmPassword || (confirmPasswordValue && passwordValue !== confirmPasswordValue)) && (
                                <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                    {errors.confirmPassword?.message || "Passwords do not match"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* User Email & Phone */}
                    <div className='flex flex-col gap-3 w-full sm:flex-row'>
                        <div className="relative w-full">
                            <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                autoComplete='off'
                                {...register("email")}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-3 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                            />
                            {errors.email && (
                                <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="relative w-full">
                            <PhoneCall className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="tel"
                                placeholder="e.g. 03100094241"
                                autoComplete='off'
                                {...register("userPhoneNumber")}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-3 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                            />
                            {errors.userPhoneNumber && (
                                <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                    {errors.userPhoneNumber.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* User Address */}
                    <div className='w-full'>
                        <div className="relative w-full">
                            <Home className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Address"
                                autoComplete='off'
                                {...register("userAddress")}
                                className="border border-gray-300 rounded-xl py-3 pl-11 pr-3 placeholder:text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#0a4d3c] bg-white text-sm transition-all shadow-sm"
                            />
                            {errors.userAddress && (
                                <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                    {errors.userAddress.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Terms & Conditions Checkbox */}
                    <div className="w-full flex flex-col text-xs px-2">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                {...register("checkbox")}
                                className="accent-[#0a4d3c] w-4 h-4 cursor-pointer rounded mr-1 sm:mr-4"
                            />
                            <label htmlFor="rememberMe" className="font-semibold text-[#0a4d3c] w-full text-nowrap text-[10px] sm:text-[12px]">
                                I agree to the <Link to={"/terms"} className='text-blue-700'>Terms of Service</Link> & <Link to={"/privacy"} className='text-blue-700'>Privacy Policy</Link>.
                            </label>
                        </div>
                        {errors.checkbox && (
                            <p className="text-red-600 text-xs mt-1 font-medium px-1">
                                {errors.checkbox.message}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !isValid || passwordValue !== confirmPasswordValue}
                        className={`w-full py-3 text-base font-semibold rounded-xl mt-2 bg-[#0a4d3c] text-white shadow-md hover:bg-[#D4AF37] hover:text-[#0a4d3c] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 ${isSubmitting || !isValid || passwordValue !== confirmPasswordValue
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </button>

                    <Link
                        to="/login"
                        className="font-semibold text-blue-700 text-sm mt-1 hover:underline"
                    >
                        Already have an account? Login here
                    </Link>
                </form>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 mt-2">
                    <Globe className="w-4 h-4 text-[#0a4d3c]" />
                    <span>Language:</span>
                    <span className="font-semibold text-[#0a4d3c] hover:underline cursor-pointer">
                        Pashto / Urdu
                    </span>
                </div>

            </div>
        </div>
    )
}