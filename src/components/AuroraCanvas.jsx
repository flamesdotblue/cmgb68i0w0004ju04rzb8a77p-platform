import { useEffect, useRef } from 'react'

export default function AuroraCanvas({ params }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { antialias: false, depth: false, stencil: false, premultipliedAlpha: true })
    if (!gl) return

    const vertexSrc = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `

    const fragmentSrc = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_speed;
      uniform float u_intensity;
      uniform float u_scale;
      uniform float u_hue; // degrees

      // Hash and noise utilities (compact fbm)
      vec2 hash2(vec2 p) {
        // art noise by iq
        const vec2 k = vec2(127.1, 311.7);
        vec2 h = vec2(dot(p, k), dot(p, k.yx));
        return -1.0 + 2.0 * fract(sin(h) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
        float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
        float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
        float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.02;
          a *= 0.5;
        }
        return v;
      }

      vec3 hsb2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        rgb = rgb * rgb * (3.0 - 2.0 * rgb);
        return c.z * mix(vec3(1.0), rgb, c.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y; // keep aspect

        // Base sky gradient (night)
        float sky = smoothstep(-0.6, 0.6, p.y);
        vec3 skyCol = mix(vec3(0.02, 0.03, 0.06), vec3(0.02, 0.05, 0.10), sky);

        // Aurora bands using fbm and sin-modulated strips
        float t = u_time * u_speed;
        float scale = 1.2 * u_scale;

        // Two layers of ribbons
        float band1 = 0.0;
        float band2 = 0.0;

        vec2 q1 = vec2(p.x * 0.8, p.y * 1.6 + 0.25);
        float n1 = fbm(q1 * 1.5 * scale + vec2(0.0, t * 0.15));
        float m1 = fbm(q1 * 3.0 * scale + vec2(t * 0.08, -t * 0.03));
        float s1 = sin((p.x * 2.4 + n1 * 1.8 + t * 0.6));
        band1 = smoothstep(0.05, -0.35, abs(p.y + 0.25 + m1 * 0.25) - 0.4 + s1 * 0.12);

        vec2 q2 = vec2(p.x * 1.1, p.y * 1.8 - 0.1);
        float n2 = fbm(q2 * 2.6 * scale + vec2(t * 0.02, t * 0.07));
        float s2 = sin((p.x * 3.2 + n2 * 2.2 - t * 0.4));
        band2 = smoothstep(0.05, -0.35, abs(p.y - 0.1 + n2 * 0.22) - 0.35 + s2 * 0.1);

        float auroraMask = clamp(band1 + band2, 0.0, 1.0);

        // Vertical fade (closer to horizon)
        float glow = smoothstep(-0.6, 0.6, p.y + 0.1) * 1.25;

        // Flicker/detail
        float ripple = fbm(p * 6.0 * scale + vec2(0.0, t * 0.4));
        float curtains = smoothstep(0.3, 1.0, ripple + 0.2);

        float intensity = u_intensity * (0.6 + 0.4 * curtains);
        float brightness = auroraMask * glow * intensity;

        // Color
        float hue = u_hue / 360.0; // 0..1
        vec3 colA = hsb2rgb(vec3(hue, 0.9, 0.9));
        vec3 colB = hsb2rgb(vec3(fract(hue + 0.08), 0.7, 0.8));
        vec3 auroraCol = mix(colA, colB, clamp(ripple * 0.8 + 0.2, 0.0, 1.0));

        // Soft bloom effect
        float bloom = auroraMask * (0.15 + 0.35 * smoothstep(0.0, 1.0, ripple));

        vec3 color = skyCol + auroraCol * brightness + auroraCol * bloom * 0.5;

        // Subtle star field
        vec2 sp = fract(uv * vec2(800.0, 450.0));
        float star = step(0.9985, fract(sin(dot(floor(uv * u_resolution.xy), vec2(12.9898,78.233))) * 43758.5453));
        star *= smoothstep(0.0, 1.0, p.y + 0.6);
        color += star * 0.6;

        // Gamma correction
        color = pow(color, vec3(0.4545));

        gl_FragColor = vec4(color, 1.0);
      }
    `

    const createShader = (type, source) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = createShader(gl.VERTEX_SHADER, vertexSrc)
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentSrc)
    if (!vs || !fs) return

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      return
    }

    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    // Fullscreen triangle strip (two triangles)
    const verts = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'a_pos')

    const uResolution = gl.getUniformLocation(program, 'u_resolution')
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uSpeed = gl.getUniformLocation(program, 'u_speed')
    const uIntensity = gl.getUniformLocation(program, 'u_intensity')
    const uScale = gl.getUniformLocation(program, 'u_scale')
    const uHue = gl.getUniformLocation(program, 'u_hue')

    gl.useProgram(program)
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
    gl.viewport(0, 0, canvas.width, canvas.height)

    let start = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(640, Math.floor(rect.width))
      const h = Math.max(360, Math.floor(rect.height))
      const width = Math.floor(w * dpr)
      const height = Math.floor(h * dpr)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    const onResize = () => {
      resize()
    }

    resize()
    window.addEventListener('resize', onResize)

    const render = () => {
      const now = performance.now()
      const t = (now - start) / 1000

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uTime, t)
      gl.uniform1f(uSpeed, params.speed)
      gl.uniform1f(uIntensity, params.intensity)
      gl.uniform1f(uScale, params.scale)
      gl.uniform1f(uHue, params.hue)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      gl.deleteBuffer(quad)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [params])

  return (
    <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_10%,rgba(255,255,255,0.05),transparent_60%)]" />
    </div>
  )
}
