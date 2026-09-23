export const ShimmerEffectForSingleItem = () => {
    return (
        <div className='w-full min-h-screen bg-gray-50 pt-16 pb-12 select-none animate-pulse'>
            <div className='max-w-6xl mx-auto px-3 sm:px-6 mt-4'>

                {/* Top Navigation Bar Shimmer */}
                <div className='flex items-center justify-between mb-4'>
                    <div className='h-5 w-32 bg-gray-200 rounded-md'></div>
                    <div className='flex items-center gap-2'>
                        <div className='w-9 h-9 bg-gray-200 rounded-xl'></div>
                        <div className='w-9 h-9 bg-gray-200 rounded-xl'></div>
                    </div>
                </div>

                {/* Main Grid Container */}
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>

                    {/* LEFT SECTION: MEDIA & DETAILS (Col 8) */}
                    <div className='lg:col-span-8 flex flex-col gap-6'>

                        {/* Image Box Shimmer */}
                        <div className='bg-white border border-gray-200 rounded-3xl p-3 sm:p-4 shadow-sm'>
                            <div className='w-full aspect-4/3 sm:aspect-16/10 bg-gray-200 rounded-2xl'></div>
                        </div>

                        {/* Specifications & Description Card Shimmer */}
                        <div className='bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col gap-5'>

                            {/* Title & Price Header */}
                            <div className='border-b border-gray-100 pb-5 flex flex-col gap-3'>
                                {/* Title Line 1 & 2 */}
                                <div className='h-7 sm:h-8 bg-gray-200 rounded-lg w-3/4'></div>

                                {/* Price */}
                                <div className='h-8 w-36 bg-gray-200 rounded-lg mt-1'></div>

                                {/* Location */}
                                <div className='h-4 w-28 bg-gray-200 rounded-md mt-1'></div>

                                {/* Badges */}
                                <div className='flex items-center gap-3 mt-3 pt-3 border-t border-gray-50'>
                                    <div className='h-7 w-24 bg-gray-200 rounded-xl'></div>
                                    <div className='h-7 w-32 bg-gray-200 rounded-xl'></div>
                                </div>
                            </div>

                            {/* Description Shimmer */}
                            <div className='flex flex-col gap-2.5'>
                                <div className='h-5 w-28 bg-gray-200 rounded-md mb-1'></div>
                                <div className='h-4 w-full bg-gray-200 rounded-md'></div>
                                <div className='h-4 w-11/12 bg-gray-200 rounded-md'></div>
                                <div className='h-4 w-4/5 bg-gray-200 rounded-md'></div>
                            </div>

                            {/* Safety Tip Box Shimmer */}
                            <div className='h-16 w-full bg-gray-200 rounded-2xl mt-2'></div>

                        </div>

                    </div>

                    {/* RIGHT SECTION: SELLER CARD (Col 4) */}
                    <div className='lg:col-span-4 flex flex-col gap-4'>
                        <div className='bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col gap-5'>

                            {/* Card Header */}
                            <div className='h-5 w-40 bg-gray-200 rounded-md pb-3 border-b border-gray-100'></div>

                            {/* Seller Profile Header */}
                            <div className='flex items-center gap-3.5'>
                                <div className='w-14 h-14 rounded-2xl bg-gray-200 shrink-0'></div>
                                <div className='flex flex-col gap-2 w-full'>
                                    <div className='h-5 w-32 bg-gray-200 rounded-md'></div>
                                    <div className='h-3.5 w-24 bg-gray-200 rounded-md'></div>
                                </div>
                            </div>

                            {/* Contact Info Lines */}
                            <div className='flex flex-col gap-2.5'>
                                <div className='h-10 w-full bg-gray-200 rounded-2xl'></div>
                                <div className='h-10 w-full bg-gray-200 rounded-2xl'></div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex flex-col gap-2.5 pt-2'>
                                <div className='h-11 w-full bg-gray-200 rounded-2xl'></div>
                                <div className='h-11 w-full bg-gray-200 rounded-2xl'></div>
                                <div className='h-9 w-full bg-gray-200 rounded-xl'></div>
                            </div>

                            {/* Disclaimer */}
                            <div className='h-3 w-3/4 bg-gray-200 rounded-md mx-auto mt-1'></div>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};