"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import slots from "../../public/slots.json";
import stops from "@/lib/stops.json";
import type { PassportCard } from "@/lib/types";
import { readLocal, writeLocal } from "@/lib/storage";

export function PassportMap({ count = 0, stamps = [], token, calibrate = false }: { count?: number; stamps?: PassportCard["stamps"]; token?: string; calibrate?: boolean }) {
  const [fresh, setFresh] = useState<number[]>([]), [selected, setSelected] = useState<number | null>(null);
  const mapDialog = useRef<HTMLDialogElement>(null), stopDialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1), [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ distance: 0, zoom: 1, x: 0, y: 0 });
  useEffect(() => {
    if (!token) return;
    const key = `edelweiss_passport_seen:${token}`;
    const seen = Math.max(0, Math.min(10, Number(readLocal(key) || 0)));
    const added = Array.from({ length: Math.max(0, count - seen) }, (_, i) => seen + i + 1);
    writeLocal(key, String(count));
    const frame = requestAnimationFrame(() => setFresh(added));
    const timeout = setTimeout(() => setFresh([]), added.length * 550 + 800);
    return () => { cancelAnimationFrame(frame); clearTimeout(timeout); };
  }, [token, count]);
  function select(n: number) { setSelected(n); stopDialog.current?.showModal(); }
  function move(event: PointerEvent) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    if (points.length === 2) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      if (gesture.current.distance) setZoom(Math.max(1, Math.min(4, gesture.current.zoom * distance / gesture.current.distance)));
    } else if (zoom > 1) {
      setOffset(old => ({ x: Math.max(-500, Math.min(500, old.x + event.clientX - gesture.current.x)), y: Math.max(-500, Math.min(500, old.y + event.clientY - gesture.current.y)) }));
      gesture.current.x = event.clientX; gesture.current.y = event.clientY;
    }
  }
  function start(event: PointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    gesture.current = { x: event.clientX, y: event.clientY, zoom, distance: points.length === 2 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0 };
  }
  function end(event: PointerEvent) { pointers.current.delete(event.pointerId); gesture.current.distance = 0; }
  function map(full: boolean) {
    return <div className={`passport-map ${!full && fresh.length ? "map-shake" : ""}`} style={{ aspectRatio: `${slots.mapSize.width}/${slots.mapSize.height}`, "--stamp-count": fresh.length } as CSSProperties}>
      <Image src="/map.png" alt="Illustrated route through Switzerland, from Zürich to the Matterhorn" fill sizes={full ? "2048px" : "(max-width: 800px) 100vw, 1200px"} priority={!full}/>
      {slots.stops.map(stop => <button key={stop.n} type="button" aria-label={`${stop.n}. ${stop.name}${stop.n <= count ? ", stamped" : ", not yet stamped"}`} className={`map-slot ${calibrate ? "calibrate" : ""}`} style={{ left: `${stop.xPct}%`, top: `${stop.yPct}%`, width: `${slots.stampDiameterPct}%`, aspectRatio: "1" }} onClick={() => select(stop.n)}>
        {stop.n <= count && <span className={`stamp-art ${!full && fresh.includes(stop.n) ? "stamp-new" : ""}`} data-new={!full && fresh.includes(stop.n) ? "true" : undefined} style={{ "--rotation": `${stop.rotate}deg`, "--delay": `${fresh.indexOf(stop.n) * 550}ms` } as CSSProperties}><Image src={`/${stop.stamp}`} alt="" fill sizes="(max-width: 800px) 80px, 192px"/></span>}
        {calibrate && <span>{stop.n}</span>}
      </button>)}
    </div>;
  }
  const selectedStop = selected ? stops.find(s => s.n === selected) : null;
  const stamp = stamps.find(s => s.n === selected);
  return <section aria-label="Your Swiss journey" className="map-section">{map(false)}<div className="map-caption"><span>Ten places. One sweet adventure.</span><button className="text-button" onClick={() => mapDialog.current?.showModal()}>View full map <span aria-hidden="true">↗</span></button></div>
    <dialog ref={mapDialog} className="full-map"><div className="map-toolbar"><strong>Your Swiss journey</strong><div><button aria-label="Zoom out" onClick={() => setZoom(v => Math.max(1, v - .5))}>−</button><button aria-label="Zoom in" onClick={() => setZoom(v => Math.min(4, v + .5))}>+</button><button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>Reset</button><button onClick={() => mapDialog.current?.close()}>Close</button></div></div><p className="zoom-help">Pinch to zoom and drag to explore. Tap a stop to discover its story.</p><div className="zoom-viewport" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}><div style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin: "center" }}>{map(true)}</div></div><div className="stop-list">{stops.map(s => <button key={s.n} onClick={() => select(s.n)}>{s.n}. {s.name}</button>)}</div></dialog>
    <dialog ref={stopDialog} className="stop-dialog"><button className="dialog-close" aria-label="Close stop details" onClick={() => stopDialog.current?.close()}>×</button>{selectedStop && <><p className="eyebrow">Stop {selectedStop.n} of 10</p><h2>{selectedStop.name}</h2><p>{selectedStop.fact}</p><p className="stamp-date">{stamp ? `Stamped ${new Date(stamp.stampedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" })}` : "Your adventure will bring you here soon."}</p></>}</dialog>
  </section>;
}
