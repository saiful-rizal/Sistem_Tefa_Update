import React from "react";
import { rp } from "../lib/format.js";
import { CAPACITY_RULES } from "../lib/roles.js";
import { COST_SPLIT, capacityOf, productionDaysOfMonth, dayName, ymd } from "../lib/pos.js";

const MODES = [
  { id: "rutin", title: "Rutin 10–15 kg", desc: "Produksi terjadwal Senin & Kamis dengan adonan 10 sampai 15 kg per hari." },
  { id: "penuh", title: "Penuh 25 kg", desc: "Memakai kapasitas maksimum 25 kg adonan per hari produksi." },
];

export default function BiayaKapasitasModule({ params, setParam, products }) {
  const cap = capacityOf(params);
  const modal = Math.max(0, Number(params.modalBulanan) || 0);
  const days = productionDaysOfMonth();
  const kgHari = cap.mode === "penuh" ? CAPACITY_RULES.fullKg : Math.min(cap.max, Math.max(cap.min, Number(params.kgBatch) || cap.min));
  const kgBulan = kgHari * days.length;
  const modalHari = days.length ? modal / days.length : 0;
  const perKg = kgBulan ? modal / kgBulan : 0;
  const split = COST_SPLIT.map((c) => ({ ...c, rp: (modal * c.pct) / 100 }));
  const monthName = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const todayStr = ymd();

  // perbandingan dua mode pada modal yang sama
  const rutinKg = (Number(params.kgBatch) || CAPACITY_RULES.routineKgMin) * days.length;
  const penuhKg = CAPACITY_RULES.fullKg * days.length;

  return (
    <>
      <section className="card">
        <div className="module-card-title"><div><h3>1. Pilih kapasitas produksi</h3><p>Batas ini dipakai di halaman Proses Produksi: Admin Produksi tidak bisa memulai batch yang melebihi batas.</p></div>
          <span className="chip-status ok"><span className="dot"></span>Aktif: {cap.label}</span></div>
        <div className="mode-grid">
          {MODES.map((m) => (
            <button type="button" key={m.id} className={"mode-card" + (cap.mode === m.id ? " on" : "")} onClick={() => setParam("kapasitasMode", m.id)} aria-pressed={cap.mode === m.id}>
              <b>{m.title}</b><span>{m.desc}</span>
            </button>
          ))}
        </div>
        {cap.mode === "rutin" && (
          <div className="gudang-form" style={{ marginTop: 24 }}><div>
            <label>Target adonan per hari produksi: <b>{kgHari} kg</b></label>
            <input type="range" min={CAPACITY_RULES.routineKgMin} max={CAPACITY_RULES.routineKgMax} step="1" value={kgHari} onChange={(e) => setParam("kgBatch", Number(e.target.value))} />
            <div className="range-ends"><span>{CAPACITY_RULES.routineKgMin} kg</span><span>{CAPACITY_RULES.routineKgMax} kg</span></div>
          </div></div>
        )}
      </section>

      <section className="card">
        <div className="module-card-title"><div><h3>2. Modal bulanan & pembagian biaya</h3><p>Setiap rupiah modal dibagi 60% bahan utama, 20% penunjang, 10% isian, dan 10% overhead.</p></div></div>
        <div className="gudang-form" style={{ maxWidth: 420 }}><div>
          <label>Modal bulan {monthName} (Rp)</label>
          <input type="number" min="0" step="500000" inputMode="numeric" value={params.modalBulanan} onChange={(e) => setParam("modalBulanan", Number(e.target.value))} />
        </div></div>
        <div className="split-grid">
          {split.map((c) => (
            <div className="split-card" key={c.key}>
              <div className="split-pct">{c.pct}%</div>
              <b>{c.label}</b>
              <div className="split-rp">{rp(c.rp)}</div>
              <small>{c.note}</small>
              <div className="track"><div className="fill" style={{ width: c.pct + "%" }} /></div>
            </div>
          ))}
        </div>
      </section>

      <div className="module-grid three">
        <div className="card metric-card"><div className="metric-label">Hari produksi bulan ini</div><div className="metric-value">{days.length} hari</div><div className="metric-note">Setiap {CAPACITY_RULES.routineDays.join(" & ")}</div></div>
        <div className="card metric-card"><div className="metric-label">Total adonan bulan ini</div><div className="metric-value">{kgBulan} kg</div><div className="metric-note">{kgHari} kg × {days.length} hari</div></div>
        <div className="card metric-card"><div className="metric-label">Biaya per kg adonan</div><div className="metric-value">{rp(perKg)}</div><div className="metric-note">Modal ÷ total kg</div></div>
      </div>

      <section className="card">
        <div className="module-card-title"><div><h3>Jadwal & anggaran per hari produksi</h3><p>Anggaran modal harian dibagi sesuai persentase biaya. Hari ini ditandai.</p></div></div>
        <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Tanggal</th><th>Hari</th><th>Kapasitas</th>{split.map((c) => <th key={c.key}>{c.label} ({c.pct}%)</th>)}<th>Total</th></tr></thead>
          <tbody>
            {days.length === 0 && <tr><td colSpan={8} className="empty-cell">Tidak ada hari produksi bulan ini.</td></tr>}
            {days.map((d) => {
              const iso = ymd(d);
              return (
                <tr key={iso} className={iso === todayStr ? "row-today" : ""}>
                  <td>{iso}</td><td>{dayName(d)}{iso === todayStr && <span className="chip-status ok" style={{ marginLeft: 8 }}>Hari ini</span>}</td><td>{kgHari} kg</td>
                  {split.map((c) => <td key={c.key}>{rp((modalHari * c.pct) / 100)}</td>)}
                  <td><b>{rp(modalHari)}</b></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </section>

      <section className="card">
        <div className="module-card-title"><div><h3>Biaya resep per produk</h3><p>HPP tiap produk dibagi dengan persentase yang sama. Ubah HPP di menu Produk & Resep.</p></div></div>
        <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Produk</th><th>Harga jual</th><th>HPP</th>{split.map((c) => <th key={c.key}>{c.label}</th>)}<th>Margin</th></tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p.id}><td><b>{p.name.replace("Roti Kering ", "Kue Kering ")}</b></td><td>{rp(p.price)}</td><td>{rp(p.hpp)}</td>
              {split.map((c) => <td key={c.key}>{rp((p.hpp * c.pct) / 100)}</td>)}
              <td><b>{p.price > 0 ? Math.round(((p.price - p.hpp) / p.price) * 100) : 0}%</b></td></tr>
          ))}</tbody>
        </table></div>
      </section>

      <section className="card">
        <div className="module-card-title"><div><h3>Perbandingan dua mode kapasitas</h3><p>Pada modal {rp(modal)} yang sama.</p></div></div>
        <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Mode</th><th>Kg per hari</th><th>Kg per bulan</th><th>Biaya per kg</th></tr></thead>
          <tbody>
            <tr className={cap.mode === "rutin" ? "row-today" : ""}><td><b>Rutin</b></td><td>{Number(params.kgBatch) || CAPACITY_RULES.routineKgMin} kg</td><td>{rutinKg} kg</td><td>{rutinKg ? rp(modal / rutinKg) : "-"}</td></tr>
            <tr className={cap.mode === "penuh" ? "row-today" : ""}><td><b>Penuh</b></td><td>{CAPACITY_RULES.fullKg} kg</td><td>{penuhKg} kg</td><td>{penuhKg ? rp(modal / penuhKg) : "-"}</td></tr>
          </tbody>
        </table></div>
      </section>
    </>
  );
}
