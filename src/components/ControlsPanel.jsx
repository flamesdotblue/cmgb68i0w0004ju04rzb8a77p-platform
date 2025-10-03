export default function ControlsPanel({ params, onChange }) {
  const set = (key, value) => onChange({ ...params, [key]: value })

  return (
    <div className="w-full rounded-xl bg-slate-900/60 border border-white/10 p-5">
      <h2 className="text-lg font-medium mb-4">Controls</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <Control
          label="Hue"
          min={90}
          max={200}
          step={1}
          value={params.hue}
          onInput={(v) => set('hue', v)}
          format={(v) => `${Math.round(v)}°`}
        />
        <Control
          label="Intensity"
          min={0}
          max={1.5}
          step={0.01}
          value={params.intensity}
          onInput={(v) => set('intensity', v)}
          format={(v) => v.toFixed(2)}
        />
        <Control
          label="Speed"
          min={0}
          max={2}
          step={0.01}
          value={params.speed}
          onInput={(v) => set('speed', v)}
          format={(v) => v.toFixed(2)}
        />
        <Control
          label="Scale"
          min={0.5}
          max={3}
          step={0.01}
          value={params.scale}
          onInput={(v) => set('scale', v)}
          format={(v) => v.toFixed(2)}
        />
      </div>
    </div>
  )
}

function Control({ label, min, max, step, value, onInput, format }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-slate-300">{label}</label>
        <span className="text-xs text-slate-400 tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onInput(parseFloat(e.target.value))}
        className="w-full appearance-none h-2 rounded bg-slate-700 accent-emerald-400"
      />
    </div>
  )
}
