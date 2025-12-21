'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
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
      if (!session) router.push('/login')
      else fetchData()
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
      else alert("Silme hatası: " + error.message)
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
    }
    setLoading(false)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-orange-600">BAHÇE KAFE PANEL</h1>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-xs border px-3 py-1 rounded">Çıkış</button>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* ÜRÜN EKLEME FORMU */}
          <form onSubmit={addProduct} className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
            <h2 className="font-bold border-b pb-2">Yeni Ürün Ekle</h2>
            <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50">
              <option value="">Kategori Seç...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="Ürün Adı" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full p-3 border rounded-xl" required />
            <input type="number" placeholder="Fiyat" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full p-3 border rounded-xl" required />
            
            <label className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100 cursor-pointer">
              <input type="checkbox" checked={isCampaign} onChange={(e) => setIsCampaign(e.target.checked)} className="w-5 h-5 accent-orange-600" />
              <span className="text-sm font-bold text-orange-700">KAMPANYALI ÜRÜN (EN ÜSTTE ÇIKAR)</span>
            </label>

            <textarea placeholder="Açıklama" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full p-3 border rounded-xl" />
            <input type="file" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="text-xs" />
            <button disabled={loading} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition">
              {loading ? 'Yükleniyor...' : 'Menüye Ekle'}
            </button>
          </form>

          {/* MENÜ LİSTESİ VE SİLME */}
          <div className="bg-white p-6 rounded-3xl shadow-sm overflow-hidden">
            <h2 className="font-bold border-b pb-2 mb-4">Mevcut Menü</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 border-b hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                      {p.image_url && <img src={p.image_url} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.categories?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-orange-600 text-sm">{p.price} TL</p>
                    {/* SİLME BUTONU BURADA */}
                    <button onClick={() => deleteProduct(p.id)} className="bg-red-50 p-2 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}