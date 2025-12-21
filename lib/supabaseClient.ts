import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("URL Kontrol:", supabaseUrl) // Terminalde ne yazdığına bakacağız

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Dostum, .env.local dosyasını hala okuyamıyorum. Dosya yerini veya ismini kontrol et!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)