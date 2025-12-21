'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
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
        router.replace('/login')
      } else {
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

  // --- KATEGORİ EKLEME ---
  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!catName) return
    setLoading(true)
    const { error } = await supabase.from('categories').insert([{ name: catName }])
    if (!error) {
      setCatName(''); fetchData(); alert("Kategori eklendi!");
    } else {
      alert("Hata: " + error.message)
    }
    setLoading(false)
  }

  // --- ÜRÜN SİLME ---
  async function deleteProduct(id: number) {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) fetchData()
    }
  }

  // --- ÜRÜN EKLEME ---
  async function addProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCat) return alert("Lütfen bir kategori seçin!")
    
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
      name: prodName, 
      price: parseFloat(prodPrice), 
      description: prodDesc,
      category_id: parseInt(selectedCat), // Sayısal ID için parseInt eklendi
      image_url: imageUrl, 
      is_campaign: isCampaign
    }])

    if (!error) {
      setProdName(''); setProdPrice(''); setProdDesc(''); setIsCampaign(false); fetchData();
      alert("Ürün başarıyla menüye eklendi!")
    } else {
      alert("Ürün eklenemedi: " + error.message)
    }
    setLoading(false)
  }

  if (!isAuthorized) return <div className="p-10 text-center font-bold">Yetki Kontrol Ediliyor...</div>

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen text-black font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-orange-600 tracking-tighter uppercase">Bahçe Kafe Admin</h1>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-xs font-bold bg-white border border-red-100 text-red-500 px-4 py-2 rounded-xl">ÇIKIŞ YAP</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* SOL KOLON: KATEGORİ VE ÜRÜN EKLEME */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* KATEGORİ EKLE */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Kategori Yönetimi</h2>
              <form onSubmit={addCategory} className="flex gap-2">
                <input type="text" placeholder="Örn: Kebaplar" value={catName} onChange={(e) => setCatName(e.target.value)} className="flex-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                <button type="submit" className="bg-orange-600 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase">EKLE</button>
              </form>
            </div>

            {/* ÜRÜN EKLE */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Yeni Ürün Ekle</h2>
              <form onSubmit={addProduct} className="space-y-3">
                <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm border-none">
                  <option value="">Kategori Seçin...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="text" placeholder="Ürün Adı" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm border-none" required />
                <input type="number" placeholder="Fiyat (TL)" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm border-none" required />
                <textarea placeholder="Açıklama" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm border-none h-20" />
                
                <label className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={isCampaign} onChange={(e) => setIsCampaign(e.target.checked)} className="accent-orange-600 w-4 h-4" />
                  <span className="text-[10px] font-bold text-orange-800 uppercase tracking-tighter">Kampanya Vitrinine Ekle</span>
                </label>

                <div className="p-3 border-2 border-dashed border-gray-100 rounded-xl">
                  <input type="file" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="text-[10px] text-gray-400 w-full" />
                </div>

                <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition shadow-lg">
                  {loading ? 'İŞLENİYOR...' : 'SİSTEME KAYDET'}
                </button>
              </form>
            </div>
          </div>

          {/* SAĞ KOLON: MENÜ LİSTESİ */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Aktif Menü Akışı</h2>
            <div className="grid gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-orange-100 transition group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shadow-sm shrink-0">
                      {p.image_url && <img src={p.image_url} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{p.categories?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-black text-slate-900 text-sm">{p.price} TL</p>
                    <button onClick={() => deleteProduct(p.id)} className="bg-white p-2.5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm border border-red-50">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <p className="text-center text-gray-300 py-10 font-bold uppercase text-xs">Menüde henüz ürün yok.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}