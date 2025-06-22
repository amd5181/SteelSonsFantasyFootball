import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Steel Sons Fantasy Football</h1>
        <nav className="space-x-6 text-sm font-medium">
          <Link href="/" className="hover:underline">Message Board</Link>
          <Link href="/trade-block" className="hover:underline">Trade Block</Link>
          <Link href="/league-history" className="hover:underline">League History</Link>
        </nav>
      </div>
    </header>
  );
}
