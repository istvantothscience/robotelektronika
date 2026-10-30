import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, Paperclip, RefreshCw } from 'lucide-react';

interface Props {
  photo: string | null;
  onAttach: (dataUrl: string | null) => void;
}

const MAX_SIDE = 900;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * „Hajfelállító”: a feltöltött fotón a koponyatetőre koppintva a haj töltés hatására szétáll.
 * Teljesen az eszközön fut (nincs feltöltés, nincs MI-szolgáltatás): az eredeti képre rajzol.
 */
export const HairStyler: React.FC<Props> = ({ photo, onAttach }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [width, setWidth] = useState(22); // fejszélesség, a kép szélességének %-a
  const [length, setLength] = useState(16); // szálhossz, a kép magasságának %-a
  const [strands, setStrands] = useState(90);
  const [seed, setSeed] = useState(7);
  const [error, setError] = useState<string | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (!point) return;

    // hajszín: a koppintás körüli kis terület átlaga, kicsit sötétítve
    const sx = Math.max(0, Math.round(point.x - 10));
    const sy = Math.max(0, Math.round(point.y - 4));
    const sample = ctx.getImageData(sx, sy, 20, 14).data;
    let r = 0, g = 0, b = 0;
    const n = sample.length / 4;
    for (let i = 0; i < sample.length; i += 4) {
      r += sample[i]; g += sample[i + 1]; b += sample[i + 2];
    }
    r = (r / n) * 0.82; g = (g / n) * 0.82; b = (b / n) * 0.82;
    const base = `rgb(${r | 0},${g | 0},${b | 0})`;
    const light = `rgb(${Math.min(255, r * 1.5) | 0},${Math.min(255, g * 1.5) | 0},${Math.min(255, b * 1.5) | 0})`;

    const rand = mulberry32(seed);
    const headW = (canvas.width * width) / 100;
    const len = (canvas.height * length) / 100;
    ctx.lineCap = 'round';

    for (let i = 0; i < strands; i++) {
      const t = rand() - 0.5; // -0.5 … 0.5 a fej szélén
      const x0 = point.x + t * headW;
      const y0 = point.y + Math.abs(t) * headW * 0.35; // a koponya íve
      // a szélen lévő szálak jobban kifelé állnak, mint a középsők (egynemű töltések taszítják egymást)
      const lean = t * 2.2 + (rand() - 0.5) * 0.5;
      const l = len * (0.55 + rand() * 0.6);
      const x1 = x0 + lean * l * 0.8;
      const y1 = y0 - l;
      const cx = x0 + lean * l * 0.15 + (rand() - 0.5) * l * 0.5;
      const cy = y0 - l * 0.55;

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(cx, cy, x1, y1);
      ctx.strokeStyle = base;
      ctx.lineWidth = 2 + rand() * 2.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(cx, cy, x1, y1);
      ctx.strokeStyle = light;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // néhány szál végén kis szikra
      if (rand() < 0.1) {
        ctx.strokeStyle = 'rgba(255,240,150,0.95)';
        ctx.lineWidth = 1.6;
        for (let k = 0; k < 3; k++) {
          const a = rand() * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1 + Math.cos(a) * 9, y1 + Math.sin(a) * 9);
          ctx.stroke();
        }
      }
    }
  }, [point, width, length, strands, seed]);

  useEffect(() => {
    draw();
  }, [draw, ready]);

  const loadFile = async (file: File) => {
    setError(null);
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * scale);
      c.height = Math.round(bmp.height * scale);
      c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        const canvas = canvasRef.current!;
        canvas.width = c.width;
        canvas.height = c.height;
        setPoint(null);
        setReady(true);
      };
      img.src = c.toDataURL('image/jpeg', 0.9);
    } catch {
      setError('Ezt a fájlt nem tudtam képként megnyitni.');
    }
  };

  const place = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    setPoint({
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    });
  };

  const download = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'felallo-haj.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const slider = (label: string, value: number, set: (n: number) => void, min: number, max: number) => (
    <label className="flex-1 min-w-[8rem] text-[11px] font-mono text-slate-400">
      {label}: {value}
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full accent-cyan-500" />
    </label>
  );

  return (
    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
      <div className="text-xs font-bold font-display text-white">Vicces rész: állítsd fel a hajad!</div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Tölts fel egy fotót magadról (vagy egy barátodról, engedéllyel), majd koppints a fej tetejére, ahol a haj kezdődik. A haj felállását a kép tetejére rajzoljuk. A kép nem hagyja el az eszközödet.
      </p>

      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono text-slate-100 cursor-pointer">
        <ImagePlus className="w-4 h-4" /> Fotó kiválasztása
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
      </label>
      {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}

      <div className={ready ? 'space-y-3' : 'hidden'}>
        <canvas
          ref={canvasRef}
          onClick={(e) => place(e.clientX, e.clientY)}
          className="w-full max-h-[50vh] object-contain rounded-lg border border-slate-700 cursor-crosshair touch-manipulation bg-slate-900"
          role="img"
          aria-label="A feltöltött fotó, amelyre koppintva felállítható a haj"
        />
        {!point && <p className="text-xs text-amber-300">Koppints a fej tetejére!</p>}
        <div className="flex flex-wrap gap-3">
          {slider('Fejszélesség', width, setWidth, 8, 50)}
          {slider('Szálhossz', length, setLength, 4, 40)}
          {slider('Szálak száma', strands, setStrands, 20, 220)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSeed((s) => s + 1)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono text-slate-100 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Másik frizura
          </button>
          <button onClick={download} disabled={!point} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono text-slate-100 cursor-pointer disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> Letöltés
          </button>
          <button
            onClick={() => canvasRef.current && onAttach(canvasRef.current.toDataURL('image/jpeg', 0.72))}
            disabled={!point}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 border border-cyan-400/60 text-xs font-mono text-white cursor-pointer disabled:opacity-40"
          >
            <Paperclip className="w-3.5 h-3.5" /> Csatolás a feladathoz
          </button>
        </div>
      </div>

      {photo && (
        <div className="flex items-end gap-3">
          <img src={photo} alt="A feladathoz csatolt kép" className="max-h-32 rounded-lg border border-slate-700" />
          <div className="text-[11px] text-slate-400">
            Csatolva (csak ezen az eszközön tárolódik; a tanár egyelőre nem látja).
            <button onClick={() => onAttach(null)} className="ml-2 text-rose-300 underline cursor-pointer">Eltávolítás</button>
          </div>
        </div>
      )}
    </div>
  );
};
