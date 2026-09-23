import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ShoppingBag, Zap, Award } from 'lucide-react'
import { SEO } from './SEO'; // ✅ ADD

export const AboutUs = () => {
  const stats = [
    { label: 'Total Ads', value: '10K+' },
    { label: 'Active Users', value: '25K+' },
    { label: 'Verified Sellers', value: '5K+' },
    { label: 'Area Covered', value: 'Swabi & Nearby' },
  ];

  const features = [
    { icon: <ShieldCheck className="w-8 h-8 text-[#0a4d3c]" aria-hidden="true" />, title: 'Safe Aur Secure Dealings', description: 'Aap ke safe khareed-o-farookht ke liye hum verified buyers aur sellers ko tarjeeh dete hain.' },
    { icon: <ShoppingBag className="w-8 h-8 text-[#0a4d3c]" aria-hidden="true" />, title: 'Har Qisam Ki Cheezain', description: 'Mobiles, gaadiyan, property aur jobs—apne elaqay mein sab kuch ek hi jagah dhoondain.' },
    { icon: <Zap className="w-8 h-8 text-[#0a4d3c]" aria-hidden="true" />, title: 'Direct Chat Aur Fast Deals', description: 'Kharidaron aur bechne walon se direct chat karein aur bina kisi intezar ke deal pakki karein.' },
  ];

  return (
    <>
      <SEO
        title="About Us - Swabi Market"
        description="Swabi Market ke baare mein janein. Hum Swabi aur aas paas ke ilaqon mein safe, fast aur secure local trading platform provide karte hain. 10K+ ads, 25K+ users."
        keywords="About Swabi Market, Swabi Marketplace, Local Trading Platform KPK"
        url="/aboutus"
      />

      <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-8">
        <section className="max-w-5xl mx-auto text-center py-12">
          <span className="text-sm font-bold tracking-wider text-[#0a4d3c] uppercase bg-[#effffb] px-4 py-1.5 rounded-full border border-[#0a4d3c]/20">
            Swabi Market Ke Baare Mein
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-4 leading-tight">
            Apne Elaqay Mein Cheezain Bechein Aur Khareedein <br className="hidden sm:inline" />
            <span className="text-[#0a4d3c]">Aasani Aur Tez Raftari Se.</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4 text-base sm:text-lg">
            Swabi Market aap ka apna local online bazaar hai jahan aap aasani se ads laga sakte hain aur apne aas paas behtareen deals dhoond sakte hain.
          </p>
        </section>

        <section className="max-w-5xl mx-auto bg-[#0a4d3c] text-white rounded-2xl p-8 shadow-xl mb-16" aria-label="Statistics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-2">
                <h3 className="text-3xl sm:text-4xl font-bold text-[#D4AF37]">{stat.value}</h3>
                <p className="text-sm sm:text-base text-emerald-100 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Swabi Market Kyon Istemaal Karein?</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">Aap ke behtareen tajurbae ke liye modern aur aasan design.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <article key={index} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col items-start">
                <div className="p-3 bg-[#effffb] rounded-xl mb-4 border border-[#0a4d3c]/10">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto bg-[#effffb] border border-[#0a4d3c]/20 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          <Award className="w-12 h-12 text-[#0a4d3c] mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Kya aap koi cheez bechna chahte hain?</h2>
          <p className="text-gray-600 max-w-xl mx-auto mt-2 mb-6 text-sm sm:text-base">
            Aaj hi apna pehla ad post karein aur hazaron kharidaron tak apni cheez puhanchayein.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/postad" className="bg-[#0a4d3c] text-white text-sm font-semibold px-6 py-3 rounded-xl shadow hover:bg-[#D4AF37] hover:text-[#0a4d3c] transition-all duration-200">
              Ad Post Karein
            </Link>
            <Link to="/" className="bg-white text-gray-800 border border-gray-300 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
              Market Explore Karein
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};