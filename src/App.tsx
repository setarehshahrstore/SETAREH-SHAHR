import React from 'react';

// This is the "Heart" of your website. 
// It defines exactly what people see when they visit setareh-shahr.vercel.app

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. NAVIGATION BAR (Top of the screen) */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <h1 className="text-xl font-extrabold tracking-tighter uppercase">Setareh Shahr</h1>
        <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold active:scale-95 transition">
          Explore
        </button>
      </nav>

      {/* 2. HERO SECTION (Main visual area) */}
      <main className="pt-32 px-6 pb-24">
        <div className="max-w-screen-xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-orange-100 text-orange-600 rounded-full">
            Now Open for Delivery
          </div>
          
          <h2 className="text-5xl md:text-8xl font-extrabold leading-[0.9] tracking-tighter mb-8">
            ELEVATED <br/> DINING <br/> <span className="text-gray-400">EXPERIENCE.</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-end">
            <p className="text-lg text-gray-500 max-w-sm leading-relaxed">
              We combine traditional secrets with modern aesthetics to create the perfect flavor for the city.
            </p>
            
            <div className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80" 
                className="w-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt="Main dish"
              />
            </div>
          </div>
        </div>
      </main>

      {/* 3. MOBILE APP NAVIGATION (The bar at the bottom of the phone screen) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-black/90 backdrop-blur-xl rounded-3xl p-4 flex justify-around items-center shadow-2xl">
          <button className="text-white font-bold">Home</button>
          <button className="text-gray-400 font-bold">Menu</button>
          <button className="text-gray-400 font-bold">Orders</button>
        </div>
      </div>
    </div>
  );
}
