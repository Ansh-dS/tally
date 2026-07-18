'use server'
import { redirect } from 'next/navigation'

export default async function Page() {
  // Use a fast, native server-side redirect instead of loading a client-side useEffect
  redirect('/forms')
}
