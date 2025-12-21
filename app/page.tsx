'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [menu, setMenu] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-600"></div>
    </div>
  )

  const campaigns = menu.filter(p => p.is_campaign === true)

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-10 text-slate-900 font-sans">
      
      {/* ÜST DASHBOARD / HEADER */}
      <div className="bg-gradient-to-b from-orange-600 to-orange-500 pt-10 pb-20 px-6 rounded-b-[40px] shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-white text-3xl font-black tracking-tighter">BAHÇE KAFE</h1>
            <p className="text-orange-100 text-sm font-medium">Hoş geldiniz, ne alırdınız?</p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            🍴
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 -mt-12">
        
        {/* 🔥 KAMPANYA VİTRİNİ (HORIZONTAL DASHBOARD) */}
        {campaigns.length > 0 && (
          <section className="mb-10">
            <div className="flex justify-between items-end mb-4 px-2">
              <h2 className="text-xl font-bold text-slate-800">Şefin Fırsatları</h2>
              <span className="text-orange-600 text-xs font-bold animate-pulse">Sola Kaydır ➔</span>
            </div>
            
            <div className="flex overflow-x-auto gap-5 pb-6 no-scrollbar snap-x">
              {campaigns.map((item) => (
                <div key={item.id} className="snap-center min-w-[300px] relative group">
                  <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                    GÜNÜN KAMPANYASI
                  </div>
                  <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-white">
                    <div className="h-48 relative">
                      {item.image_url ? (
                        <img src={item.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">Görsel Hazırlanıyor</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-5">
                        <h3 className="text-white font-bold text-xl">{item.name}</h3>
                        <p className="text-white/80 text-xs line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="p-5 flex justify-between items-center bg-white">
                      <span className="text-2xl font-black text-orange-600">{item.price} <small className="text-sm">TL</small></span>
                      <button className="bg-slate-900 text-white text-xs px-5 py-2.5 rounded-2xl font-bold">İncele</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* KATEGORİ LİSTESİ */}
        {categories.map((cat) => (
          <section key={cat.id} className="mb-8">
            <h3 className="text-lg font-bold text-slate-700 mb-4 ml-2 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              {cat.name}
            </h3>
            <div className="space-y-4">
              {menu.filter(item => item.category_id === cat.id && !item.is_campaign).map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-[24px] shadow-sm flex items-center gap-4 border border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                    {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                    <p className="text-orange-600 font-black mt-2">{item.price} TL</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center py-10 opacity-30 text-[10px] uppercase tracking-widest font-bold">
        Bahçe Kafe × QR Menu Pro
      </footer>
    </div>
  )
}