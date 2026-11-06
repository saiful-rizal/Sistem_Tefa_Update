import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { rp, fmtQty } from "../lib/format.js";

export default function PengajuanModule({ requests, materials, canApprove, canReceive, canFinance, onCreate, onDecide, onReceive }) {
  const [openAdd, setOpenAdd] = useState(false);
  const [f, setF] = useState({ materialId: materials[0]?.id || "", qty: "", reason: "" });
  const mat = (id) => materials.find((m) => m.id === id) || { name: id, unit: "", price: 0 };
  const st = { Menunggu: "warn", Disetujui: "ok", Diterima: "ok", Ditolak: "err" };
  const submitAdd = (e) => { e.preventDefault(); if (onCreate(f)) { setF({ materialId: materials[0]?.id || "", qty: "", reason: "" }); setOpenAdd(false); } };
  const count = (s) => requests.filter((r) => r.status === s).length;
  return (
    <>
      <div className="module-grid four">
        {["Menunggu", "Disetujui", "Diterima", "Ditolak"].map((s) => (<div className="card metric-card" key={s}><div className="metric-label">{s}</div><div className="metric-value">{count(s)}</div><div className="metric-note">pengajuan</div></div>))}
      </div>
      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title"><div><h3>Ajukan pembelian bahan</h3><p>Pengajuan diperiksa Admin Utama sebelum belanja.</p></div></div>
          <button className="primary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setF({ materialId: materials[0]?.id || "", qty: "", reason: "" }); setOpenAdd((v) => !v); }}><Icon name="plus" size={14} /> {openAdd ? "Tutup Form" : "Ajukan Pembelian"}</button>
          {openAdd && (
            <form className="gudang-form inline-entry-form" onSubmit={submitAdd}>
                <div><label>Bahan</label><select value={f.materialId} onChange={(e) => setF({ ...f, materialId: e.target.value })}>{materials.map((m) => <option key={m.id} value={m.id}>{m.name} — sisa {fmtQty(m.stock)} {m.unit}</option>)}</select></div>
                <div><label>Jumlah ({mat(f.materialId).unit})</label><input type="number" min="0" step="0.1" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} required /></div>
                <div><label>Alasan</label><input value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="Contoh stok tinggal untuk 2 hari" /></div>
                <button className="primary-btn" style={{ width: "100%", justifyContent: "center" }}><Icon name="check" size={14} /> Kirim Pengajuan</button>
            </form>
          )}
        </div>
        <div className="card">
          <div className="module-card-title"><div><h3>Alur persetujuan</h3></div></div>
          <div className="module-list">{[["Admin Produksi mengajukan", "Menunggu"], ["Admin Utama menyetujui / menolak", "Disetujui"], ["Admin Produksi mencatat penerimaan", "Diterima: stok bertambah otomatis"]].map((x, i) => (<div className="module-list-row" key={i}><div className="row-icon">{i + 1}</div><div className="row-main"><strong>{x[0]}</strong><span>{x[1]}</span></div></div>))}</div>
        </div>
      </div>
      <div className="card">
        <div className="module-card-title"><div><h3>Daftar pengajuan</h3></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Tanggal</th><th>Bahan</th><th>Jumlah</th>{canFinance && <th>Estimasi</th>}<th>Pengaju</th><th>Alasan</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>{requests.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada pengajuan.</td></tr>}
            {requests.map((r) => { const m = mat(r.materialId); return (
              <tr key={r.id}><td>{r.date}</td><td><b>{m.name}</b></td><td>{fmtQty(r.qty)} {m.unit}</td>{canFinance && <td>{rp(r.qty * m.price)}</td>}<td>{r.by}</td><td>{r.reason}</td>
                <td><span className={"chip-status " + st[r.status]}><span className="dot"></span>{r.status}</span>{r.decidedBy && <small style={{ display: "block", color: "var(--muted)" }}>oleh {r.decidedBy}</small>}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {r.status === "Menunggu" && canApprove && <><button className="pill" onClick={() => onDecide(r.id, true)}>Setujui</button> <button className="pill" onClick={() => onDecide(r.id, false)}>Tolak</button></>}
                  {r.status === "Disetujui" && canReceive && <button className="primary-btn" onClick={() => onReceive(r.id)}>Catat diterima</button>}
                </td></tr>); })}</tbody>
        </table></div>
      </div>
    </>
  );
}