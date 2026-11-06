import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import Pipeline, { fmtClock } from "../components/Pipeline.jsx";
import useNow from "../hooks/useNow.js";
import { PRODUCTION_PROCESS } from "../lib/roles.js";
import { capacityOf, dayName, ymd, hhmm } from "../lib/pos.js";

const STATUS = { jalan: ["warn", "Berjalan"], selesai: ["ok", "Selesai"], batal: ["err", "Dibatalkan"] };

export default function ProductionProcessModule({ products, runs, params, onStartRun, onAdvanceRun, onCancelRun, canTrack }) {
  const [pid, setPid] = useState(products[0] ? products[0].id : "");
  const [kg, setKg] = useState("");
  const active = runs.filter((r) => r.status === "jalan");
  const now = useNow(active.length > 0);
  const cap = capacityOf(params);
  const today = ymd();
  const usedKg = runs.filter((r) => r.date === today && r.status !== "batal").reduce((s, r) => s + r.kg, 0);
  const left = Math.max(0, cap.max - usedKg);
  const total = PRODUCTION_PROCESS.reduce((s, p) => s + p.durationMin, 0);
  const prod = products.find((p) => p.id === pid);
  const kgNum = Number(kg) || 0;
  const unitsPreview = prod && kgNum > 0 ? Math.floor((kgNum * 1000) / (prod.beratAdonan || 50)) : 0;
  const shortName = (n) => n.replace("Roti Kering ", "Kue Kering ");

  const start = (e) => { e.preventDefault(); if (onStartRun({ productId: pid, kg: kgNum })) setKg(""); };
  const stageRows = runs.filter((r) => r.status !== "batal").flatMap((r) => r.stages.map((st, i) => ({ r, st, i }))).filter((x) => x.st.doneAt).sort((a, b) => new Date(b.st.doneAt) - new Date(a.st.doneAt)).slice(0, 20);

  return (
    <>
      <section className="card">
        <div className="module-card-title"><div><h3>Kapasitas hari ini</h3><p>{dayName()} • mode {cap.label}. Admin Utama mengatur mode ini di menu Biaya & Kapasitas.</p></div>
          <span className="chip-status ok"><span className="dot"></span>Sisa {left} kg</span></div>
        <div className="progress-label"><span>Adonan terpakai hari ini</span><span>{usedKg} dari {cap.max} kg</span></div>
        <div className="track big"><div className={"fill" + (usedKg / cap.max > 0.85 ? " warn" : "")} style={{ width: Math.min(100, (usedKg / cap.max) * 100) + "%" }} /></div>
      </section>

      <section className="card">
        <div className="module-card-title"><div><h3>Alur produksi: {PRODUCTION_PROCESS.length} tahap, total {total} menit</h3><p>{active.length ? "Batch sedang berjalan. Tekan tombol hijau saat satu tahap selesai." : "Belum ada batch berjalan. Mulai batch baru di bawah untuk menyalakan alur ini."}</p></div></div>
        {active.length === 0 && <Pipeline steps={PRODUCTION_PROCESS} />}
        {active.map((r) => {
          const st = PRODUCTION_PROCESS[r.current];
          const nxt = PRODUCTION_PROCESS[r.current + 1];
          const el = (now - new Date(r.stages[r.current].startedAt).getTime()) / 1000;
          return (
            <div className="run-block" key={r.id}>
              <div className="run-head"><div><b>{shortName(r.productName)} • {r.kg} kg</b><span>{r.id} • hasil ± {r.units} pcs • mulai {hhmm(r.startedAt)}</span></div>
                <div className="run-clock" aria-live="polite">{fmtClock(el)}<small>tahap {r.current + 1}: {st.name}</small></div></div>
              <Pipeline steps={PRODUCTION_PROCESS} run={r} now={now} />
              <div className="run-actions">
                <button type="button" className="primary-btn big" disabled={!canTrack} onClick={() => onAdvanceRun(r.id)}><Icon name="check" size={20} />{nxt ? `Selesai: ${st.name}. Lanjut ke ${nxt.name}` : `Selesai: ${st.name}. Simpan hasil ke stok`}</button>
                <button type="button" className="pill" disabled={!canTrack} onClick={() => onCancelRun(r.id)}>Batalkan batch</button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="card">
        <div className="module-card-title"><div><h3>Mulai batch baru</h3><p>Bahan ditimbang otomatis dari gudang sesuai resep. Hasil jadi masuk Stok Barang Jadi setelah Packing selesai.</p></div></div>
        <form className="gudang-form start-form" onSubmit={start}>
          <div><label>Produk</label><select value={pid} onChange={(e) => setPid(e.target.value)}>{products.map((p) => <option key={p.id} value={p.id}>{shortName(p.name)} ({p.beratAdonan} g)</option>)}</select></div>
          <div><label>Berat adonan (kg) • batas {cap.min}–{cap.max} kg</label><input type="number" min="0" step="0.5" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} placeholder={`Maksimal ${left} kg`} required /></div>
          <button className="primary-btn big" disabled={!canTrack}><Icon name="check" size={20} /> Mulai penimbangan</button>
        </form>
        {unitsPreview > 0 && <div className="formula">Perkiraan hasil: <b>{unitsPreview} pcs</b> {prod ? shortName(prod.name) : ""}</div>}
      </section>

      <section className="card">
        <div className="module-card-title"><div><h3>Riwayat batch produksi</h3><p>{runs.length} batch tercatat.</p></div></div>
        <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Tanggal</th><th>Batch</th><th>Produk</th><th>Adonan</th><th>Hasil</th><th>Tahap</th><th>Status</th><th>Oleh</th></tr></thead>
          <tbody>
            {runs.length === 0 && <tr><td colSpan={8} className="empty-cell">Belum ada batch produksi.</td></tr>}
            {runs.slice(0, 20).map((r) => { const s = STATUS[r.status] || STATUS.jalan; return (
              <tr key={r.id}><td>{r.date} <small>{hhmm(r.startedAt)}</small></td><td><b>{r.id}</b></td><td>{shortName(r.productName)}</td><td>{r.kg} kg</td><td>{r.units} pcs</td><td>{r.status === "selesai" ? "Semua selesai" : `${r.current + 1} / ${PRODUCTION_PROCESS.length}`}</td><td><span className={"chip-status " + s[0]}><span className="dot"></span>{s[1]}</span></td><td>{r.by}</td></tr>); })}
          </tbody>
        </table></div>
      </section>

      <section className="card">
        <div className="module-card-title"><div><h3>Catatan waktu tiap tahap</h3><p>Target dibandingkan dengan waktu sebenarnya.</p></div></div>
        <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Selesai</th><th>Batch</th><th>Tahap</th><th>Target</th><th>Sebenarnya</th></tr></thead>
          <tbody>
            {stageRows.length === 0 && <tr><td colSpan={5} className="empty-cell">Belum ada tahap yang selesai.</td></tr>}
            {stageRows.map(({ r, st, i }) => {
              const tgt = PRODUCTION_PROCESS[i].durationMin;
              const act = Math.max(1, Math.round((new Date(st.doneAt) - new Date(st.startedAt)) / 60000));
              return (<tr key={r.id + st.id}><td>{r.date} {hhmm(st.doneAt)}</td><td>{r.id}</td><td><b>{i + 1}. {PRODUCTION_PROCESS[i].name}</b></td><td>{tgt} mnt</td><td style={act > tgt ? { color: "var(--red)", fontWeight: 700 } : null}>{act} mnt</td></tr>);
            })}
          </tbody>
        </table></div>
      </section>
    </>
  );
}
