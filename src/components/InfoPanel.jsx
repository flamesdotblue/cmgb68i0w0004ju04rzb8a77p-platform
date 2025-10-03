export default function InfoPanel() {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-white/10 p-5">
      <h2 className="text-lg font-medium mb-2">About the Simulation</h2>
      <p className="text-sm text-slate-300 leading-relaxed">
        This aurora is generated procedurally in a fragment shader using fractal noise and animated sine bands. Adjust the controls to change its hue, intensity, speed, and scale. The result blends multiple layers to emulate curtains of light dancing across a polar sky.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-400 list-disc list-inside">
        <li>Hue: shifts between teal, green, and cyan dominant colors.</li>
        <li>Intensity: controls overall brightness and bloom of the aurora.</li>
        <li>Speed: affects the motion of ripples and ribbons.</li>
        <li>Scale: changes the size and detail of the structures.</li>
      </ul>
      <p className="text-xs text-slate-500 mt-4">
        Tip: Try a hue around 130–160 for classic emerald tones, or push towards 180–200 for colder cyan skies.
      </p>
    </div>
  )
}
