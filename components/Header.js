import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white px-6 py-4 shadow">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wide">Steel Sons FF</h1>
        <nav className="space-x-6 text-sm">
          <Link href="/" className="hover:underline">
            Message Board
          </Link>
          <Link href="/trade" className="hover:underline">
            Trade Block
          </Link>
          <Link href="/history" className="hover:underline">
            League History
          </Link>
        </nav>
      </div>
    </header>
  );
}
