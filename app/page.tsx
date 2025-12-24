'use client'
import { useEffect, useState, memo, useMemo } from 'react'
import Image from 'next/image' // Next.js optimizasyonu için şart
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence, Variants } from 'framer-motion' 
import { ChevronDown, UtensilsCrossed } from 'lucide-react' 

// --- 1. PERFORMANS ODAKLI ANİMASYONLAR ---
// Spring yerine daha hafif olan 'tween' veya optimize edilmiş spring kullanıyoruz.
const containerVariants: Variants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: { type: "tween", duration: 0.3, ease: "easeOut", staggerChildren: 0.05 }
  },
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { type: "tween", duration: 0.2, ease: "easeIn" }
  }
}

const itemVariants: Variants = {
  open: { y: 0, opacity: 1 },
  collapsed: { y: 10, opacity: 0 }
}

const ProductCard = memo(({ item }: { item: any }) => (
  <motion.div 
    variants={itemVariants}
    className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-4 border border-white/10"
  >
    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
      {item.image_url ? (
        <Image 
          src={item.image_url} 
          alt={item.name} 
          fill
          sizes="64px"
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
          <UtensilsCrossed size={20} />
        </div>
      )}
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-white text-sm tracking-tight">{item.name}</h4>
      <p className="text-[10px] text-white/60 line-clamp-1 italic">{item.description || 'Lezzet durağı...'}</p>
      <div className="mt-1">
        <span className="text-orange-400 font-black text-sm">{item.price} TL</span>
      </div>
    </div>
  </motion.div>
))

ProductCard.displayName = 'ProductCard'

export default function Home() {
  const [menu, setMenu] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: catData } = await supabase.from('categories').select('*').order('name')
        const { data: prodData } = await supabase.from('products').select('*')
        if (catData) setCategories(catData)
        if (prodData) setMenu(prodData)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const campaigns = useMemo(() => menu.filter(p => p.is_campaign === true), [menu])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-600"></div>
    </div>
  )

  return (
    <div className="relative min-h-screen font-sans bg-black">
      
      {/* 1. ARKA PLAN: next/image ile %80 daha hafif */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none"></div>
        <Image 
          src="/istanbul-bg.jpg" 
          alt="İstanbul Background" 
          fill 
          priority // İlk yüklemede hız kazandırır
          quality={75} // Boyutu küçültmek için kaliteyi 75'e çektik
          className="object-cover opacity-80"
        />
      </div>
      
      {/* 2. HEADER: Basitleştirilmiş blur */}
      <header className="bg-orange-600/90 backdrop-blur-md pt-10 pb-12 px-6 text-center shadow-xl sticky top-0 z-[100] border-b border-white/10">
        <h1 className="text-white text-2xl font-black italic uppercase flex items-center justify-center gap-2">
           BAHÇE CAFE KOKOREÇ
        </h1>
      </header>

      <main className="max-w-md mx-auto px-4 pt-8 pb-24 relative z-20">
        
        {/* KAMPANYALAR */}
        {campaigns.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-black text-orange-400 mb-4 px-2 uppercase tracking-widest">Günün Fırsatları</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {campaigns.map((item) => (
                <div key={item.id} className="min-w-[280px] bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                  <div className="relative h-40">
                    {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-cover" />}
                  </div>
                  <div className="p-5 flex justify-between items-center text-white">
                    <span className="font-bold">{item.name}</span>
                    <span className="text-orange-400 font-black">{item.price} TL</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MENÜ: Optimize Edilmiş Çekmeceler */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-orange-400 mb-2 px-2 uppercase tracking-widest">Menü Kategorileri</h2>
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white/5 backdrop-blur-sm rounded-[1.5rem] border border-white/10 overflow-hidden">
              
              <button 
                onClick={() => setOpenCategoryId(openCategoryId === cat.id ? null : cat.id)}
                className="w-full p-5 flex justify-between items-center active:bg-white/10 transition-all"
              >
                <span className="text-sm font-black text-white uppercase italic tracking-wider">
                  {cat.name}
                </span>
                <motion.div animate={{ rotate: openCategoryId === cat.id ? 180 : 0 }}>
                    <ChevronDown className="text-orange-400" size={20} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openCategoryId === cat.id && (
                  <motion.div
                    variants={containerVariants}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3 bg-black/20 border-t border-white/5">
                      {menu
                        .filter(item => item.category_id === cat.id)
                        .map((item) => <ProductCard key={item.id} item={item} />)
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-20 text-center py-10 text-white/20 text-[10px] font-black tracking-widest">
        BAHÇE CAFE KOKOREÇ • ERZİNCAN
      </footer>
    </div>
  )
}