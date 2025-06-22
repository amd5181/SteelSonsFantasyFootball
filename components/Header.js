import Link from 'next/link'
export default function Header() {
  return (
    <header className="bg-black text-yellow-400 p-4 flex justify-center gap-6 text-lg font-semibold sticky top-0 z-50">
      <Link href="/">Message Board</Link>
      <Link href="/trade-block">Trade Block</Link>
      <Link href="/history">History</Link>
    </header>
  )
}
