import { useEffect  } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';


export const LoginTop = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const checkUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Agar user pehle se logged in hai toh home page par redirect kar do
                navigate('/', { replace: true });
            }
        };

        checkUserSession();
    }, [navigate]);
    
    return (
        <div className="w-full flex flex-col items-center justify-center p-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center border-4 border-[#D4AF37] rounded-2xl bg-[#0a4d3c] shadow-md">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#D4AF37] tracking-tighter">
                    S
                </span>
            </div>

            <div className="flex items-center gap-1.5 mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="text-[#111827]">Swabi</span>
                <span className="text-[#D4AF37]">Marketplace</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 text-center">
                Connect and Trade locally in Swabi
            </p>
        </div>
    )
}
