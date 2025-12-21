'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false) // Yetki kilidi
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Form State'leri
  const [catName, setCatName] = useState('')
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [isCampaign, setIsCampaign] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Oturum yoksa hemen login'e fırlat
        router.replace('/login')
      } else {
        // Oturum varsa kilidi aç ve verileri çek
        setIsAuthorized(true)
        fetchData()
      }
    }
    checkUser()
  }, [router])

  async function fetchData() {
    const { data: catData } = await supabase.from('categories').select('*').order('name')
    const { data: prodData } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false })
    if (catData) setCategories(catData)
    if (prodData) setProducts(prodData)
  }

  // --- SİLME FONKSİYONU ---
  async function deleteProduct(id: string) {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) fetchData()
    }
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    let imageUrl = ""
    if (imageFile) {
      const fileName = `${Math.random()}.${imageFile.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile)
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
        imageUrl = publicUrl
      }
    }
    const { error } = await supabase.from('products').insert([{
      name: prodName, price: parseFloat(prodPrice), description: prodDesc,
      category_id: selectedCat, image_url: imageUrl, is_campaign: isCampaign
    }])
    if (!error) {
      setProdName(''); setProdPrice(''); setProdDesc(''); setIsCampaign(false); fetchData();
      alert("Ürün Eklendi!")
    }
    setLoading(false)
  }

  // EĞER YETKİ KONTROLÜ DEVAM EDİYORSA HİÇBİR ŞEY GÖSTERME
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // YETKİ VARSA PANELİ GÖSTER
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-orange-600 uppercase tracking-tighter">Bahçe Kafe Kontrol Paneli</h1>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition">GÜVENLİ ÇIKIŞ</button>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* ÜRÜN EKLEME FORMU */}
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6">Yeni Ürün Tanımla</h2>
            <form onSubmit={addProduct} className="space-y-4">
              <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="w-full p-4 border-none bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Kategori Seç...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Ürün Adı" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full p-4 border-none bg-gray-50 rounded-2xl" required />
              <input type="number" placeholder="Fiyat (TL)" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full p-4 border-none bg-gray-50 rounded-2xl" required />
              
              <label className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100 cursor-pointer">
                <input type="checkbox" checked={isCampaign} onChange={(e) => setIsCampaign(e.target.checked)} className="w-5 h-5 accent-orange-600" />
                <span className="text-sm font-bold text-orange-800">BU ÜRÜNÜ KAMPANYAYA EKLE</span>
              </label>

              <textarea placeholder="Ürün Açıklaması" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full p-4 border-none bg-gray-50 rounded-2xl h-24" />
              <input type="file" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="text-xs text-gray-400" />
              <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition shadow-lg">
                {loading ? 'SİSTEME İŞLENİYOR...' : 'MENÜYE KAYDET'}
              </button>
            </form>
          </section>

          {/* MENÜ LİSTESİ VE SİLME */}
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
            <h2 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6 text-black">Mevcut Menü Akışı</h2>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-orange-200 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm">
                      {p.image_url && <img src={p.image_url} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-orange-500 font-bold uppercase">{p.categories?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-black text-slate-900 text-sm">{p.price} TL</p>
                    <button onClick={() => deleteProduct(p.id)} className="bg-white p-2 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm border border-red-50">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}