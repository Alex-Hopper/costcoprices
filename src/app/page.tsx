import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.from('regions').select('*')
  console.log(data)
  return <div>result in terminal</div>
}