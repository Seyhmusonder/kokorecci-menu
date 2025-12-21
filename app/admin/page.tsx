'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Form State'leri
  const [catName, setCatName] = useState('')
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null) // Yeni: Fotoğraf state'i

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: catData } = await supabase.from('categories').select('*').order('name')
    const { data: prodData } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false })
    if (catData) setCategories(catData)
    if (prodData) setProducts(prodData)
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!catName) return
    const { error } = await supabase.from('categories').insert([{ name: catName }])
    if (!error) { setCatName(''); fetchData(); }
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!prodName || !prodPrice || !selectedCat) {
      alert("Lütfen ürün adı, fiyatı ve kategori seçin!");
      return
    }
    setLoading(true)

    let imageUrl = ""

    // 1. FOTOĞRAF YÜKLEME (Varsa)
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}` // Çakışma olmasın diye rastgele isim
      const filePath = `${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        alert("Fotoğraf yüklenemedi: " + uploadError.message)
        setLoading(false)
        return
      }

      // Fotoğrafın herkese açık URL'ini al
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)
      
      imageUrl = publicUrl
    }

    // 2. VERİTABANINA KAYIT
    const { error } = await supabase.from('products').insert([{
      name: prodName,
      price: parseFloat(prodPrice),
      description: prodDesc,
      category_id: selectedCat,
      image_url: imageUrl // URL buraya kaydediliyor
    }])

    if (!error) {
      setProdName(''); setProdPrice(''); setProdDesc(''); setImageFile(null);
      fetchData();
      alert("Ürün başarıyla eklendi!");
    } else { alert(error.message); }
    setLoading(false)
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen text-black">
      <h1 className="text-3xl font-bold text-orange-600 mb-8 text-center">Bahçe Kafe Yönetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Kategori Ekle */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">1. Kategori Yönetimi</h2>
            <form onSubmit={addCategory} className="flex gap-2">
              <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Yeni Kategori" className="flex-1 p-2 border rounded" />
              <button className="bg-orange-500 text-white px-4 py-2 rounded font-bold">Ekle</button>
            </form>
          </section>

          {/* Ürün Ekle */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">2. Ürün Ekle</h2>
            <form onSubmit={addProduct} className="space-y-4">
              <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="w-full p-2 border rounded bg-white">
                <option value="">Kategori Seçin...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Ürün Adı" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full p-2 border rounded" />
              <input type="number" step="0.01" placeholder="Fiyat (TL)" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full p-2 border rounded" />
              <textarea placeholder="Açıklama" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full p-2 border rounded" />
              
              {/* Yeni: Dosya Seçici */}
              <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Fotoğrafı</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>

              <button disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
                {loading ? 'Yükleniyor...' : 'Ürünü Menüye Ekle'}
              </button>
            </form>
          </section>
        </div>

        {/* MENÜ LİSTESİ */}
        <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Mevcut Menü</h2>
          <div className="space-y-4 max-h-[700px] overflow-y-auto">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 border-b hover:bg-gray-50">
                {p.image_url && (
                  <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded-md shadow-sm" />
                )}
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-gray-400">{(p.categories as any)?.name}</p>
                </div>
                <p className="text-orange-600 font-bold">{p.price} TL</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}