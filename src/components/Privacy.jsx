import React from 'react'
import { ShieldCheck, Lock, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Privacy = () => {
    return (
        <div className="min-h-screen bg-[#e8eae8] flex flex-col items-center justify-start mt-16 px-4 sm:px-6 lg:px-8 select-none">
            
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
                        <Lock className="w-8 h-8 text-[#0a4d3c]" /> Privacy Policy
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Last Updated: September 2026
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-gray-700">
                    
                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a4d3c] mb-2">
                            1. Aapka Data Aur Maloomat
                        </h2>
                        <p>
                            Hum aapka Naame, Email, Phone Number, aur Address sirf account verification aur local deals ke rabte ke liye collect karte hain.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a4d3c] mb-2">
                            2. Data Security
                        </h2>
                        <p>
                            Aapka data aur passwords fully encrypted aur secure rehte hain. Hum aapki kisi bhi personal information ko kisi teesri party (third party) ko sell ya share nahi karte.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a4d3c] mb-2">
                            3. Contact Information Ka Istemal
                        </h2>
                        <p>
                            Aap ka Phone Number aur Address sirf buyer/seller se direct deal aur contact ke liye istemal hota hai taake local trade aasan ho sake.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a4d3c] mb-2">
                            4. Cookies Aur Preferences
                        </h2>
                        <p>
                            Hum website ki performance aur user experience ko behtar banane ke liye basic cookies istemal karte hain.
                        </p>
                    </section>

                    <div className="bg-[#e8eae8] border-l-4 border-[#0a4d3c] p-4 rounded-r-xl flex items-start gap-3 mt-8">
                        <AlertCircle className="w-6 h-6 text-[#0a4d3c] shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-gray-800">
                            Aap ka trust hamari pehli tarjeeh hai. Agar aapko privacy ke hawale se koi sawal hai toh hum se rabta kar sakte hain.
                        </p>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
                    <Link
                        to="/signup"
                        className="py-3 px-8 text-base font-semibold rounded-xl bg-[#0a4d3c] text-white shadow-md hover:bg-[#D4AF37] hover:text-[#0a4d3c] transition-all duration-200"
                    >
                        I Understand & Back to Signup
                    </Link>
                </div>

            </div>
        </div>
    )
}