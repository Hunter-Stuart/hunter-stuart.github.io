export interface Complex {
  re: number;
  im: number;
}

export const complex = (re: number, im = 0): Complex => ({ re, im });
export const add = (a: Complex, b: Complex) => complex(a.re + b.re, a.im + b.im);
export const subtract = (a: Complex, b: Complex) => complex(a.re - b.re, a.im - b.im);
export const multiply = (a: Complex, b: Complex) =>
  complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export function divide(a: Complex, b: Complex) {
  const denominator = b.re * b.re + b.im * b.im;
  if (denominator === 0) return complex(Infinity, 0);
  return complex(
    (a.re * b.re + a.im * b.im) / denominator,
    (a.im * b.re - a.re * b.im) / denominator,
  );
}
export const magnitude = (value: Complex) => Math.hypot(value.re, value.im);

export function impedanceToGamma(impedance: Complex, z0: number) {
  if (impedance.re === Infinity) return complex(1);
  const normalized = complex(impedance.re / z0, impedance.im / z0);
  return divide(subtract(normalized, complex(1)), add(normalized, complex(1)));
}

export function gammaToImpedance(gamma: Complex, z0: number) {
  const denominator = (1 - gamma.re) ** 2 + gamma.im ** 2;
  if (denominator < 1e-28) return complex(Infinity, 0);
  const resistance = 1 - gamma.re ** 2 - gamma.im ** 2;
  const passiveResistance = magnitude(gamma) <= 1 + 1e-12 ? Math.max(0, resistance) : resistance;
  return complex((passiveResistance * z0) / denominator, (2 * gamma.im * z0) / denominator);
}

export function rotateGamma(gamma: Complex, wavelengths: number, towardGenerator = true) {
  const angle = (towardGenerator ? -1 : 1) * 4 * Math.PI * wavelengths;
  return multiply(gamma, complex(Math.cos(angle), Math.sin(angle)));
}

export function transformImpedance(
  load: Complex,
  z0: number,
  wavelengths: number,
  towardGenerator = true,
) {
  return gammaToImpedance(
    rotateGamma(impedanceToGamma(load, z0), wavelengths, towardGenerator),
    z0,
  );
}

export function smithMetrics(impedance: Complex, z0: number) {
  const gamma = impedanceToGamma(impedance, z0);
  const rawReflection = magnitude(gamma);
  const reflection = Math.abs(rawReflection - 1) < 1e-12 ? 1 : rawReflection;
  return {
    gamma,
    magnitude: reflection,
    phaseDegrees: (Math.atan2(gamma.im, gamma.re) * 180) / Math.PI,
    vswr: reflection >= 1 ? Infinity : (1 + reflection) / (1 - reflection),
    returnLossDb: reflection === 0 ? Number.POSITIVE_INFINITY : -20 * Math.log10(reflection),
    mismatchLossDb: reflection >= 1 ? Infinity : -10 * Math.log10(1 - reflection * reflection),
  };
}

export function gammaPoint(gamma: Complex, size = 520) {
  const radius = size * 0.42;
  const center = size / 2;
  return { x: center + gamma.re * radius, y: center - gamma.im * radius, radius, center };
}

export function pointToImpedance(x: number, y: number, size: number, z0: number) {
  const radius = size * 0.42;
  const center = size / 2;
  let gamma = complex((x - center) / radius, (center - y) / radius);
  const length = magnitude(gamma);
  if (length >= 0.995) gamma = complex((gamma.re / length) * 0.995, (gamma.im / length) * 0.995);
  return gammaToImpedance(gamma, z0);
}

export function admittance(impedance: Complex) {
  if (impedance.re === Infinity) return complex(0);
  return divide(complex(1), impedance);
}

// The g = 1 circle intersects a constant-|gamma| circle at Re(gamma) = -|gamma|^2.
export function singleStubMatches(load: Complex, z0: number) {
  const gamma = impedanceToGamma(load, z0);
  const rho = magnitude(gamma);
  if (rho >= 1 || load.re <= 0) return [];
  if (rho < 1e-10) return [{ distance: 0, susceptance: 0, openStub: 0, shortStub: 0.25 }];
  const phase = Math.atan2(gamma.im, gamma.re);
  const wrap = (length: number) => ((length % 0.5) + 0.5) % 0.5;
  return [1, -1]
    .map((sign) => {
      const targetPhase = sign * Math.acos(-rho);
      const distance = wrap((phase - targetPhase) / (4 * Math.PI));
      const y = admittance(transformImpedance(load, z0, distance));
      const susceptance = -y.im * z0;
      return {
        distance,
        susceptance,
        openStub: wrap(Math.atan(susceptance) / (2 * Math.PI)),
        shortStub: wrap(Math.atan2(-1, susceptance) / (2 * Math.PI)),
      };
    })
    .sort((a, b) => a.distance - b.distance);
}

