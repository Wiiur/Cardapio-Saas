import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Cardápio SaaS • Sistema Local</h1>
      <div className="flex gap-3">
        <Link
          href="/admin"
          className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-semibold text-sm"
        >
          Abrir Painel Admin
        </Link>
        <Link
          href="/admin/tables"
          className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-semibold text-sm border border-white/10"
        >
          Ver Mesas & QR Codes
        </Link>
      </div>
    </div>
  );
}