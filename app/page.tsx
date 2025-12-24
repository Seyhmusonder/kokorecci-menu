'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion' 
import { ChevronDown } from 'lucide-react' 

export default function Home() {
  const [menu, setMenu] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      // Veritabanından verileri çekiyoruz
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
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-slate-900">
      
      {/* HEADER: SABİT ÜST BÖLÜM */}
      <header className="bg-orange-600 pt-10 pb-12 px-6 text-center shadow-md sticky top-0 z-[100]">
        <h1 className="text-white text-2xl font-black tracking-tighter italic uppercase">
            BAHÇE CAFE KOKOREÇ
        </h1>
        <div className="w-10 h-1 bg-white/30 mx-auto mt-2 rounded-full"></div>
      </header>

      {/* ANA İÇERİK */}
      <main className="max-w-md mx-auto px-4 pt-8 pb-24 relative z-10">
        
        {/* 🔥 GÜNÜN FIRSATLARI */}
        {campaigns.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2 italic">🔥 Günün Fırsatları</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
              {campaigns.map((item) => (
                <div key={item.id} className="snap-center min-w-[280px] bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="h-40 bg-gray-50">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-5 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                      <p className="text-orange-600 font-black text-lg">{item.price} TL</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 📋 KATEGORİLER (ÇEKMECE YAPISI) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-2 px-2 italic">📋 Menü</h2>
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              <button 
                onClick={() => setOpenCategoryId(openCategoryId === cat.id ? null : cat.id)}
                className="w-full p-5 flex justify-between items-center active:bg-orange-50 transition-all"
              >
                <span className="text-md font-extrabold text-stone-800 uppercase italic">
                  {cat.name}
                </span>
                <motion.div animate={{ rotate: openCategoryId === cat.id ? 180 : 0 }}>
                    <ChevronDown className="text-orange-600" size={20} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openCategoryId === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-stone-50/30"
                  >
                    <div className="p-4 space-y-3 border-t border-slate-100">
                      {menu.filter(item => item.category_id === cat.id).map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                            {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                            <span className="text-orange-600 font-black text-sm">{item.price} TL</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-10 text-slate-300 text-[10px] font-bold tracking-widest uppercase">
        BAHÇE CAFE KOKOREÇ QR MENÜ
      </footer>
    </div>
  )
}