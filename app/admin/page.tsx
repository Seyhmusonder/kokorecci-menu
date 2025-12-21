'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  
  // Veri State'leri
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Form (Input) State'leri
  const [catName, setCatName] = useState('')
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  // 1. GÜVENLİK KONTROLÜ: Giriş yapılmamışsa login'e at
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        fetchData() // Eğer oturum varsa verileri çek
      }
    }
    checkUser()
  }, [router])

  // 2. VERİ ÇEKME FONKSİYONU
  async function fetchData() {
    // Kategorileri çek
    const { data: catData } = await supabase.from('categories').select('*').order('name')
    // Ürünleri çek (Kategori ismiyle beraber)
    const { data: prodData } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })

    if (catData) setCategories(catData)
    if (prodData) setProducts(prodData)
  }

  // 3. KATEGORİ EKLEME
  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!catName) return
    const { error } = await supabase.from('categories').insert([{ name: catName }])
    if (!error) {
      setCatName('')
      fetchData()
    } else {
      alert("Hata: " + error.message)
    }
  }

  // 4. ÜRÜN EKLEME (FOTOĞRAFLI)
  async function addProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!prodName || !prodPrice || !selectedCat) {
      alert("Lütfen zorunlu alanları doldurun (Ad, Fiyat, Kategori)!")
      return
    }
    setLoading(true)

    let imageUrl = ""

    // Varsa Fotoğrafı Storage'a yükle
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        alert("Fotoğraf yüklenemedi: " + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)
      
      imageUrl = publicUrl
    }

    // Ürünü Veritabanına Yaz
    const { error } = await supabase.from('products').insert([{
      name: prodName,
      price: parseFloat(prodPrice),
      description: prodDesc,
      category_id: selectedCat,
      image_url: imageUrl
    }])

    if (!error) {
      setProdName(''); setProdPrice(''); setProdDesc(''); setImageFile(null);
      fetchData()
      alert("Ürün başarıyla eklendi!")
    } else {
      alert("Kayıt hatası: " + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen text-black">
      <header className="flex justify-between items-center max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-orange-600">Bahçe Kafe Yönetim</h1>
        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Çıkış Yap
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* SOL TARAF: FORM ALANI */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-xl shadow border-t-4 border-orange-500">
            <h2 className="text-xl font-bold mb-4">1. Kategori Yönetimi</h2>
            <form onSubmit={addCategory} className="flex gap-2">
              <input 
                type="text" 
                value={catName} 
                onChange={(e) => setCatName(e.target.value)} 
                placeholder="Yeni Kategori" 
                className="flex-1 p-2 border rounded outline-none focus:ring-1 focus:ring-orange-500" 
              />
              <button className="bg-orange-500 text-white px-4 py-2 rounded font-bold hover:bg-orange-600 transition">Ekle</button>
            </form>
          </section>

          <section className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500">
            <h2 className="text-xl font-bold mb-4">2. Ürün Ekle</h2>
            <form onSubmit={addProduct} className="space-y-4">
              <select 
                value={selectedCat} 
                onChange={(e) => setSelectedCat(e.target.value)} 
                className="w-full p-2 border rounded bg-white text-black outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Kategori Seçin...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Ürün Adı" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full p-2 border rounded" />
              <input type="number" step="0.01" placeholder="Fiyat (TL)" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full p-2 border rounded" />
              <textarea placeholder="Açıklama" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full p-2 border rounded h-20" />
              
              <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg text-center bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Fotoğrafı</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>

              <button disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400">
                {loading ? 'İşlem Yapılıyor...' : 'Ürünü Menüye Ekle'}
              </button>
            </form>
          </section>
        </div>

        {/* SAĞ TARAF: LİSTE ALANI */}
        <div className="bg-white p-6 rounded-xl shadow h-[fit-content]">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Mevcut Menü ({products.length})</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {products.length === 0 && <p className="text-gray-400 text-center py-10 italic">Henüz ürün eklenmemiş.</p>}
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">Resim Yok</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{p.name}</p>
                  <p className="text-xs text-orange-500 font-medium">{p.categories?.name}</p>
                  {p.description && <p className="text-[11px] text-gray-500 line-clamp-1">{p.description}</p>}
                </div>
                <div className="text-right">
                  <p className="text-green-700 font-bold">{p.price} TL</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}