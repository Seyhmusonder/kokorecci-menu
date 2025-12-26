'use client'
import { useEffect, useState, memo, useMemo } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence, Variants } from 'framer-motion' 
import { ChevronDown, UtensilsCrossed } from 'lucide-react' 

// --- ANİMASYON AYARLARI ---
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
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('order_index', { ascending: true }) 
        
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
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none"></div>
        <Image 
          src="/istanbul-bg.jpg" 
          alt="İstanbul Background" 
          fill 
          priority 
          quality={75} 
          className="object-cover opacity-80"
        />
      </div>
      
      {/* HEADER DÜZELTİLDİ: Taşma Yok, Tam Sağ Alt Köşede */}
      <header className="bg-orange-600/95 backdrop-blur-md py-4 px-4 shadow-2xl sticky top-0 z-[100] border-b border-white/10 overflow-hidden">
        <div className="max-w-md mx-auto flex items-center gap-3 relative">
            
            {/* LOGO */}
            <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-white p-1">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  fill 
                  className="object-contain"
                />
            </div>

            {/* BAŞLIK VE UYARI YAZISI */}
            <div className="flex flex-col z-10 w-full"> 
                {/* DİKKAT: pr-16 verdik. 
                   Bu, yazının mühürün üzerine binmesini engeller.
                */}
                <h1 className="text-white text-xl font-black italic uppercase tracking-tight leading-none drop-shadow-md pr-16">
                    BAHÇE CAFE KOKOREÇ
                </h1>
                
                <span className="text-orange-200 text-[10px] font-bold tracking-widest uppercase mt-1.5 italic bg-black/20 px-2 py-0.5 rounded w-fit">
                    Taklitlerimizden Kaçının
                </span>
            </div>

            {/* 🔥 FİNAL AYAR: 
               right-0 -> Ekranın tam sağ kenarına (padding içinden) yasla.
               top-[55%] -> Dikeyde tam ortanın bir tık altına al.
               z-20 -> Her şeyin üstünde olsun.
            */}
            <div className="absolute right-0 top-[55%] -translate-y-1/2 bg-red-600 text-white text-[9px] font-black py-2 px-2 rounded-lg -rotate-12 shadow-xl border-2 border-white/80 text-center leading-none z-20 animate-pulse">
               %100<br/>KUZU<br/>KOKOREÇ
            </div>

        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 pb-24 relative z-20">
        
        {/* KAMPANYALAR */}
        {campaigns.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[10px] font-black text-orange-400 mb-3 px-1 uppercase tracking-[0.2em]">Günün Fırsatları</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {campaigns.map((item) => (
                <div key={item.id} className="min-w-[260px] bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                  <div className="relative h-36">
                    {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-cover" />}
                  </div>
                  <div className="p-4 flex justify-between items-center text-white">
                    <span className="font-bold text-sm">{item.name}</span>
                    <span className="text-orange-400 font-black">{item.price} TL</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MENÜ LİSTESİ */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black text-orange-400 mb-2 px-1 uppercase tracking-[0.2em]">Menü</h2>
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

      <footer className="relative z-20 text-center py-10 space-y-2 border-t border-white/5 mt-8 bg-black/40 backdrop-blur-sm">
        <p className="text-white/40 text-[10px] font-bold tracking-widest">
          BAHÇE CAFE KOKOREÇ • ERZİNCAN
        </p>
        
        <div className="flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default">
          <span className="text-[8px] text-white/30 uppercase tracking-[0.15em] font-medium">
            Powered by
          </span>
          <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.25em] drop-shadow-sm">
            EVALORA
          </span>
        </div>
      </footer>
    </div>
  )
}