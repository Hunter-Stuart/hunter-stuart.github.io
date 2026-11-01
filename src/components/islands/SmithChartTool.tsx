import { useEffect, useMemo, useRef, useState } from 'react';

import SmithGrid from './SmithGrid';
import ToolTabs from './ToolTabs';
import type { Locale } from '../../i18n/config';
import {
  admittance,
  add,
  applySeries,
  applyShunt,
  gammaToImpedance,
  parseTouchstone,
  rotateGamma,
  type SweepPoint,
  type LMatch,
  complex,
  gammaPoint,
  impedanceToGamma,
  lNetworkMatches,
  magnitude,
  singleStubMatches,
  smithMetrics,
  transformImpedance,
  type Complex,
} from '../../lib/tools/smith';

interface Props {
  locale: Locale;
}

interface Marker {
  id: number;
  label: string;
  load: Complex;
  z0: number;
  frequency: number;
}

const SIZE = 520;
const copy = {
  zh: {
    input: '端口参数',
    line: '传输线变换',
    results: '计算结果',
    matching: '匹配助手',
    resistance: '电阻 R',
    reactance: '电抗 X',
    impedance: '阻抗 Z',
    admittance: '导纳 Y',
    distance: '线长',
    generator: '向信号源',
    load: '向负载',
    save: '保存标记',
    clear: '清空',
    exportSvg: '导出 SVG',
    exportCsv: '导出 CSV',
    fine: '精细网格',
    overlay: '导纳网格',
    physical: '物理长度',
    stub: '并联单短截线',
    lnetwork: 'L 型网络',
    noMatch: '当前点不存在有限的无源匹配方案。',
    drag: '在圆图内点击或拖动以设置负载。',
  },
  en: {
    input: 'Port input',
    line: 'Transmission line',
    results: 'Live results',
    matching: 'Matching assistant',
    resistance: 'Resistance R',
    reactance: 'Reactance X',
    impedance: 'Impedance Z',
    admittance: 'Admittance Y',
    distance: 'Line length',
    generator: 'Toward generator',
    load: 'Toward load',
    save: 'Save marker',
    clear: 'Clear',
    exportSvg: 'Export SVG',
    exportCsv: 'Export CSV',
    fine: 'Fine grid',
    overlay: 'Admittance overlay',
    physical: 'Physical length',
    stub: 'Single shunt stub',
    lnetwork: 'L network',
    noMatch: 'No finite passive match for this point.',
    drag: 'Click or drag inside the chart to set the load.',
  },
} as const;

function format(value: number, digits = 3) {
  if (!Number.isFinite(value)) return '∞';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
}

function formatComplex(value: Complex, unit = '') {
  return `${format(value.re)} ${value.im < 0 ? '−' : '+'} j${format(Math.abs(value.im))}${unit}`;
}

function download(name: string, type: string, contents: string) {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([contents], { type }));
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

