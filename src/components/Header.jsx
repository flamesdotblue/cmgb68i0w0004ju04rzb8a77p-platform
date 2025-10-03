import { Star } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-slate-950/50 border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center ring-1 ring-white/20">
            <Star className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Aurora Borealis Simulator</h1>
            <p className="text-xs text-slate-400">Procedural sky lights in your browser</p>
          </div>
        </div>
      </div>
    </header>
  )
}
