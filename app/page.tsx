'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [menu, setMenu] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Kategorileri çek
      const { data: catData } = await supabase.from('categories').select('*').order('name')
      // Ürünleri çek
      const { data: prodData } = await supabase.from('products').select('*')
      
      if (catData) setCategories(catData)
      if (prodData) setMenu(prodData)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <p className="text-orange-600 font-bold animate-pulse">Menü Yükleniyor...</p>
    </div>
  )

  return (
    <div className="bg-stone-50 min-h-screen pb-20 font-sans text-stone-900">
      {/* Üst Başlık (Header) */}
      <header className="bg-orange-600 text-white py-12 text-center shadow-lg rounded-b-[3rem]">
        <h1 className="text-4xl font-black uppercase tracking-widest">Bahçe Kafe</h1>
        <div className="w-20 h-1 bg-white mx-auto mt-2 rounded-full"></div>
        <p className="mt-3 opacity-90 font-medium italic">Lezzetin QR Hali</p>
      </header>

      <main className="max-w-md mx-auto px-4 -mt-8">
        {categories.map((cat) => (
          <section key={cat.id} className="mt-10">
            <h2 className="text-2xl font-bold text-orange-700 mb-6 flex items-center gap-2">
              <span className="bg-orange-600 w-2 h-8 rounded-full"></span>
              {cat.name}
            </h2>
            
            <div className="grid gap-6">
              {menu.filter(item => item.category_id === cat.id).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex h-32">
                  {/* Ürün Görseli */}
                  <div className="w-32 h-full bg-stone-200 shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px] text-center p-2 italic">Görsel Bekleniyor</div>
                    )}
                  </div>
                  
                  {/* Ürün Detayları */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-gray-800">{item.name}</h3>
                      <p className="text-stone-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="text-orange-600 font-black text-xl self-end">
                      {item.price} <span className="text-sm">TL</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="mt-16 text-center text-stone-400 text-xs pb-10">
        © 2025 Bahçe Kafe Kokoreç <br/> QR Menü Sistemi
      </footer>
    </div>
  )
}