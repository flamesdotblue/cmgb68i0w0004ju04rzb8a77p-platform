import { useState } from 'react'
import Header from './components/Header'
import ControlsPanel from './components/ControlsPanel'
import AuroraCanvas from './components/AuroraCanvas'
import InfoPanel from './components/InfoPanel'

export default function App() {
  const [params, setParams] = useState({
    hue: 140, // degrees
    intensity: 0.8, // 0..1.5
    speed: 0.4, // 0..2
    scale: 1.0, // 0.5..3
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      <Header />

      <main className="container mx-auto px-4 pb-10">
        <section className="rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl mb-6">
          <AuroraCanvas params={params} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ControlsPanel params={params} onChange={setParams} />
          </div>
          <div>
            <InfoPanel />
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-slate-400">
        Built with React, Tailwind, and WebGL. Enjoy the lights.
      </footer>
    </div>
  )
}
