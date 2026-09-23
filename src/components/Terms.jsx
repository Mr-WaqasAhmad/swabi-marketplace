import React from 'react'
import { ShieldCheck, FileText, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Terms = () => {
    return (
        <div className="min-h-screen bg-[#e8eae8] flex flex-col items-center justify-start py-2 px-4 sm:px-6 lg:px-8 select-none mt-16">

            {/* Header / Back Link */}

            <div className="w-full text-[#0a4d3c] font-bold flex justify-center items-center gap-2 text-xl my-2 sm:text-3xl">
                <ShieldCheck className="w-7 h-7" />
                <span>Swabi Marketplace</span>
            </div>

            {/* Main Content Card */}
            <div className="w-full max-w-4xl bg-white border border-gray-300 rounded-2xl shadow-lg p-6 sm:p-10 text-gray-800 transition-all duration-300">

                {/* Title */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] flex items-center gap-2">
                        <FileText className="w-8 h-8 text-[#0a4d3c]" /> Terms of Service
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Last Updated: September 2026
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-gray-700">

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a4d3c] mb-2">
                            1. Platform Ka Istemal
                        </h2>
                        <p>
                            Swabi Marketplace mein khush aamdeed! Yeh platform local buyers aur sellers ko apas mein jodne ke liye banaya gaya hai. Hamare platform ko istemal karte waqt aapko hamari sharaait aur rules ko follow karna zaroori hoga.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a4d3c] mb-2">
                            2. Account Rules
                        </h2>
                        <p>
                            Aap ko apna account aur password secure rakhna hoga. Kisi bhi qisam ki ghair-qanooni activity ya ghalat details dene par aap ka account bina kisi ittela ke suspend kiya ja sakta hai.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a4d3c] mb-2">
                            3. Kharid-o-Farookht (Buying & Selling Rules)
                        </h2>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>Kisi bhi ghair-qanooni (illegal) ya prohibited item ko bechne ki ijazat nahi hai.</li>
                            <li>Sellers ko apne products ki sahi detail aur original images deni paregi.</li>
                            <li>Buyers aur sellers apas ki deals ki zimmedari khud uthayenge.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a4d3c] mb-2">
                            4. Rules Mein Tabdeeli
                        </h2>
                        <p>
                            Swabi Marketplace ko yeh haq hasil hai ke woh kisi bhi waqt apni sharaait mein tabdeeli kar sake. Naye rules aapko platform par bata diye jayenge.
                        </p>
                    </section>

                    <div className="bg-[#e8eae8] border-l-4 border-[#0a4d3c] p-4 rounded-r-xl flex items-start gap-3 mt-8">
                        <AlertCircle className="w-6 h-6 text-[#0a4d3c] shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-gray-800">
                            Swabi Marketplace ke rules ko follow karke aap platform ko sab ke liye safe aur serve-friendly banate hain.
                        </p>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
                    <Link
                        to="/signup"
                        className="py-3 px-8 text-base font-semibold rounded-xl bg-[#0a4d3c] text-white shadow-md hover:bg-[#D4AF37] hover:text-[#0a4d3c] transition-all duration-200"
                    >
                        I Agree & Back to Signup
                    </Link>
                </div>

            </div>
        </div>
    )
}