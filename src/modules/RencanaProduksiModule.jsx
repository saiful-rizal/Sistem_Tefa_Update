import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { fmtQty } from "../lib/format.js";
import { dayNameID } from "../lib/planner.js";

export default function RencanaProduksiModule({ stokJadi, approved, products, materials, realisasi, onReport, go, canFinance }) {
  const snap = approved && approved.status === "approved" ? approved.snapshot : null;
  const today = dayNameID();
  const [openReport, setOpenReport] = useState(false);
  const [form, setForm] = useState({ x1: "", x2: "", x3: "", reject: "", note: "", deduct: true });
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  if (!snap) {
    return (
      <>
        <div className="card empty-state">
          <div className="ph-ico"><Icon name="layers" size={26} /></div>
          <h2>Belum ada rencana yang disetujui</h2>
          <p>Admin Utama perlu menyetujui rencana bulanan terlebih dahulu. Sementara itu Anda tetap dapat mencatat distribusi bahan dan pesanan.</p>
        </div>
        <div className="card">
          <div className="module-card-title"><div><h3>Riwayat realisasi produksi</h3><p>{realisasi.length} laporan tercatat. Batch dari menu Proses Produksi juga muncul di sini.</p></div></div>
          <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
            <thead><tr><th>Tanggal</th><th>Oleh</th><th>Manis</th><th>Tawar</th><th>Kering</th><th>Reject</th><th>Catatan</th></tr></thead>
            <tbody>{realisasi.length === 0 && <tr><td colSpan={7} className="empty-cell">Belum ada realisasi.</td></tr>}
              {realisasi.slice(0, 15).map((r) => (<tr key={r.id}><td>{r.date} <small>{r.day}</small></td><td>{r.by}</td><td>{r.x1}</td><td>{r.x2}</td><td>{(r.x3 || 0) + (r.x4 || 0) + (r.x5 || 0)}</td><td>{r.reject}</td><td>{r.note}</td></tr>))}</tbody>
          </table></div>
        </div>
      </>
    );
  }

  const hariRoti = today === "Senin" || today === "Kamis";
  const hariKering = today === "Selasa" || today === "Jumat";
  const todayItems = hariRoti ? snap.days.find((d) => d.group === "roti").items : hariKering ? snap.days.find((d) => d.group === "kering").items : [];
  const target = { PRD01: snap.cycle.roti.x1, PRD02: snap.cycle.roti.x2, PRD03: snap.cycle.kering.x3 };
  const monthlyTarget = { PRD01: snap.monthly.x1, PRD02: snap.monthly.x2, PRD03: snap.monthly.x3 };
  const done = { PRD01: 0, PRD02: 0, PRD03: 0 };
  const since = new Date(approved.approvedAt).toISOString().slice(0, 10);
  realisasi.filter((r) => r.date >= since).forEach((r) => { done.PRD01 += r.x1; done.PRD02 += r.x2; done.PRD03 += r.x3; });

  const submitReport = (e) => {
    e.preventDefault();
    const ok = onReport({ x1: Number(form.x1) || 0, x2: Number(form.x2) || 0, x3: Number(form.x3) || 0, reject: Number(form.reject) || 0, note: form.note, deduct: form.deduct });
    if (ok) { setForm({ x1: "", x2: "", x3: "", reject: "", note: "", deduct: true }); setOpenReport(false); }
  };

  return (
    <>
      <div className="module-grid three">
        <div className="card metric-card"><div className="metric-label">Hari ini</div><div className="metric-value">{today}</div><div className="metric-note">{hariRoti ? "Produksi roti manis & tawar" : hariKering ? "Produksi roti kering" : "Bukan hari produksi"}</div></div>
        <div className="card metric-card"><div className="metric-label">Rencana disetujui</div><div className="metric-value" style={{ fontSize: 17 }}>{new Date(approved.approvedAt).toLocaleDateString("id-ID")}</div><div className="metric-note">oleh {approved.approvedBy}</div></div>
        <div className="card metric-card"><div className="metric-label">Realisasi tercatat</div><div className="metric-value">{realisasi.length}</div><div className="metric-note">laporan produksi</div></div>
      </div>

      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title"><div><h3>Perintah kerja hari ini</h3><p>Target per siklus dari rencana bulanan.</p></div></div>
          {todayItems.length === 0 ? <div className="formula" style={{ marginTop: 0 }}>Tidak ada jadwal produksi. Produksi Senin & Kamis (roti), Selasa & Jumat (kering).</div> : (
            <div className="module-list">{todayItems.map((it) => (
              <div className="module-list-row" key={it.pid}><div className="row-icon"><Icon name="bread" size={16} /></div><div className="row-main"><strong>Produksi {it.qty} {it.name}</strong><span>{stokJadi && stokJadi[it.pid] && stokJadi[it.pid].rec && stokJadi[it.pid].avg.real ? `Saran sesuai penjualan & sisa stok: ${stokJadi[it.pid].rec.rekom} pcs (rencana ${it.qty})` : "Target siklus ini"}</span></div></div>
            ))}</div>
          )}
          <h3 style={{ fontSize: 13.5, margin: "18px 0 8px" }}>Kebutuhan bahan per siklus</h3>
          <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
            <thead><tr><th>Bahan</th><th>Dibutuhkan</th><th>Stok kini</th></tr></thead>
            <tbody>{materials.map((m) => {
              const need = products.reduce((s, p) => s + (p.bom[m.id] || 0) * (todayItems.find((t) => t.pid === p.id)?.qty || 0), 0);
              return (<tr key={m.id}><td>{m.name}</td><td>{fmtQty(need)} {m.unit}</td><td style={need > m.stock ? { color: "var(--red)", fontWeight: 700 } : null}>{fmtQty(m.stock)} {m.unit}</td></tr>);
            })}</tbody>
          </table></div>
        </div>

        <div className="card">
          <div className="module-card-title"><div><h3>Input realisasi produksi</h3><p>Isi jumlah jadi yang benar-benar diproduksi.</p></div></div>
          <button className="primary-btn" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => { setForm({ x1: "", x2: "", x3: "", reject: "", note: "", deduct: true }); setOpenReport((v) => !v); }}><Icon name="check" size={14} /> {openReport ? "Tutup Form" : "Input Realisasi Produksi"}</button>
          {openReport && (
            <form className="gudang-form inline-entry-form" onSubmit={submitReport}>
                {products.map((p, i) => (
                  <div key={p.id}><label>{p.name} (target {target[p.id]})</label><input type="number" min="0" value={form["x" + (i + 1)]} onChange={upd("x" + (i + 1))} placeholder="0" /></div>
                ))}
                <div><label>Produk reject / gagal (unit, info saja)</label><input type="number" min="0" value={form.reject} onChange={upd("reject")} placeholder="0" /></div>
                <div><label>Catatan</label><input value={form.note} onChange={upd("note")} placeholder="Contoh oven bermasalah 30 menit" /></div>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}><input type="checkbox" checked={form.deduct} onChange={upd("deduct")} style={{ width: "auto" }} /> Kurangi stok bahan otomatis sesuai resep</label>
                <button className="primary-btn" style={{ width: "100%", justifyContent: "center" }}><Icon name="check" size={14} /> Simpan Realisasi</button>
            </form>
          )}
        </div>
      </div>

      <div className="card">
        <div className="module-card-title"><div><h3>Capaian vs target bulanan</h3><p>Dihitung sejak rencana disetujui.</p></div></div>
        {products.map((p) => {
          const pct = monthlyTarget[p.id] > 0 ? Math.min(100, (done[p.id] / monthlyTarget[p.id]) * 100) : 0;
          return (<div className="progress-item" key={p.id}><div className="progress-label"><span>{p.name}</span><span>{done[p.id]} / {monthlyTarget[p.id]} unit ({Math.round(pct)}%)</span></div><div className="track"><div className="fill" style={{ width: pct + "%" }} /></div></div>);
        })}
        <div className="data-table-wrap" style={{ marginTop: 14 }}><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Tanggal</th><th>Oleh</th><th>Manis</th><th>Tawar</th><th>Kering</th><th>Reject</th><th>Catatan</th></tr></thead>
          <tbody>{realisasi.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada realisasi.</td></tr>}
            {realisasi.slice(0, 15).map((r) => (<tr key={r.id}><td>{r.date} <small>{r.day}</small></td><td>{r.by}</td><td>{r.x1}</td><td>{r.x2}</td><td>{r.x3}</td><td>{r.reject}</td><td>{r.note}</td></tr>))}
          </tbody>
        </table></div>
        <button className="pill" style={{ marginTop: 12 }} onClick={() => go("Pengajuan Bahan")}>Bahan kurang? Ajukan pembelian</button>
      </div>
    </>
  );
}