export interface LMatch {
  // Element order is always described from load toward generator.
  topology: 'seriesFirst' | 'shuntFirst';
  seriesReactance: number;
  shuntSusceptance: number;
}

export function lNetworkMatches(load: Complex, z0: number): LMatch[] {
  if (load.re <= 0 || z0 <= 0 || !Number.isFinite(load.re + load.im + z0)) return [];
  const solutions: LMatch[] = [];
  if (load.re <= z0) {
    const x = Math.sqrt(Math.max(0, load.re * (z0 - load.re)));
    for (const sign of [1, -1])
      solutions.push({
        topology: 'seriesFirst',
        seriesReactance: sign * x - load.im,
        shuntSusceptance: (sign * x) / (load.re * z0),
      });
  }
  const y = admittance(load);
  if (y.re <= 1 / z0) {
    const b = Math.sqrt(Math.max(0, y.re / z0 - y.re * y.re));
    for (const sign of [1, -1])
      solutions.push({
        topology: 'shuntFirst',
        seriesReactance: (sign * b * z0) / y.re,
        shuntSusceptance: sign * b - y.im,
      });
  }
  return solutions.filter(
    (solution, index) =>
      !solutions
        .slice(0, index)
        .some(
          (other) =>
            other.topology === solution.topology &&
            Math.abs(other.seriesReactance - solution.seriesReactance) < 1e-9 &&
            Math.abs(other.shuntSusceptance - solution.shuntSusceptance) < 1e-12,
        ),
  );
}

export function applySeries(load: Complex, reactance: number) {
  return add(load, complex(0, reactance));
}

export function applyShunt(load: Complex, susceptance: number) {
  return admittance(add(admittance(load), complex(0, susceptance)));
}

export function applyLMatch(load: Complex, match: LMatch) {
  return match.topology === 'seriesFirst'
    ? applyShunt(applySeries(load, match.seriesReactance), match.shuntSusceptance)
    : applySeries(applyShunt(load, match.shuntSusceptance), match.seriesReactance);
}

export interface SweepPoint {
  frequency: number;
  gamma: Complex;
}

// Touchstone 1.x, one-port S data. Frequencies are returned in Hz.
export function parseTouchstone(contents: string): { z0: number; points: SweepPoint[] } {
  let z0 = 50;
  let scale = 1e9;
  let format = 'MA';
  const values: number[] = [];
  for (const raw of contents.split(/\r?\n/)) {
    const line = (raw.split('!')[0] ?? '').trim();
    if (!line) continue;
    if (line.startsWith('[')) throw new Error('Touchstone 1.x .s1p only');
    if (line.startsWith('#')) {
      const options = line.slice(1).trim().toUpperCase().split(/\s+/);
      const units: Record<string, number> = { HZ: 1, KHZ: 1e3, MHZ: 1e6, GHZ: 1e9 };
      scale = units[options[0] ?? ''] ?? 0;
      if (!scale || options[1] !== 'S' || !['RI', 'MA', 'DB'].includes(options[2] ?? ''))
        throw new Error('Unsupported S-parameter format');
      format = options[2]!;
      const r = options.indexOf('R');
      z0 = r >= 0 ? Number(options[r + 1]) : 50;
      continue;
    }
    values.push(...line.split(/\s+/).map((value) => Number(value.replace(/[dD]/, 'e'))));
  }
  if (
    !Number.isFinite(z0) ||
    z0 <= 0 ||
    values.length === 0 ||
    values.length % 3 !== 0 ||
    values.length > 30000 ||
    values.some((v) => !Number.isFinite(v))
  )
    throw new Error('Invalid one-port data (max 10000 points)');
  const points: SweepPoint[] = [];
  for (let i = 0; i < values.length; i += 3) {
    // Complete triples and finite numbers were validated above.
    const frequency = values[i]! * scale;
    const amplitude = format === 'DB' ? 10 ** (values[i + 1]! / 20) : values[i + 1]!;
    const phase = (values[i + 2]! * Math.PI) / 180;
    const gamma =
      format === 'RI'
        ? complex(values[i + 1]!, values[i + 2]!)
        : complex(amplitude * Math.cos(phase), amplitude * Math.sin(phase));
    if (frequency <= 0 || magnitude(gamma) > 1 + 1e-9 || (format === 'MA' && amplitude < 0))
      throw new Error('Positive frequencies and passive one-port data required');
    points.push({ frequency, gamma });
  }
  return { z0, points: points.sort((a, b) => a.frequency - b.frequency) };
}
