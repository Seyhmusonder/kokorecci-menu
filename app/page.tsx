'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [menu, setMenu] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Verileri çek
      const { data: catData } = await supabase.from('categories').select('*').order('name')
      const { data: prodData } = await supabase.from('products').select('*')
      if (catData) setCategories(catData)
      if (prodData) setMenu(prodData)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-600"></div>
    </div>
  )

  const campaigns = menu.filter(p => p.is_campaign === true)

  return (
    <div className="bg-[#FCFCFC] min-h-screen pb-20 font-sans text-slate-900">
      
      {/* ÜST BAŞLIK */}
      <header className="bg-orange-600 pt-10 pb-16 px-6 text-center shadow-md">
        <h1 className="text-white text-3xl font-black tracking-tighter">BAHÇE KAFE</h1>
        <div className="w-12 h-1 bg-white/40 mx-auto mt-2 rounded-full"></div>
      </header>

      <main className="max-w-md mx-auto px-4 -mt-8">
        
        {/* 🔥 KAMPANYALAR (SADE KARTLAR) */}
        {campaigns.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">🔥 Günün Fırsatları</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
              {campaigns.map((item) => (
                <div key={item.id} className="snap-center min-w-[260px] bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="h-40 bg-gray-100">
                    {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-orange-600 font-black text-lg">{item.price} TL</p>
                    </div>
                    <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-md">KAMPANYA</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 📋 KATEGORİLER VE ÜRÜNLER (BİRBİRİNE GİRMEYEN LİSTE) */}
        {categories.map((cat) => (
          <section key={cat.id} className="mb-10">
            <h3 className="text-lg font-extrabold text-orange-700 mb-5 border-b-2 border-orange-100 pb-2">
              {cat.name}
            </h3>
            <div className="grid gap-4">
              {/* Kampanya olan olmayan tüm ürünleri kategorisinde gösteriyoruz */}
              {menu.filter(item => item.category_id === cat.id).map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{item.description || 'Nefis lezzet...'}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-orange-600 font-black">{item.price} TL</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center py-10 text-slate-300 text-[10px] font-bold tracking-widest">
        BAHÇE KAFE QR MENÜ
      </footer>
    </div>
  )
}