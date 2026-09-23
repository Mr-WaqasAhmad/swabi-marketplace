import { Link , useLocation } from "react-router-dom";
import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'; // Sahi path set karein
const github = new URL('../assets/images/github.png', import.meta.url).href;
const facebook = new URL('../assets/images/facebook.png', import.meta.url).href;
const whatsapp = new URL('../assets/images/whatsapp.png', import.meta.url).href;
import {
    MapPin,
    Phone,
    Mail,
    Code2,
    ExternalLink,
    Globe,
    Heart
} from "lucide-react";

export const Footer = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";
    const isSignUpPage = location.pathname === "/signup";
    const isIndexPage = location.pathname === "/";

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (isLoginPage || isSignUpPage) return null;
    if (!isLoggedIn && isIndexPage) return null;
    return (
        <footer className="bg-gray-900 text-gray-300 pt-8 mt-20 pb-6 border-t border-gray-800 select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 border-b border-gray-800">

                    {/* Col 1: Brand Info */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#0a4d3c] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                                S
                            </div>
                            <span className="text-xl font-black text-white tracking-wide">
                                Swabi <span className="text-[#effffb]">Market</span>
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed font-medium">
                            Swabi ka sabse bada aur bharosemand online marketplace. Apni purani aur nayi cheezein aasani se khareedein aur bechein.
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2 text-xs font-semibold bg-gray-800 text-[#effffb] px-3 py-1.5 rounded-xl border border-gray-700">
                                <MapPin className="w-3.5 h-3.5 text-white" />
                                Swabi, KPK, Pakistan
                            </div>
                        </div>
                    </div>


                    {/* Col 4: Developer Spotlight Banner */}
                    <div className="bg-linear-to-br from-[#0a4d3c]/5 to-gray-800 p-4 rounded border border-[#0a4d3c]/40 flex flex-col justify-between hover:scale-105 transition-all">
                        <div className="text-center">
                            <div className="flex items-center gap-2 text-[#effffb] text-xs font-bold uppercase tracking-wider mb-2">
                                <Code2 className="w-4 h-4 text-[#effffb]" />
                                <span className="animate-pulse">Developer Profile</span>
                            </div>
                            <h5 className="text-white font-bold text-base">Waqas Ahmad</h5>
                            <p className="text-[11px] text-gray-300 mt-1 font-medium text-center">
                                Frontend Web Developer.
                            </p>
                        </div>

                        {/* Developer Contact Social Links */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700/60 justify-center">
                            <a
                                href="https://wa.me/923100094241"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white hover:scale-110 text-blue-900 p-2 rounded-xl transition-all overflow-hidden shadow"
                                title="Whatsapp"
                            >
                                <img src={whatsapp} alt="" className="w-4 scale-170 " />
                            </a>
                            <a
                                href="https://github.com/yourusername"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white hover:scale-110 text-white p-2 rounded-xl transition-all overflow-hidden"
                                title="GitHub"
                            >
                                <img src={github} alt="" className="w-4 scale-170 " />
                            </a>
                            <a
                                href="https://www.facebook.com/profile.php?id=100081875383531"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white hover:scale-110 p-2 rounded-xl transition-all overflow-hidden"
                                title="Facebook"
                            >
                                <img src={facebook} alt="" className="w-4 scale-170 " />
                            </a>
                        </div>
                    </div>

                </div>

                {/* Bottom Copyright & Credit Bar */}
                <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
                    <p>© {new Date().getFullYear()} Swabi Marketplace. All rights reserved.</p>

                    {/* Main Portfolio / Developer Credit Badge */}
                    <div className="flex items-center gap-1.5 text-gray-400 bg-gray-800 px-4 py-2 rounded-2xl border border-gray-700/60 shadow-sm">
                        <span>Designed & Developed with</span>
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                        <span>by</span>
                        <div className="text-[#effffb] font-bold ">Waqas Ahmad</div>
                    </div>
                </div>

            </div>
        </footer>
    );
};