import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-black text-yellow-400 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">Steel Sons FF</h1>
        <nav className="space-x-4 text-lg">
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
