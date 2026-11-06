import React from "react";
import Icon from "../components/Icon.jsx";

export default function LaporanProduksiModule({ approved, realisasi, products }) {
  const snap = approved && approved.status === "approved" ? approved.snapshot : null;
  const since = snap ? new Date(approved.approvedAt).toISOString().slice(0, 10) : "0000";
  const rows = realisasi.filter((r) => r.date >= since);
  const tot = rows.reduce((a, r) => ({ x1: a.x1 + r.x1, x2: a.x2 + r.x2, x3: a.x3 + r.x3, reject: a.reject + (r.reject || 0) }), { x1: 0, x2: 0, x3: 0, reject: 0 });
  const target = snap ? [snap.monthly.x1, snap.monthly.x2, snap.monthly.x3] : [0, 0, 0];
  const done = [tot.x1, tot.x2, tot.x3];
  const jadi = done.reduce((s, x) => s + x, 0);
  const rejectPct = jadi + tot.reject > 0 ? Math.round((tot.reject / (jadi + tot.reject)) * 100) : 0;
  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Laporan produksi</div><div className="metric-value">{rows.length}</div><div className="metric-note">sejak rencana disetujui</div></div>
        <div className="card metric-card"><div className="metric-label">Unit jadi</div><div className="metric-value">{jadi.toLocaleString("id-ID")}</div><div className="metric-note">semua produk</div></div>
        <div className="card metric-card"><div className="metric-label">Reject</div><div className="metric-value">{tot.reject}</div><div className="metric-note">{rejectPct}% dari total</div></div>
        <div className="card metric-card"><div className="metric-label">Rencana</div><div className="metric-value" style={{ fontSize: 18 }}>{snap ? "Disetujui" : "Belum ada"}</div></div>
      </div>
      <div className="card">
        <div className="module-card-title"><div><h3>Capaian vs target bulanan</h3></div><button className="pill" onClick={() => window.print()}><Icon name="download" size={13} /> Cetak</button></div>
        {products.map((p, i) => { const pct = target[i] > 0 ? Math.min(100, (done[i] / target[i]) * 100) : 0; return (
          <div className="progress-item" key={p.id}><div className="progress-label"><span>{p.name}</span><span>{done[i]} / {target[i]} unit ({Math.round(pct)}%)</span></div><div className="track"><div className="fill" style={{ width: pct + "%" }} /></div></div>); })}
      </div>
      <div className="card">
        <div className="module-card-title"><div><h3>Rincian realisasi harian</h3></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Tanggal</th><th>Dicatat oleh</th><th>Manis</th><th>Tawar</th><th>Kering</th><th>Reject</th><th>Catatan</th></tr></thead>
          <tbody>{rows.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada realisasi.</td></tr>}
            {rows.map((r) => (<tr key={r.id}><td>{r.date} <small>{r.day}</small></td><td>{r.by}</td><td>{r.x1}</td><td>{r.x2}</td><td>{r.x3}</td><td>{r.reject}</td><td>{r.note}</td></tr>))}</tbody>
        </table></div>
      </div>
    </>
  );
}
