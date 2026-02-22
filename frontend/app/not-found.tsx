"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:     #05080f;
          --bg2:    #090e19;
          --teal:   #14b8a6;
          --teal-d: rgba(20,184,166,0.15);
          --teal-g: rgba(20,184,166,0.35);
          --red:    #fb7185;
          --text:   #dde8f4;
          --text2:  #4a6380;
          --border: rgba(148,196,242,0.08);
        }

        html, body { height: 100%; background: var(--bg); }

        .page {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
          padding: 40px 20px;
        }

        /* Scanline overlay */
        .page::before {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.07) 2px,
            rgba(0,0,0,0.07) 4px
          );
          pointer-events: none; z-index: 10;
        }

        /* Grid background */
        .page::after {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(148,196,242,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,196,242,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }

        .content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          max-width: 560px;
        }

        /* ECG / flatline SVG */
        .ecg-wrap {
          width: 340px; height: 80px;
          margin-bottom: 36px;
          position: relative;
        }

        .ecg-line {
          stroke: var(--teal);
          stroke-width: 2.5;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 6px var(--teal-g));
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: draw-ecg 1.8s cubic-bezier(0.4,0,0.2,1) forwards;
        }

        .flatline {
          stroke: var(--red);
          stroke-width: 2;
          fill: none;
          opacity: 0;
          filter: drop-shadow(0 0 4px rgba(251,113,133,0.5));
          animation: show-flat 0.4s ease 2s forwards;
        }

        @keyframes draw-ecg {
          to { stroke-dashoffset: 0; }
        }

        @keyframes show-flat {
          to { opacity: 1; }
        }

        /* 404 number */
        .four-oh-four {
          font-family: 'Fraunces', serif;
          font-size: clamp(90px, 18vw, 140px);
          font-weight: 700;
          line-height: 0.9;
          letter-spacing: -4px;
          color: var(--text);
          margin-bottom: 8px;
          position: relative;
          animation: glitch-in 0.6s ease 0.3s both;
        }

        /* Glitch layers */
        .four-oh-four::before,
        .four-oh-four::after {
          content: '404';
          position: absolute; inset: 0;
          font-family: 'Fraunces', serif;
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
        }
        .four-oh-four::before {
          color: var(--teal);
          clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%);
          animation: glitch-1 3.5s infinite 2.5s;
        }
        .four-oh-four::after {
          color: var(--red);
          clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%);
          animation: glitch-2 3.5s infinite 2.5s;
        }

        @keyframes glitch-in {
          from { opacity: 0; transform: translateY(12px) skewX(-3deg); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes glitch-1 {
          0%,90%,100% { transform: none; opacity: 0; }
          92%  { transform: translateX(-4px); opacity: 0.8; }
          94%  { transform: translateX(4px);  opacity: 0.8; }
          96%  { transform: translateX(-2px); opacity: 0.6; }
          98%  { transform: none; opacity: 0; }
        }
        @keyframes glitch-2 {
          0%,90%,100% { transform: none; opacity: 0; }
          93%  { transform: translateX(4px);  opacity: 0.7; }
          95%  { transform: translateX(-4px); opacity: 0.7; }
          97%  { transform: translateX(2px);  opacity: 0.5; }
          99%  { transform: none; opacity: 0; }
        }

        .status-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 999px;
          background: rgba(251,113,133,0.12);
          border: 1px solid rgba(251,113,133,0.3);
          color: var(--red);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 500;
          letter-spacing: 1px;
          margin-bottom: 20px;
          animation: fade-up 0.5s ease 0.8s both;
        }

        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--red);
          animation: blink 1.2s ease-in-out infinite;
        }
        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0.2; }
        }

        .title {
          font-family: 'Fraunces', serif;
          font-size: clamp(20px, 4vw, 26px);
          font-weight: 700;
          color: var(--text);
          margin-bottom: 10px;
          animation: fade-up 0.5s ease 1s both;
        }

        .desc {
          font-size: 15px;
          color: var(--text2);
          line-height: 1.7;
          margin-bottom: 36px;
          animation: fade-up 0.5s ease 1.2s both;
        }

        .actions {
          display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
          animation: fade-up 0.5s ease 1.4s both;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 24px; border-radius: 9px;
          background: linear-gradient(135deg, var(--teal), #0d9488);
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 4px 18px var(--teal-g);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px var(--teal-g);
        }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 24px; border-radius: 9px;
          background: rgba(20,184,166,0.06);
          border: 1px solid rgba(148,196,242,0.16);
          color: var(--text2); font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          text-decoration: none; cursor: pointer;
          transition: all 0.15s;
        }
        .btn-ghost:hover {
          background: rgba(20,184,166,0.1);
          border-color: rgba(20,184,166,0.3);
          color: var(--teal);
        }

        /* Divider */
        .divider {
          width: 100%; height: 1px;
          background: var(--border);
          margin: 32px 0;
        }

        .meta {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: var(--text2);
          letter-spacing: 0.5px;
          animation: fade-up 0.5s ease 1.6s both;
        }
        .meta span { color: var(--teal); }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }

        /* Ambient glow blobs */
        .blob {
          position: fixed; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .blob-1 {
          width: 400px; height: 400px;
          background: rgba(20,184,166,0.06);
          top: -100px; right: -100px;
        }
        .blob-2 {
          width: 300px; height: 300px;
          background: rgba(251,113,133,0.05);
          bottom: -80px; left: -80px;
        }
      `}</style>

      <div className="page">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        <div className="content">
          {/* ECG flatline animation */}
          <div className="ecg-wrap">
            <svg viewBox="0 0 340 80" width="340" height="80">
              {/* Normal ECG beat → flatlines */}
              <path
                className="ecg-line"
                d="M0,40 L60,40 L70,40 L78,10 L84,60 L90,25 L96,40 L120,40 L130,40 L138,14 L144,58 L150,28 L156,40 L200,40"
              />
              {/* Flatline that appears after */}
              <line className="flatline" x1="200" y1="40" x2="340" y2="40" />
            </svg>
          </div>

          {/* Status */}
          <div className="status-chip">
            <span className="status-dot" />
            SIGNAL LOST · ERR_404
          </div>

          {/* Big number */}
          <div className="four-oh-four">404</div>

          <div className="title">Page Not Found</div>

          <p className="desc">
            The route you're looking for has flatlined.
            <br />
            It may have been moved, deleted, or never existed.
          </p>

          <div className="actions">
            <Link href="/" className="btn-primary">
              ✚ Return to Dashboard
            </Link>
            <button className="btn-ghost" onClick={() => window.history.back()}>
              ← Go Back
            </button>
          </div>

          <div className="divider" />

          <div className="meta">
            checkme · <span>patient symptom logger</span> · page not found
          </div>
        </div>
      </div>
    </>
  );
}
