import { useT } from '../../i18n/useT'

/* ── Variant 1 — "The First Card" (the existing splash) ─────────────────────
   A small knowledge card springs in from the warm void, the wordmark
   cascades inside it, an amber rule draws, and the promise settles beneath —
   with a faint giant "10" watermark behind. Pure CSS choreography, scaled
   via the inherited --s custom property (brief visits compress through it).
   If animations are disabled the whole scene falls back to visible statics. */

export default function V1Card() {
  const t = useT()
  return (
    <div className="mfv1">
      <style>{`
        .mfv1 { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }

        .mfv1-orbs { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .mfv1-orb {
          position: absolute; border-radius: 50%;
          filter: blur(50px);
          will-change: transform;
          animation: mfv1-drift 9s ease-in-out infinite both;
        }
        .mfv1-orb:nth-child(1) {
          width: 420px; height: 420px; top: -18%; left: 14%;
          background: radial-gradient(circle, oklch(0.60 0.18 55 / 0.30), transparent 65%);
        }
        .mfv1-orb:nth-child(2) {
          width: 320px; height: 320px; top: 46%; right: -12%;
          background: radial-gradient(circle, oklch(0.52 0.17 318 / 0.18), transparent 65%);
          animation-delay: 3s;
        }
        .mfv1-orb:nth-child(3) {
          width: 280px; height: 280px; bottom: -14%; left: 2%;
          background: radial-gradient(circle, oklch(0.55 0.16 148 / 0.15), transparent 65%);
          animation-delay: 5s;
        }
        @keyframes mfv1-drift {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          33%      { transform: translate(20px, -12px) scale(1.06); opacity: 0.8; }
          66%      { transform: translate(-10px, 14px) scale(0.95); opacity: 0.42; }
        }

        .mfv1-10 {
          position: absolute; z-index: 1;
          font-family: var(--heading);
          font-weight: 900;
          font-size: clamp(280px, 52vw, 520px);
          line-height: 1; letter-spacing: -0.08em;
          color: transparent;
          -webkit-text-stroke: 1.5px oklch(0.62 0.17 55 / 0.20);
          opacity: 0;
          animation:
            mfv1-ten-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) calc(0.5s * var(--s)) both,
            mfv1-ten-float 7s ease-in-out calc(2.2s * var(--s)) infinite;
          pointer-events: none; user-select: none;
        }
        @keyframes mfv1-ten-in {
          from { opacity: 0; transform: translateY(36px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mfv1-ten-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-14px) scale(1.02); }
        }

        .mfv1-card {
          position: relative; z-index: 2;
          width: min(344px, 84vw);
          padding: 30px 34px 28px;
          border-radius: 26px;
          background: linear-gradient(165deg, var(--surface-2), var(--surface));
          border: 1px solid var(--border);
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.05),
            0 32px 72px -14px oklch(0.60 0.18 55 / 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          overflow: hidden;
          will-change: transform, opacity;
          animation: mfv1-card-in calc(0.72s * var(--s)) cubic-bezier(0.34, 1.56, 0.64, 1) calc(0.06s * var(--s)) both;
        }
        .mfv1-halo {
          position: absolute; inset: -30%; z-index: 0; pointer-events: none;
          background: radial-gradient(circle at 30% 0%, oklch(0.60 0.18 55 / 0.20), transparent 55%);
          animation: mfv1-halo calc(3s * var(--s)) ease-in-out calc(1s * var(--s)) infinite;
        }
        @keyframes mfv1-card-in {
          0%   { opacity: 0; transform: translate(30vw, -22vh) rotate(12deg) scale(0.7); }
          55%  { opacity: 1; transform: translate(-2vw, 1vh) rotate(-2deg) scale(1.03); }
          75%  { transform: translate(0.4vw, -0.3vh) rotate(0.6deg) scale(0.99); }
          100% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
        }
        @keyframes mfv1-halo {
          0%, 100% { opacity: 0.35; transform: scale(0.92); }
          50%      { opacity: 0.8; transform: scale(1.1); }
        }

        .mfv1-chip {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent);
          opacity: 0; transform: translateY(8px);
          animation: mfv1-up calc(0.4s * var(--s)) cubic-bezier(0.16, 1, 0.3, 1) calc(0.44s * var(--s)) forwards;
        }
        .mfv1-chip::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 10px var(--accent);
          animation: mfv1-dot calc(1.8s * var(--s)) ease-in-out calc(0.9s * var(--s)) infinite;
        }
        @keyframes mfv1-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }

        .mfv1-word {
          position: relative; z-index: 1;
          font-family: var(--heading);
          font-size: clamp(34px, 10vw, 42px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -0.05em;
          font-variation-settings: 'opsz' 42;
          display: flex; margin-top: 10px;
          overflow: hidden; padding: 4px 2px 2px;
        }
        .mfv1-word span {
          display: inline-block;
          opacity: 0;
          transform: translateY(120%) rotate(8deg) scale(0.85);
          animation: mfv1-split-in calc(0.58s * var(--s)) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          color: var(--text-h);
        }
        .mfv1-word span:nth-child(1) { animation-delay: calc(0.50s * var(--s)); }
        .mfv1-word span:nth-child(2) { animation-delay: calc(0.56s * var(--s)); }
        .mfv1-word span:nth-child(3) { animation-delay: calc(0.62s * var(--s)); }
        .mfv1-word span:nth-child(4) { animation-delay: calc(0.68s * var(--s)); }
        .mfv1-word span:nth-child(5) { animation-delay: calc(0.74s * var(--s)); }
        .mfv1-word span:nth-child(6) { animation-delay: calc(0.80s * var(--s)); }
        .mfv1-word span:nth-child(7) { animation-delay: calc(0.86s * var(--s)); }
        .mfv1-word span:nth-child(8) { animation-delay: calc(0.92s * var(--s)); }
        @keyframes mfv1-split-in {
          0%   { opacity: 0; transform: translateY(120%) rotate(8deg) scale(0.85); }
          65%  { opacity: 1; transform: translateY(-6%) rotate(-2deg) scale(1.04); }
          82%  { transform: translateY(2%) rotate(0.5deg) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
        }

        .mfv1-shine { position: relative; display: inline-block; }
        .mfv1-shine::after {
          content: 'MindFeed';
          position: absolute; inset: 0;
          font-family: var(--heading);
          font-size: clamp(34px, 10vw, 42px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -0.05em;
          font-variation-settings: 'opsz' 42;
          background: linear-gradient(
            120deg,
            transparent 0%, transparent 32%,
            oklch(0.72 0.17 58 / 0.45) 46%,
            oklch(0.92 0.08 80 / 0.9) 50%,
            oklch(0.72 0.17 58 / 0.45) 54%,
            transparent 68%, transparent 100%
          );
          background-size: 250% 100%;
          background-position: 180% center;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: mfv1-sweep calc(1.15s * var(--s)) cubic-bezier(0.4, 0, 0.2, 1) calc(1.35s * var(--s)) forwards;
          pointer-events: none;
        }
        @keyframes mfv1-sweep {
          0%   { background-position: 180% center; }
          100% { background-position: -80% center; }
        }

        .mfv1-rule {
          position: relative; z-index: 1;
          margin-top: 18px; height: 2px; width: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          transform-origin: center;
          transform: scaleX(0); opacity: 0;
          animation: mfv1-rule calc(0.55s * var(--s)) cubic-bezier(0.4, 0, 0.2, 1) calc(1.02s * var(--s)) forwards;
        }
        @keyframes mfv1-rule {
          0%   { transform: scaleX(0); opacity: 0; }
          60%  { opacity: 1; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        .mfv1-meta {
          position: relative; z-index: 1;
          margin-top: 16px;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          text-align: center;
          opacity: 0; transform: translateY(8px);
          animation: mfv1-up calc(0.45s * var(--s)) cubic-bezier(0.16, 1, 0.3, 1) calc(1.24s * var(--s)) forwards;
        }
        @keyframes mfv1-up { to { opacity: 1; transform: translateY(0); } }

        @media (prefers-reduced-motion: reduce) {
          .mfv1 { --s: 1; }
          .mfv1-orb { animation: none; opacity: 0.5; }
          .mfv1-10  { animation: none; opacity: 0.4; }
          .mfv1-card, .mfv1-halo { animation: none; }
          .mfv1-chip, .mfv1-word span, .mfv1-shine::after, .mfv1-rule, .mfv1-meta { animation: none; }
          .mfv1-chip, .mfv1-meta { opacity: 1; transform: none; }
          .mfv1-word span { opacity: 1; transform: none; }
          .mfv1-rule { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      <div className="mfv1-orbs">
        <span className="mfv1-orb" />
        <span className="mfv1-orb" />
        <span className="mfv1-orb" />
      </div>

      <div className="mfv1-10">10</div>

      <div className="mfv1-card">
        <span className="mfv1-halo" />
        <div className="mfv1-chip">{t('splash.chip')}</div>
        <div className="mfv1-shine">
          <div className="mfv1-word">
            {'MindFeed'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
          </div>
        </div>
        <div className="mfv1-rule" />
        <div className="mfv1-meta">{t('splash.meta')}</div>
      </div>
    </div>
  )
}
