'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image' // 📸 Logoyu göstermek için bunu ekledik

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Supabase ile giriş yapma işlemi
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert("Giriş başarısız: " + error.message)
        setLoading(false)
        return
      }

      // 2. Sayfayı tam yenileyerek admin paneline gidiyoruz (Cookie oturması için şart)
      window.location.href = '/admin'

    } catch (err) {
      console.error("Giriş hatası:", err)
      alert("Beklenmedik bir hata oluştu.")
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-stone-200">
        
        {/* 🔥 LOGO ALANI BURAYA GELDİ */}
        <header className="text-center mb-8">
          <div className="w-28 h-28 relative mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-orange-50">
             <Image 
               src="/logo.png" // public klasöründeki fotoğraf
               alt="Bahçe Cafe Logo" 
               fill 
               className="object-cover" // Fotoğrafı yuvarlağın içine tam oturtur
             />
          </div>
          <h1 className="text-3xl font-black text-orange-600 tracking-tighter">BAHÇE KAFE</h1>
          <p className="text-gray-400 text-xs mt-2 uppercase font-bold tracking-widest">Yönetim Paneli</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1 tracking-wider">E-posta</label>
            <input 
              type="email" 
              placeholder="admin@bahcekafe.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-black transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1 tracking-wider">Şifre</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-black transition-all"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all active:scale-95 disabled:bg-gray-400 shadow-lg shadow-orange-100"
          >
            {loading ? 'KİMLİK DOĞRULANIYOR...' : 'SİSTEME GİRİŞ YAP'}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-300 mt-8 font-bold uppercase tracking-widest">
          © 2025 Bahçe Kafe Mühendislik
        </p>
      </div>
    </div>
  )
}