import { HeartIcon } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-muted border-t flex items-center justify-end px-4 h-8">

        <p className=" text-center text-sm font-mono ">Made with <HeartIcon className="inline-block h-4 w-4" color="red" /> by <Link href="https://github.com/webdevava" target="_blank" className=" hover:underline">Ankur Auti</Link></p>
    </footer>
  )
}