function NumericField({
  label,
  value,
  unit,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  onChange(value: number): void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(
    () => setDraft(String(Number.isFinite(value) ? Number(value.toPrecision(9)) : '')),
    [value],
  );
  return (
    <label className="smith-field">
      <span>{label}</span>
      <span>
        <input
          type="number"
          value={draft}
          min={min}
          max={max}
          step="any"
          onChange={(event) => {
            const text = event.target.value;
            setDraft(text);
            const next = Number(text);
            if (
              text !== '' &&
              Number.isFinite(next) &&
              (min === undefined || next >= min) &&
              (max === undefined || next <= max)
            )
              onChange(next);
          }}
          onBlur={() =>
            setDraft(Number.isFinite(value) ? String(Number(value.toPrecision(9))) : '')
          }
        />
        <small>{unit}</small>
      </span>
    </label>
  );
}

const extraCopy = {
  workspace: ['工作区', 'Workspace', 'Arbeitsbereich'],
  portTab: ['参数', 'Port', 'Port'],
  inputTab: ['输入', 'Input', 'Eingabe'],
  readoutTab: ['读数', 'Readout', 'Messwerte'],
  lineTab: ['传输线', 'Line', 'Leitung'],
  matchTab: ['匹配', 'Match', 'Anpassung'],
  dataTab: ['测量', 'Data', 'Daten'],
  viewTab: ['视图', 'View', 'Ansicht'],
  emptySweep: [
    '导入 S1P 文件，在圆图上查看测量轨迹。',
    'Import an S1P file to explore a measured sweep.',
    'S1P-Datei importieren, um die Messkurve anzuzeigen.',
  ],
  emptyMarkers: [
    '保存当前点，随时比较或恢复。',
    'Save the current point to compare or recall it.',
    'Aktuellen Punkt zum Vergleichen oder Wiederherstellen speichern.',
  ],
  frequency: ['频率', 'Frequency', 'Frequenz'],
  velocity: ['速度因子', 'Velocity factor', 'Verkürzungsfaktor'],
  scales: ['刻度标签', 'Scale labels', 'Skalenwerte'],
  standing: ['等驻波比圆', 'VSWR circle', 'VSWR-Kreis'],
  inputMode: ['输入形式', 'Input format', 'Eingabeformat'],
  matched: ['匹配', 'Matched', 'Angepasst'],
  short: ['短路', 'Short', 'Kurzschluss'],
  open: ['开路', 'Open', 'Leerlauf'],
  phase: ['相位', 'Phase', 'Phase'],
  magnitude: ['幅度', 'Magnitude', 'Betrag'],
  series: ['串联电抗', 'Series reactance', 'Serienreaktanz'],
  shunt: ['并联电纳', 'Shunt susceptance', 'Parallelsuszeptanz'],
  apply: ['接入', 'Apply', 'Anwenden'],
  preview: ['预览路径', 'Preview path', 'Pfad anzeigen'],
  cancel: ['取消预览', 'Clear preview', 'Vorschau löschen'],
  manual: ['手动匹配', 'Manual matching', 'Manuelle Anpassung'],
  reset: ['恢复初始值', 'Reset load', 'Last zurücksetzen'],
  markers: ['标记', 'Markers', 'Marker'],
  sweep: ['测量轨迹', 'Measurement sweep', 'Messkurve'],
  import: ['导入 S1P', 'Import S1P', 'S1P importieren'],
  error: [
    '文件无效：仅支持无源单端口 Touchstone 1.x（RI / MA / DB，最多 10000 点）。',
    'Invalid file: passive one-port Touchstone 1.x only (RI / MA / DB, max 10000 points).',
    'Ungültige Datei: passive Touchstone 1.x S1P (RI / MA / DB, max. 10000 Punkte).',
  ],
  instructions: [
    '拖动设置负载；方向键微调 Γ，Shift 加速；双击恢复视图。外圈为向源波长刻度。',
    'Drag to set load; arrow keys adjust Γ, Shift for larger steps; double-click resets zoom. Outer scale: wavelengths toward generator.',
    'Ziehen setzt die Last; Pfeiltasten ändern Γ, Shift für größere Schritte; Doppelklick setzt Zoom zurück. Außen: Wellenlängen zum Generator.',
  ],
  ideal: [
    '理想无损线与无源元件 · 匹配基于当前变换点 · 元件顺序从负载到信号源',
    'Ideal lossless line and passive elements · Matching at current point · Element order: load → generator',
    'Ideale verlustlose Leitung und passive Bauteile · Anpassung am aktuellen Punkt · Reihenfolge: Last → Generator',
  ],
  already: [
    '当前已匹配，无需增加元件。',
    'Already matched; no additional components needed.',
    'Bereits angepasst; keine weiteren Bauteile nötig.',
  ],
  usePoint: ['使用此点', 'Use point', 'Punkt übernehmen'],
  reflected: ['反射功率', 'Reflected power', 'Reflektierte Leistung'],
  clearSweep: ['移除轨迹', 'Remove sweep', 'Messkurve entfernen'],
  saved: ['已保存标记', 'Marker saved', 'Marker gespeichert'],
} as const;

type Panel = 'port' | 'line' | 'match' | 'data' | 'view';
type MatchMode = 'lnetwork' | 'stub' | 'manual';
type InputMode = 'Z' | 'z' | 'Y' | 'Γ';
export default function SmithChartTool({ locale }: Props) {
  const labels = copy[locale];
  const languageIndex = locale === 'zh' ? 0 : 1;
  const t = (key: keyof typeof extraCopy) => extraCopy[key][languageIndex];
  const [panel, setPanel] = useState<Panel>('port');
  const [portSection, setPortSection] = useState<'input' | 'readout'>('input');
  const [matchMode, setMatchMode] = useState<MatchMode>('lnetwork');
  const [load, setLoad] = useState<Complex>(complex(75, 25));
  const [z0, setZ0] = useState(50);
  const [frequency, setFrequency] = useState(100);
  const [velocityFactor, setVelocityFactor] = useState(0.66);
  const [distance, setDistance] = useState(0);
  const [towardGenerator, setTowardGenerator] = useState(true);
  const [fineGrid, setFineGrid] = useState(true);
  const [showAdmittance, setShowAdmittance] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showVswr, setShowVswr] = useState(true);
  const [mode, setMode] = useState<InputMode>('Z');
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [sweep, setSweep] = useState<SweepPoint[]>([]);
  const [sweepIndex, setSweepIndex] = useState(0);
  const [sweepZ0, setSweepZ0] = useState(50);
  const [message, setMessage] = useState('');
  const [zoom, setZoom] = useState(1);
  const [manualX, setManualX] = useState(25);
  const [manualB, setManualB] = useState(5);
  const [preview, setPreview] = useState<Complex[]>([]);
  const [hover, setHover] = useState<Complex | null>(null);
  const [ready, setReady] = useState(false);
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const markerId = useRef(0);
  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(''), 6000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('orbit-smith-v1') ?? 'null');
      if (saved && Number.isFinite(saved.z0) && saved.z0 > 0 && saved.z0 <= 1e9) {
        setZ0(saved.z0);
        if (
          saved.gamma &&
          Number.isFinite(saved.gamma.re) &&
          Number.isFinite(saved.gamma.im) &&
          magnitude(saved.gamma) <= 1 + 1e-9
        )
          setLoad(gammaToImpedance(saved.gamma, saved.z0));
        if (
          !saved.gamma &&
          saved.load &&
          Number.isFinite(saved.load.re) &&
          saved.load.re >= 0 &&
          Number.isFinite(saved.load.im)
        )
          setLoad(saved.load);
        if (Number.isFinite(saved.frequency) && saved.frequency > 0) setFrequency(saved.frequency);
        if (
          Number.isFinite(saved.velocityFactor) &&
          saved.velocityFactor > 0 &&
          saved.velocityFactor <= 1
        )
          setVelocityFactor(saved.velocityFactor);
        if (Array.isArray(saved.markers)) {
          const valid = saved.markers
            .filter(
              (m: Marker) =>
                Number.isFinite(m.id) &&
                typeof m.label === 'string' &&
                Number.isFinite(m.z0) &&
                m.z0 > 0 &&
                Number.isFinite(m.frequency) &&
                m.frequency > 0 &&
                m.load &&
                Number.isFinite(m.load.re) &&
                m.load.re >= 0 &&
                Number.isFinite(m.load.im),
            )
            .slice(0, 100);
          setMarkers(valid);
          markerId.current = Math.max(0, ...valid.map((m: Marker) => m.id));
        }
      }
    } catch {
      /* Storage is optional. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        'orbit-smith-v1',
        JSON.stringify({
          gamma: impedanceToGamma(load, z0),
          z0,
          frequency,
          velocityFactor,
          markers,
        }),
      );
    } catch {
      /* Keep working without storage. */
    }
  }, [load, z0, frequency, velocityFactor, markers, ready]);
  useEffect(() => setPreview([]), [load, z0, distance, towardGenerator, frequency]);

  const transformed = useMemo(
    () => transformImpedance(load, z0, distance, towardGenerator),
    [distance, load, towardGenerator, z0],
  );
  const metrics = smithMetrics(transformed, z0);
  const loadGamma = impedanceToGamma(load, z0);
  const activePoint = gammaPoint(metrics.gamma);
  const loadPoint = gammaPoint(loadGamma);
  const stubSolutions = useMemo(() => singleStubMatches(transformed, z0), [transformed, z0]);
  const lMatches = useMemo(() => lNetworkMatches(transformed, z0), [transformed, z0]);
  const wavelength = (299_792_458 / (frequency * 1e6)) * velocityFactor;
  const input =
    mode === 'z' ? complex(load.re / z0, load.im / z0) : mode === 'Y' ? admittance(load) : load;
  const loadMetrics = smithMetrics(load, z0);
  const matched = metrics.magnitude < 1e-8;

  function changeLoad(value: Complex) {
    setLoad(value);
    setDistance(0);
  }
  function changeInput(re: number, im: number) {
    changeLoad(
      mode === 'z'
        ? complex(re * z0, im * z0)
        : mode === 'Y'
          ? admittance(complex(re / 1000, im / 1000))
          : complex(re, im),
    );
  }
  function pointerGamma(event: React.PointerEvent<SVGSVGElement>) {
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const gamma = complex((point.x - 260) / 218.4, (260 - point.y) / 218.4);
    return gamma;
  }
  function setFromPointer(event: React.PointerEvent<SVGSVGElement>) {
    const gamma = pointerGamma(event);
    if (!gamma) return;
    // Keep drag input finite; exact open/short are available as presets.
    const rho = magnitude(gamma);
    const limited =
      rho >= 0.9999 ? complex((gamma.re / rho) * 0.9999, (gamma.im / rho) * 0.9999) : gamma;
    changeLoad(gammaToImpedance(limited, z0));
  }
  function path(points: Complex[]) {
    return points
      .map((gamma, i) => {
        const p = gammaPoint(gamma);
        return `${i ? 'L' : 'M'}${p.x.toFixed(3)},${p.y.toFixed(3)}`;
      })
      .join(' ');
  }
  function impedancePath(points: Complex[]) {
    return path(points.map((z) => impedanceToGamma(z, z0)));
  }
  function manualPath(kind: 'series' | 'shunt') {
    const apply = kind === 'series' ? applySeries : applyShunt;
    const value = kind === 'series' ? manualX : manualB / 1000;
    return Array.from({ length: 81 }, (_, i) => apply(transformed, (value * i) / 80));
  }
  function matchPath(match: LMatch) {
    const first = match.topology === 'seriesFirst' ? applySeries : applyShunt;
    const second = match.topology === 'seriesFirst' ? applyShunt : applySeries;
    const v1 = match.topology === 'seriesFirst' ? match.seriesReactance : match.shuntSusceptance;
    const v2 = match.topology === 'seriesFirst' ? match.shuntSusceptance : match.seriesReactance;
    const middle = first(transformed, v1);
    return [
      ...Array.from({ length: 81 }, (_, i) => first(transformed, (v1 * i) / 80)),
      ...Array.from({ length: 81 }, (_, i) => second(middle, (v2 * i) / 80)),
    ];
  }
  function stubPath(solution: (typeof stubSolutions)[number]) {
    const middle = transformImpedance(transformed, z0, solution.distance);
    return [
      ...Array.from({ length: 101 }, (_, i) =>
        transformImpedance(transformed, z0, (solution.distance * i) / 100),
      ),
      ...Array.from({ length: 81 }, (_, i) =>
        applyShunt(middle, ((solution.susceptance / z0) * i) / 80),
      ),
    ];
  }
  function component(value: number, shunt = false) {
    if (Math.abs(value) < 1e-12) return '—';
    const omega = 2 * Math.PI * frequency * 1e6;
    const inductor = shunt ? value < 0 : value > 0;
    const result = inductor
      ? (shunt ? -1 / (omega * value) : value / omega) * 1e9
      : (shunt ? value / omega : -1 / (omega * value)) * 1e12;
    return `${inductor ? 'L' : 'C'} = ${format(result, 4)} ${inductor ? 'nH' : 'pF'}`;
  }
  function saveMarker() {
    if (!Number.isFinite(transformed.re + transformed.im)) return;
    const id = ++markerId.current;
    setMarkers((current) => [
      ...current.slice(-99),
      { id, label: `M${id}`, load: transformed, z0, frequency },
    ]);
    setMessage(t('saved'));
  }
  function exportSvg() {
    const source = svgRef.current;
    if (!source) return;
    const clone = source.cloneNode(true) as SVGSVGElement;
    const originals = [source, ...source.querySelectorAll('*')];
    const clones = [clone, ...clone.querySelectorAll('*')];
    originals.forEach((node, index) => {
      const computed = getComputedStyle(node);
      for (const property of [
        'fill',
        'stroke',
        'stroke-width',
        'stroke-dasharray',
        'opacity',
        'font-size',
        'font-family',
        'font-weight',
        'paint-order',
      ])
        (clones[index] as SVGElement).style.setProperty(
          property,
          computed.getPropertyValue(property),
        );
    });
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', '1040');
    clone.setAttribute('height', '1040');
    clone.setAttribute('viewBox', '0 0 520 520');
    download('smith-chart.svg', 'image/svg+xml', new XMLSerializer().serializeToString(clone));
  }
  function exportCsv() {
    const rows: (string | number)[][] = [
      [
        'label',
        'frequency_hz',
        'z0_ohm',
        'R_ohm',
        'X_ohm',
        'gamma_re',
        'gamma_im',
        'vswr',
        'return_loss_db',
      ],
    ];
    const row = (label: string, z: Complex, reference: number, f: number) => {
      const m = smithMetrics(z, reference);
      rows.push([label, f, reference, z.re, z.im, m.gamma.re, m.gamma.im, m.vswr, m.returnLossDb]);
    };
    row('load', load, z0, frequency * 1e6);
    row('transformed', transformed, z0, frequency * 1e6);
    markers.forEach((m) => row(m.label, m.load, m.z0, m.frequency * 1e6));
    sweep.forEach((p, i) =>
      row(`S${i + 1}`, gammaToImpedance(p.gamma, sweepZ0), sweepZ0, p.frequency),
    );
    download('smith-chart.csv', 'text/csv;charset=utf-8', rows.map((r) => r.join(',')).join('\n'));
  }
  async function importSweep(file?: File) {
    if (!file) return;
    try {
      if (!file.name.toLowerCase().endsWith('.s1p') || file.size > 2_000_000)
        throw new Error('S1P only');
      const result = parseTouchstone(await file.text());
      setSweep(result.points);
      setSweepZ0(result.z0);
      setSweepIndex(0);
      setZ0(result.z0);
      setFrequency(result.points[0]!.frequency / 1e6);
      changeLoad(gammaToImpedance(result.points[0]!.gamma, result.z0));
      setMessage(`${file.name} · ${result.points.length}`);
      setPanel('data');
    } catch {
      setMessage(t('error'));
    }
  }

  return (
    <div className="smith-workbench">
      <section className="smith-chart-panel">
        <div className="tool-toolbar">
          <div>
            <strong>
              Γ {format(metrics.magnitude, 4)} ∠ {format(metrics.phaseDegrees, 1)}°
            </strong>
          </div>
          <div>
            <button type="button" onClick={saveMarker}>
              {labels.save} ↗
            </button>
            <button type="button" onClick={() => importRef.current?.click()}>
              {t('import')} ↑
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".s1p"
              hidden
              onChange={(e) => {
                void importSweep(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <button type="button" onClick={exportSvg}>
              SVG ↓
            </button>
            <button type="button" onClick={exportCsv}>
              CSV ↓
            </button>
          </div>
        </div>
        <svg
          ref={svgRef}
          className="smith-chart"
          viewBox={`${260 - 260 / zoom} ${260 - 260 / zoom} ${SIZE / zoom} ${SIZE / zoom}`}
          role="application"
          tabIndex={0}
          aria-label={`${labels.drag} ${t('instructions')}`}
          onDoubleClick={() => setZoom(1)}
          onKeyDown={(e) => {
            const directions: Record<string, Complex> = {
              ArrowRight: complex(1),
              ArrowLeft: complex(-1),
              ArrowUp: complex(0, 1),
              ArrowDown: complex(0, -1),
            };
            const direction = directions[e.key];
            if (!direction) return;
            e.preventDefault();
            const step = e.shiftKey ? 0.025 : 0.0025;
            const gamma = add(loadGamma, complex(direction.re * step, direction.im * step));
            if (magnitude(gamma) < 0.9999) changeLoad(gammaToImpedance(gamma, z0));
          }}
          onPointerDown={(e) => {
            const g = pointerGamma(e);
            if (!g || magnitude(g) > 1.02) return;
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromPointer(e);
          }}
          onPointerMove={(e) => {
            const g = pointerGamma(e);
            setHover(g && magnitude(g) < 0.9999 ? gammaToImpedance(g, z0) : null);
            if (dragging.current) setFromPointer(e);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          onLostPointerCapture={() => {
            dragging.current = false;
          }}
          onPointerLeave={() => setHover(null)}
        >
          <title>{`Smith chart · Z₀ = ${z0} Ω`}</title>
          <SmithGrid fine={fineGrid} admittance={showAdmittance} labels={showLabels} />
          {showVswr && (
            <circle
              cx="260"
              cy="260"
              r={Math.min(1, magnitude(loadGamma)) * 218.4}
              className="smith-vswr"
            />
          )}
          <line x1="260" y1="260" x2={activePoint.x} y2={activePoint.y} className="smith-vector" />
          {distance > 0 && (
            <path
              d={path(
                Array.from({ length: 161 }, (_, i) =>
                  rotateGamma(loadGamma, (distance * i) / 160, towardGenerator),
                ),
              )}
              className="smith-line-path"
            />
          )}
          {sweep.length > 0 && (
            <path
              d={path(sweep.map((p) => impedanceToGamma(gammaToImpedance(p.gamma, sweepZ0), z0)))}
              className="smith-sweep-path"
            />
          )}
          {preview.length > 0 && <path d={impedancePath(preview)} className="smith-match-path" />}
          {markers.map((marker) => {
            const p = gammaPoint(impedanceToGamma(marker.load, z0));
            return (
              <g key={marker.id} transform={`translate(${p.x} ${p.y})`} className="smith-marker">
                <circle r="2.6" />
                <text x="6" y="-6">
                  {marker.label}
                </text>
              </g>
            );
          })}
          {distance > 0 && (
            <circle cx={loadPoint.x} cy={loadPoint.y} r="2.6" className="smith-load-point" />
          )}
          <g transform={`translate(${activePoint.x} ${activePoint.y})`} className="smith-active">
            <circle r="6" />
            <circle r="2.6" />
            <path d="M-11 0h5M6 0h5M0-11v5M0 6v5" />
          </g>
        </svg>
        <div className="smith-chart-foot">
          <span className="tool-note">
            {hover
              ? `Z = ${formatComplex(hover, ' Ω')} / z = ${formatComplex(complex(hover.re / z0, hover.im / z0))}`
              : `Z = ${formatComplex(transformed, ' Ω')} · Z₀ ${z0} Ω · ${format(frequency)} MHz`}
          </span>
          <div>
            <button
              type="button"
              aria-label="Zoom out"
              disabled={zoom <= 1}
              onClick={() => setZoom((v) => Math.max(1, v - 0.5))}
            >
              −
            </button>
            <button type="button" onClick={() => setZoom(1)}>
              {format(zoom)}×
            </button>
            <button
              type="button"
              aria-label="Zoom in"
              disabled={zoom >= 3}
              onClick={() => setZoom((v) => Math.min(3, v + 0.5))}
            >
              +
            </button>
          </div>
        </div>

        {message && (
          <p className="tool-note" role="status">
            {message}
          </p>
        )}
      </section>
      <aside className="tool-controls smith-controls">
        <ToolTabs<Panel>
          label={t('workspace')}
          prefix="smith"
          tabs={[
            { id: 'port', label: t('portTab') },
            { id: 'line', label: t('lineTab') },
            { id: 'match', label: t('matchTab') },
            { id: 'data', label: t('dataTab') },
            { id: 'view', label: t('viewTab') },
          ]}
          active={panel}
          onChange={setPanel}
        />
        <div className="tool-panel-stack">
          <section
            className="tool-card tool-tab-panel"
            role="tabpanel"
            id="smith-panel-port"
            aria-labelledby="smith-tab-port"
            hidden={panel !== 'port'}
            tabIndex={0}
          >
            <h2>{labels.input}</h2>
            <div className="smith-port-switch" role="group" aria-label={t('portTab')}>
              <button
                type="button"
                aria-pressed={portSection === 'input'}
                onClick={() => setPortSection('input')}
              >
                {t('inputTab')}
              </button>
              <button
                type="button"
                aria-pressed={portSection === 'readout'}
                onClick={() => setPortSection('readout')}
              >
                {t('readoutTab')}
              </button>
            </div>
            <div className="smith-port-input" data-active={portSection === 'input'}>
              <div className="smith-direction" role="group" aria-label={t('inputMode')}>
                {(['Z', 'z', 'Y', 'Γ'] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={mode === value}
                    onClick={() => setMode(value)}
                  >
                    {value}
                    {value === 'Z' ? ' / Ω' : value === 'Y' ? ' / mS' : ''}
                  </button>
                ))}
              </div>
              <div className="smith-fields">
                {mode === 'Γ' ? (
                  <>
                    <NumericField
                      label={`|Γ| / ${t('magnitude')}`}
                      value={loadMetrics.magnitude}
                      min={0}
                      max={1}
                      onChange={(rho) =>
                        changeLoad(
                          gammaToImpedance(
                            complex(
                              rho * Math.cos((loadMetrics.phaseDegrees * Math.PI) / 180),
                              rho * Math.sin((loadMetrics.phaseDegrees * Math.PI) / 180),
                            ),
                            z0,
                          ),
                        )
                      }
                    />
                    <NumericField
                      label={t('phase')}
                      value={loadMetrics.phaseDegrees}
                      unit="°"
                      onChange={(phase) =>
                        changeLoad(
                          gammaToImpedance(
                            complex(
                              loadMetrics.magnitude * Math.cos((phase * Math.PI) / 180),
                              loadMetrics.magnitude * Math.sin((phase * Math.PI) / 180),
                            ),
                            z0,
                          ),
                        )
                      }
                    />
                  </>
                ) : (
                  <>
                    <NumericField
                      label={mode === 'Y' ? 'G' : labels.resistance}
                      value={mode === 'Y' ? input.re * 1000 : input.re}
                      unit={mode === 'Z' ? 'Ω' : mode === 'Y' ? 'mS' : ''}
                      min={0}
                      onChange={(re) => changeInput(re, mode === 'Y' ? input.im * 1000 : input.im)}
                    />
                    <NumericField
                      label={mode === 'Y' ? 'B' : labels.reactance}
                      value={mode === 'Y' ? input.im * 1000 : input.im}
                      unit={mode === 'Z' ? 'Ω' : mode === 'Y' ? 'mS' : ''}
                      onChange={(im) => changeInput(mode === 'Y' ? input.re * 1000 : input.re, im)}
                    />
                  </>
                )}
                <NumericField
                  label="Z₀"
                  value={z0}
                  unit="Ω"
                  min={0.001}
                  max={1e9}
                  onChange={setZ0}
                />
                <NumericField
                  label={t('frequency')}
                  value={frequency}
                  unit="MHz"
                  min={0.000001}
                  max={1e9}
                  onChange={setFrequency}
                />
              </div>
              <div className="smith-presets">
                {[25, 50, 75, 100].map((v) => (
                  <button type="button" key={v} aria-pressed={z0 === v} onClick={() => setZ0(v)}>
                    {v} Ω
                  </button>
                ))}
              </div>
              <div className="smith-presets">
                <button type="button" onClick={() => changeLoad(complex(z0))}>
                  {t('matched')}
                </button>
                <button type="button" onClick={() => changeLoad(complex(0))}>
                  {t('short')}
                </button>
                <button type="button" onClick={() => changeLoad(complex(Infinity))}>
                  {t('open')}
                </button>
                <button type="button" onClick={() => changeLoad(complex(75, 25))}>
                  {t('reset')}
                </button>
              </div>
            </div>
            <dl
              className="smith-results smith-live-results"
              data-active={portSection === 'readout'}
            >
              {[
                [labels.impedance, formatComplex(transformed, ' Ω')],
                [
                  labels.admittance,
                  formatComplex(
                    complex(admittance(transformed).re * 1e3, admittance(transformed).im * 1e3),
                    ' mS',
                  ),
                ],
                ['VSWR', format(metrics.vswr)],
                ['Return loss', `${format(metrics.returnLossDb)} dB`],
                ['Mismatch loss', `${format(metrics.mismatchLossDb)} dB`],
                [t('reflected'), `${format(metrics.magnitude ** 2 * 100)} %`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section
            className="tool-card tool-tab-panel"
            role="tabpanel"
            id="smith-panel-line"
            aria-labelledby="smith-tab-line"
            hidden={panel !== 'line'}
            tabIndex={0}
          >
            <h2>{labels.line}</h2>
            <div className="smith-direction">
              <button
                type="button"
                aria-pressed={towardGenerator}
                onClick={() => setTowardGenerator(true)}
              >
                {labels.generator} ↻
              </button>
              <button
                type="button"
                aria-pressed={!towardGenerator}
                onClick={() => setTowardGenerator(false)}
              >
                {labels.load} ↺
              </button>
            </div>
            <label className="smith-range">
              <span>
                {labels.distance}: {format(distance, 4)} λ · βl = {format(distance * 360, 1)}°
              </span>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.0001"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
              />
            </label>
            <div className="smith-fields">
              <NumericField
                label={labels.distance}
                value={distance}
                unit="λ"
                min={0}
                max={0.5}
                onChange={setDistance}
              />
              <NumericField
                label={t('velocity')}
                value={velocityFactor}
                min={0.001}
                max={1}
                onChange={setVelocityFactor}
              />
              <NumericField
                label={labels.physical}
                value={distance * wavelength * 1000}
                unit="mm"
                min={0}
                max={wavelength * 500}
                onChange={(mm) => setDistance(mm / 1000 / wavelength)}
              />
            </div>
            <button type="button" onClick={() => changeLoad(transformed)}>
              {t('usePoint')} ↗
            </button>
          </section>
          <section
            className="tool-card tool-tab-panel"
            role="tabpanel"
            id="smith-panel-match"
            aria-labelledby="smith-tab-match"
            hidden={panel !== 'match'}
            tabIndex={0}
          >
            <h2>{labels.matching}</h2>
            <p className="tool-note">{t('ideal')}</p>
            <ToolTabs
              label={labels.matching}
              prefix="smith-match"
              tabs={[
                { id: 'lnetwork', label: labels.lnetwork },
                { id: 'stub', label: labels.stub },
                { id: 'manual', label: t('manual') },
              ]}
              active={matchMode}
              onChange={(value) => {
                setMatchMode(value);
                setPreview([]);
              }}
            />
            {matched ? (
              <p>{t('already')}</p>
            ) : (
              <>
                <div
                  role="tabpanel"
                  id="smith-match-panel-stub"
                  aria-labelledby="smith-match-tab-stub"
                  hidden={matchMode !== 'stub'}
                  tabIndex={0}
                >
                  <ol className="smith-solutions">
                    {stubSolutions.map((solution, i) => (
                      <li key={i}>
                        <strong>
                          0{i + 1} / d = {format(solution.distance, 5)} λ
                        </strong>
                        <span>{format(solution.distance * wavelength * 1000)} mm</span>
                        <span>Open {format(solution.openStub, 5)} λ</span>
                        <span>{format(solution.openStub * wavelength * 1000)} mm</span>
                        <span>Short {format(solution.shortStub, 5)} λ</span>
                        <span>{format(solution.shortStub * wavelength * 1000)} mm</span>
                        <button type="button" onClick={() => setPreview(stubPath(solution))}>
                          {t('preview')} ↗
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
                <div
                  role="tabpanel"
                  id="smith-match-panel-lnetwork"
                  aria-labelledby="smith-match-tab-lnetwork"
                  hidden={matchMode !== 'lnetwork'}
                  tabIndex={0}
                >
                  <ol className="smith-solutions">
                    {lMatches.map((solution, i) => (
                      <li key={i}>
                        <strong>
                          {i + 1} / {solution.topology === 'seriesFirst' ? 'Z → Y' : 'Y → Z'}
                        </strong>
                        <span>{solution.topology === 'seriesFirst' ? 'X → B' : 'B → X'}</span>
                        <span>X = {format(solution.seriesReactance)} Ω</span>
                        <span>{component(solution.seriesReactance)}</span>
                        <span>B = {format(solution.shuntSusceptance * 1000)} mS</span>
                        <span>{component(solution.shuntSusceptance, true)}</span>
                        <button type="button" onClick={() => setPreview(matchPath(solution))}>
                          {t('preview')} ↗
                        </button>
                      </li>
                    ))}
                  </ol>
                  {!lMatches.length && <p className="tool-note">{labels.noMatch}</p>}
                </div>
              </>
            )}
            <div
              role="tabpanel"
              id="smith-match-panel-manual"
              aria-labelledby="smith-match-tab-manual"
              hidden={matchMode !== 'manual'}
              tabIndex={0}
            >
              <div className="smith-fields">
                <NumericField label={t('series')} value={manualX} unit="Ω" onChange={setManualX} />
                <NumericField label={t('shunt')} value={manualB} unit="mS" onChange={setManualB} />
              </div>
              <div className="smith-presets">
                <button type="button" onClick={() => setPreview(manualPath('series'))}>
                  X / {t('preview')}
                </button>
                <button type="button" onClick={() => setPreview(manualPath('shunt'))}>
                  B / {t('preview')}
                </button>
              </div>
            </div>
            {preview.length > 0 && (
              <div className="smith-preview">
                <p className="tool-note">Z → {formatComplex(preview[preview.length - 1]!, ' Ω')}</p>
                <button
                  type="button"
                  onClick={() => {
                    changeLoad(preview[preview.length - 1]!);
                    setPreview([]);
                  }}
                >
                  {t('apply')} ↗
                </button>
                <button type="button" onClick={() => setPreview([])}>
                  {t('cancel')}
                </button>
              </div>
            )}
          </section>
          <div
            className="tool-card tool-tab-panel"
            role="tabpanel"
            id="smith-panel-data"
            aria-labelledby="smith-tab-data"
            hidden={panel !== 'data'}
            tabIndex={0}
          >
            {!sweep.length && (
              <div className="tool-empty">
                <p>{t('emptySweep')}</p>
                <button type="button" onClick={() => importRef.current?.click()}>
                  {t('import')} ?
                </button>
              </div>
            )}
            {sweep.length > 0 && (
              <section className="tool-card">
                <h2>{t('sweep')}</h2>
                <label className="smith-range">
                  <span>
                    {sweepIndex + 1} / {sweep.length} · {format(sweep[sweepIndex]!.frequency / 1e6)}{' '}
                    MHz
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={sweep.length - 1}
                    step={1}
                    value={sweepIndex}
                    onChange={(e) => {
                      const index = Number(e.target.value);
                      setSweepIndex(index);
                      setFrequency(sweep[index]!.frequency / 1e6);
                      changeLoad(gammaToImpedance(sweep[index]!.gamma, sweepZ0));
                    }}
                  />
                </label>
                <button type="button" onClick={() => setSweep([])}>
                  {t('clearSweep')}
                </button>
              </section>
            )}
            {!markers.length && (
              <div className="tool-empty">
                <p>{t('emptyMarkers')}</p>
                <button type="button" onClick={saveMarker}>
                  {labels.save} ?
                </button>
              </div>
            )}
            {markers.length > 0 && (
              <section className="tool-card">
                <div className="tool-card-heading">
                  <h2>{t('markers')}</h2>
                  <button type="button" onClick={() => setMarkers([])}>
                    {labels.clear}
                  </button>
                </div>
                <ul className="smith-marker-list">
                  {markers.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          changeLoad(m.load);
                          setZ0(m.z0);
                          setFrequency(m.frequency);
                        }}
                      >
                        <strong>{m.label}</strong> {formatComplex(m.load, ' Ω')}
                        <small>
                          {format(m.frequency)} MHz · Z₀ {m.z0} Ω
                        </small>
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${m.label}`}
                        onClick={() => setMarkers((values) => values.filter((v) => v.id !== m.id))}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <section
            className="tool-card tool-tab-panel"
            role="tabpanel"
            id="smith-panel-view"
            aria-labelledby="smith-tab-view"
            hidden={panel !== 'view'}
            tabIndex={0}
          >
            <h2>{t('viewTab')}</h2>
            <div className="smith-options">
              {(
                [
                  [fineGrid, setFineGrid, labels.fine],
                  [showAdmittance, setShowAdmittance, labels.overlay],
                  [showLabels, setShowLabels, t('scales')],
                  [showVswr, setShowVswr, t('standing')],
                ] as const
              ).map(([value, setter, label]) => (
                <label key={label}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setter(e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="tool-note">{t('instructions')}</p>
            <p className="tool-note">
              <a
                href="https://www.analog.com/en/resources/technical-articles/impedance-matching-and-smith-chart-impedance-maxim-integrated.html"
                target="_blank"
                rel="noreferrer"
              >
                Smith chart / Analog Devices ↗
              </a>
            </p>
          </section>
        </div>
      </aside>
    </div>
  );
}
