import React from 'react'

export const Logo = () => {
    return (
        <div className={``}>
            <div className="flex items-center gap-1">
                <span className="font-extrabold text-2xl tracking-tight text-[#0F2D4A] uppercase">
                    Swabi
                </span>
                <span className="font-extrabold text-2xl tracking-tight text-[#107C41] uppercase">
                    Market
                </span>
            </div>


            <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-bold tracking-widest text-amber-600 uppercase">
                    Buy & Sell
                </span>
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                <span className="text-[11px] font-medium text-gray-700 tracking-tight">
                    Local Trade
                </span>
            </div>
        </div>
    )
}