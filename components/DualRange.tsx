'use client';

// Two-thumb range slider built from two overlaid native <input type=range>.
// No external library. Thumbs clamp so they never cross. The colored bar shows
// the selected span. Values are clamped/stepped by the parent via onChange.
export default function DualRange({
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  format = (n: number) => String(n),
}: {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (lo: number, hi: number) => void;
  format?: (n: number) => string;
}) {
  const span = Math.max(1, max - min);
  const loPct = ((valueMin - min) / span) * 100;
  const hiPct = ((valueMax - min) / span) * 100;

  const setLo = (v: number) => onChange(Math.min(v, valueMax - step), valueMax);
  const setHi = (v: number) => onChange(valueMin, Math.max(v, valueMin + step));

  return (
    <div className="mk-dual">
      <div className="mk-dual-track" />
      <div className="mk-dual-fill" style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => setLo(+e.target.value)}
        aria-label="Minimal qiymat"
        style={{ zIndex: valueMin > max - (max - min) * 0.06 ? 5 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => setHi(+e.target.value)}
        aria-label="Maksimal qiymat"
        style={{ zIndex: 4 }}
      />
      <div className="mk-dual-vals">
        <span>{format(valueMin)}</span>
        <span>{format(valueMax)}</span>
      </div>

      <style jsx>{`
        .mk-dual {
          position: relative;
          height: 46px;
          padding-top: 4px;
        }
        .mk-dual-track,
        .mk-dual-fill {
          position: absolute;
          top: 10px;
          height: 4px;
          border-radius: 4px;
        }
        .mk-dual-track {
          left: 0;
          right: 0;
          background: var(--line);
        }
        .mk-dual-fill {
          background: var(--blue);
        }
        .mk-dual input[type='range'] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 24px;
          margin: 0;
          background: none;
          -webkit-appearance: none;
          appearance: none;
          pointer-events: none;
        }
        .mk-dual input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid var(--blue);
          box-shadow: 0 2px 6px rgba(15, 24, 38, 0.2);
          cursor: pointer;
          margin-top: 1px;
        }
        .mk-dual input[type='range']::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid var(--blue);
          box-shadow: 0 2px 6px rgba(15, 24, 38, 0.2);
          cursor: pointer;
        }
        .mk-dual input[type='range']::-webkit-slider-runnable-track {
          background: none;
        }
        .mk-dual-vals {
          position: absolute;
          top: 26px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--slate);
        }
      `}</style>
    </div>
  );
}
