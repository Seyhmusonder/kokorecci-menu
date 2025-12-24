'use client'
import { useEffect, useState, memo, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence, Variants } from 'framer-motion' 
import { ChevronDown, UtensilsCrossed, Phone, Clock } from 'lucide-react' 

// --- 1. MODERN ANİMASYON VARYANTLARI ---
const containerVariants: Variants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.1, delayChildren: 0.2 }
  },
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { type: "spring", stiffness: 200, damping: 30 }
  }
}

const itemVariants: Variants = {
  open: { y: 0, opacity: 1, scale: 1 },
  collapsed: { y: 20, opacity: 0, scale: 0.95 }
}

const ProductCard = memo(({ item }: { item: any }) => (
  <motion.div 
    variants={itemVariants}
    className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-white/20 transition-all hover:bg-white/20"
  >
    <div className="w-16 h-16 bg-white/10 rounded-xl overflow-hidden shrink-0 border border-white/10">
      {item.image_url && (
        <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
      )}
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-white text-sm tracking-tight">{item.name}</h4>
      <p className="text-[10px] text-white/60 line-clamp-1 italic">{item.description || 'Bahçe Cafe lezzeti...'}</p>
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
    <div className="min-h-screen flex items-center justify-center bg-orange-600">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white"></div>
    </div>
  )

  return (
    // FOTOĞRAF BURADA: Fixed background ve dark overlay ile okunabilirlik sağlandı
    <div className="relative min-h-screen font-sans overflow-x-hidden bg-black">
      
      {/* ARKA PLAN FOTOĞRAFI */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10"></div> {/* Fotoğrafın üzerindeki koyu katman */}
        <img src="/istanbul-bg.jpg" className="w-full h-full object-cover" alt="Background" />
      </div>
      
      {/* HEADER: Glassmorphism efektli turuncu başlık */}
      <header className="bg-orange-600/80 backdrop-blur-lg pt-12 pb-14 px-6 text-center shadow-2xl sticky top-0 z-[100] border-b border-white/10">
        <h1 className="text-white text-2xl font-black tracking-tighter italic uppercase flex items-center justify-center gap-2 drop-shadow-lg">
          <UtensilsCrossed size={22} className="text-orange-200" /> BAHÇE CAFE KOKOREÇ
        </h1>
        <div className="w-10 h-0.5 bg-white/40 mx-auto mt-2 rounded-full"></div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-10 pb-24 relative z-20">
        
        {/* KAMPANYALAR: Şeffaf Kart Tasarımı */}
        {campaigns.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs font-black text-orange-400 mb-4 px-2 uppercase tracking-[0.3em] drop-shadow-md">Fırsatlar</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
              {campaigns.map((item) => (
                <div key={item.id} className="snap-center min-w-[280px] bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden">
                  <div className="h-40 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-5 flex justify-between items-center bg-black/20 text-white">
                    <span className="font-bold tracking-tight">{item.name}</span>
                    <span className="text-orange-400 font-black">{item.price} TL</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MENÜ KATEGORİLERİ: Çekmece Sistemi */}
        <div className="space-y-5">
          <h2 className="text-xs font-black text-orange-400 mb-2 px-2 uppercase tracking-[0.3em] drop-shadow-md">Menü</h2>
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white/10 backdrop-blur-2xl rounded-[1.8rem] border border-white/10 overflow-hidden shadow-lg">
              
              <button 
                onClick={() => setOpenCategoryId(openCategoryId === cat.id ? null : cat.id)}
                className="w-full p-6 flex justify-between items-center active:bg-white/10 transition-colors"
              >
                <span className="text-[15px] font-black text-white uppercase italic tracking-wider">
                  {cat.name}
                </span>
                <motion.div 
                    animate={{ rotate: openCategoryId === cat.id ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <ChevronDown className="text-orange-400" size={22} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openCategoryId === cat.id && (
                  <motion.div
                    key="content"
                    variants={containerVariants}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4 bg-white/5 border-t border-white/5">
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

      {/* FOOTER */}
      <footer className="relative z-20 text-center py-12 text-white/30 text-[10px] font-black tracking-[0.4em] uppercase">
        <div className="flex justify-center gap-6 mb-4">
          <Phone size={14} /> <Clock size={14} />
        </div>
        Bahçe Cafe Kokoreç • Erzincan
      </footer>
    </div>
  )
}