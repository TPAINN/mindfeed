import { Component, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

/* ── Variant 5 — "3D Float" (React Three Fiber) ─────────────────────────────
   A glowing wireframe icosahedron floats behind the mark, a translucent
   solid core drifts inside it and thin rings orbit around — depth flat
   design can't reach. Unlit materials keep the look deterministic across
   three.js versions; if WebGL is unavailable the 3D layer degrades to a
   calm radial glow instead of erroring. The wordmark/preloader overlay
   sits above the canvas. The scene loops forever; the shell fades it out. */

const WORD = 'MindFeed'
const DUST = [
  [3.4, 1.1, -1], [-3.1, -0.6, -0.4], [2.2, -1.8, -1.4], [-2.6, 1.9, -0.8],
  [0.8, 3, -1.6], [-1.2, -2.7, -0.6], [3.8, -1.2, 0.5], [-3.6, 0.4, 0.6],
]

export default function V5Float({ reduced = false }) {
  return (
    <div className="mfv5" style={{ ['--spd']: 1 }}>
      <style>{`
        .mfv5 {
          position: absolute; inset: 0; overflow: hidden;
          background:
            radial-gradient(ellipse 620px 620px at 50% 50%, oklch(0.52 0.13 60 / 0.20), transparent 62%),
            radial-gradient(ellipse 1100px 700px at 50% 115%, oklch(0.35 0.12 265 / 0.45), transparent 66%),
            linear-gradient(180deg, oklch(0.085 0.03 260), oklch(0.05 0.022 245));
        }
        .mfv5 canvas { display: block; }
        .mfv5-3d { position: absolute; inset: 0; }
        .mfv5-3d-fallback {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 420px 420px at 50% 44%, oklch(0.6 0.15 60 / 0.28), transparent 64%),
            radial-gradient(ellipse 300px 300px at 62% 58%, oklch(0.9 0.1 75 / 0.12), transparent 60%);
        }

        .mfv5-overlay {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          pointer-events: none;
        }
        .mfv5-word {
          display: flex; gap: 0.02em;
          font-family: var(--heading);
          font-weight: 800; letter-spacing: -0.05em;
          font-size: clamp(30px, 8vw, 42px);
          color: oklch(0.97 0.01 90);
          text-shadow: 0 2px 30px oklch(0 0 0 / 0.4);
        }
        .mfv5-word span {
          display: inline-block; opacity: 0;
          animation: mfv5-rise calc(0.7s * var(--spd, 1)) cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .mfv5-word span:nth-child(1) { animation-delay: calc(0.45s * var(--spd, 1)); }
        .mfv5-word span:nth-child(2) { animation-delay: calc(0.50s * var(--spd, 1)); }
        .mfv5-word span:nth-child(3) { animation-delay: calc(0.55s * var(--spd, 1)); }
        .mfv5-word span:nth-child(4) { animation-delay: calc(0.60s * var(--spd, 1)); }
        .mfv5-word span:nth-child(5) { animation-delay: calc(0.65s * var(--spd, 1)); }
        .mfv5-word span:nth-child(6) { animation-delay: calc(0.70s * var(--spd, 1)); }
        .mfv5-word span:nth-child(7) { animation-delay: calc(0.75s * var(--spd, 1)); }
        .mfv5-word span:nth-child(8) { animation-delay: calc(0.80s * var(--spd, 1)); }
        @keyframes mfv5-rise {
          from { opacity: 0; transform: translateY(14px) scale(0.94); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        .mfv5-foot {
          position: absolute; bottom: 34px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          width: min(240px, 62vw);
          pointer-events: none;
        }
        .mfv5-hair {
          width: 100%; height: 2px; border-radius: 2px; overflow: hidden;
          background: oklch(0.95 0.02 90 / 0.14);
        }
        .mfv5-fill {
          display: block; height: 100%; width: 0;
          background: linear-gradient(90deg, oklch(0.8 0.15 62), oklch(0.66 0.14 45));
          animation: mfv5-fill calc(2.6s * var(--spd, 1)) cubic-bezier(0.6, 0, 0.3, 1) forwards;
        }
        @keyframes mfv5-fill { to { width: 100%; } }
        .mfv5-caption {
          font-family: var(--mono);
          font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
          color: oklch(0.75 0.05 250 / 0.75);
          opacity: 0; animation: mfv5-cap calc(0.5s * var(--spd, 1)) ease calc(1.9s * var(--spd, 1)) forwards;
        }
        @keyframes mfv5-cap { to { opacity: 1; } }

        @media (prefers-reduced-motion: reduce) {
          .mfv5-word span { animation: none; opacity: 1; }
          .mfv5-fill { width: 100%; }
          .mfv5-caption { animation: none; opacity: 0.8; }
        }
      `}</style>

      <div className="mfv5-overlay" aria-hidden="true">
        <div className="mfv5-word">
          {WORD.split('').map((ch, i) => <span key={i}>{ch}</span>)}
        </div>
        <div className="mfv5-foot">
          <div className="mfv5-hair"><i className="mfv5-fill" /></div>
          <span className="mfv5-caption">render loop</span>
        </div>
      </div>

      <ThreeLayer reduced={reduced} />
    </div>
  )
}

function ThreeLayer({ reduced }) {
  return (
    <CanvasErrorBoundary fallback={<div className="mfv5-3d-fallback" aria-hidden="true" />}>
      <div className="mfv5-3d">
        <Canvas
          camera={{ position: [0, 0, 8.5], fov: 42 }}
          dpr={[1, 1.8]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          frameloop={reduced ? 'demand' : 'always'}
          style={{ background: 'transparent' }}
        >
          <FloatScene paused={reduced} />
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  )
}

function FloatScene({ paused }) {
  const shell = useRef(null)
  const core = useRef(null)
  const ring = useRef(null)

  useFrame((state) => {
    if (paused) return
    const t = state.clock.elapsedTime
    if (shell.current) {
      shell.current.rotation.y += 0.0035
      shell.current.rotation.x = Math.sin(t * 0.18) * 0.18
    }
    if (core.current) {
      core.current.rotation.y -= 0.006
      core.current.rotation.z = Math.sin(t * 0.3) * 0.25
      core.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.05)
    }
    if (ring.current) {
      ring.current.rotation.z = Math.sin(t * 0.12) * 0.22
      ring.current.rotation.y += 0.002
    }
    state.camera.position.x = Math.sin(t * 0.1) * 0.35
    state.camera.position.y = Math.cos(t * 0.13) * 0.28
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <group>
      <group ref={shell}>
        <mesh>
          <icosahedronGeometry args={[1.95, 1]} />
          <meshBasicMaterial color="#f6c489" wireframe transparent opacity={0.3} />
        </mesh>
      </group>

      <mesh ref={core}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial color="#ef9550" transparent opacity={0.9} />
      </mesh>

      <group ref={ring} rotation={[1.25, 0.2, 0]}>
        <mesh>
          <torusGeometry args={[2.8, 0.012, 10, 140]} />
          <meshBasicMaterial color="#f0b06a" transparent opacity={0.5} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.5, 0.006, 8, 120]} />
          <meshBasicMaterial color="#f7d9a8" transparent opacity={0.25} />
        </mesh>
      </group>

      {DUST.map((d, i) => (
        <mesh key={i} position={d}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#f7d9a8" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { /* WebGL unavailable — show the calm fallback */ }
  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}
