import { useId } from 'react';
import { complex, gammaPoint, impedanceToGamma } from '../../lib/tools/smith';

export default function SmithGrid({
  fine,
  admittance,
  labels,
}: {
  fine: boolean;
  admittance: boolean;
  labels: boolean;
}) {
  const clip = useId().replace(/:/g, '');
  const values = fine
    ? [0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 3, 4, 5, 10, 20]
    : [0.2, 0.5, 1, 2, 5];
  const major = [0.2, 0.5, 1, 2, 5];
  function grid(overlay: boolean) {
    return (
      <g
        transform={overlay ? 'rotate(180 260 260)' : undefined}
        className={overlay ? 'smith-admittance' : 'smith-impedance-grid'}
      >
        {values.map((r) => (
          <circle
            key={`r${r}`}
            cx={260 + (218.4 * r) / (1 + r)}
            cy="260"
            r={218.4 / (1 + r)}
            className={major.includes(r) ? 'smith-grid smith-major' : 'smith-grid'}
          />
        ))}
        {values
          .flatMap((v) => [v, -v])
          .map((x) => (
            <circle
              key={`x${x}`}
              cx="478.4"
              cy={260 - 218.4 / x}
              r={Math.abs(218.4 / x)}
              className={major.includes(Math.abs(x)) ? 'smith-grid smith-major' : 'smith-grid'}
            />
          ))}
      </g>
    );
  }
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <circle cx="260" cy="260" r="218.4" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {grid(false)}
        {admittance && grid(true)}
      </g>
      <circle cx="260" cy="260" r="218.4" className="smith-boundary" />
      <line x1="41.6" y1="260" x2="478.4" y2="260" className="smith-axis" />
      {labels && (
        <g className="smith-scale-labels">
          {[0, 0.2, 0.5, 1, 2, 5, 10].map((r) => {
            const p = gammaPoint(impedanceToGamma(complex(r), 1));
            return (
              <text key={r} x={p.x + 3} y="272">
                {r}
              </text>
            );
          })}
          {admittance &&
            [0.2, 0.5, 1, 2, 5].map((g) => {
              const p = gammaPoint(impedanceToGamma(complex(g), 1));
              return (
                <text
                  key={`g${g}`}
                  className="smith-g-label"
                  x={520 - p.x - 3}
                  y="253"
                  textAnchor="end"
                >
                  g {g}
                </text>
              );
            })}
          {[0.2, 0.5, 1, 2, 5]
            .flatMap((x) => [x, -x])
            .map((x) => {
              const p = gammaPoint(impedanceToGamma(complex(0, x), 1));
              return (
                <text
                  key={x}
                  x={260 + (p.x - 260) * 1.035}
                  y={260 + (p.y - 260) * 1.035}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {x > 0 ? '+' : '−'}j{Math.abs(x)}
                </text>
              );
            })}
          <text x="475" y="273">
            ∞
          </text>
        </g>
      )}
      <g className="smith-scale">
        {Array.from({ length: 100 }, (_, i) => {
          // Clockwise wavelength scale starts at the negative real axis.
          const a = Math.PI - (i * Math.PI) / 50;
          const point = (r: number) => ({ x: 260 + r * Math.cos(a), y: 260 - r * Math.sin(a) });
          const start = point(239),
            end = point(i % 5 === 0 ? 245 : 242),
            label = point(252);
          return (
            <g key={i}>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
              {labels && i % 10 === 0 && (
                <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle">
                  {(i / 200).toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i * Math.PI) / 18;
          return labels && i % 3 === 0 ? (
            <text
              key={i}
              x={260 + 231 * Math.cos(a)}
              y={260 - 231 * Math.sin(a)}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {i <= 18 ? i * 10 : i * 10 - 360}°
            </text>
          ) : null;
        })}
      </g>
    </>
  );
}
