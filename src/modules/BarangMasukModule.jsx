import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { rp, fmtQty } from "../lib/format.js";

export default function BarangMasukModule({ materials, logs, plan, onAddLog }) {
  const [openMasuk, setOpenMasuk] = useState(false);
  const [f, setF] = useState({ materialId: materials[0] ? materials[0].id : "", qty: "", note: "" });
  const mat = (id) => materials.find((m) => m.id === id) || { name: id, unit: "" };
  const masuk = logs.filter((l) => l.type === "Masuk");
  const saran = (plan && plan.shopping ? plan.shopping : []).filter((s) => s.buy > 0);
  const submitMasuk = (e) => { e.preventDefault(); if (onAddLog({ materialId: f.materialId, type: "Masuk", qty: f.qty, note: f.note })) { setF({ ...f, qty: "", note: "" }); setOpenMasuk(false); } };
  return (
    <>
      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title"><div><h3>Catat barang masuk</h3><p>Pembelian, retur, atau penerimaan bahan. Stok bertambah otomatis.</p></div></div>
          <button className="primary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setF({ materialId: materials[0] ? materials[0].id : "", qty: "", note: "" }); setOpenMasuk((v) => !v); }}><Icon name="in" size={14} /> {openMasuk ? "Tutup Form" : "Catat Barang Masuk"}</button>
          {openMasuk && (
            <form className="gudang-form inline-entry-form" onSubmit={submitMasuk}>
                <div><label>Bahan</label><select value={f.materialId} onChange={(e) => setF({ ...f, materialId: e.target.value })}>{materials.map((m) => <option key={m.id} value={m.id}>{m.name} — sisa {fmtQty(m.stock)} {m.unit}</option>)}</select></div>
                <div><label>Jumlah ({mat(f.materialId).unit})</label><input type="number" min="0" step="0.1" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} required /></div>
                <div><label>Keterangan / supplier</label><input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Contoh beli ke Toko Makmur" /></div>
                <button className="primary-btn" style={{ width: "100%", justifyContent: "center" }}><Icon name="check" size={14} /> Simpan Barang Masuk</button>
            </form>
          )}
        </div>
        <div className="card">
          <div className="module-card-title"><div><h3>Saran dari rencana bulanan</h3><p>Kekurangan bahan menurut Perencanaan Modal. Klik untuk mengisi formulir.</p></div></div>
          {saran.length === 0 ? <div className="formula" style={{ marginTop: 0 }}>Stok sudah cukup untuk rencana bulan ini.</div> : (
            <div className="module-list">{saran.map((s) => (
              <div className="module-list-row" key={s.id}>
                <div className="row-main"><strong>{s.name}: {fmtQty(s.buy)} {s.unit}</strong><span>{rp(s.cost)} • {s.freq}</span></div>
                <button className="pill" onClick={() => { setF({ materialId: s.id, qty: String(s.buy), note: "Sesuai rencana bulanan" }); setOpenMasuk(true); }}>Isi Form</button>
              </div>))}</div>
          )}
        </div>
      </div>
      <div className="card">
        <div className="module-card-title"><div><h3>Riwayat barang masuk</h3><p>{masuk.length} transaksi.</p></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Tanggal</th><th>Bahan</th><th>Jumlah</th><th>Keterangan</th></tr></thead>
          <tbody>{masuk.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada barang masuk.</td></tr>}
            {masuk.map((l) => (<tr key={l.id}><td>{l.date}</td><td><b>{mat(l.materialId).name}</b><small style={{ display: "block", color: "var(--muted)" }}>{l.id}</small></td><td><b>+ {fmtQty(l.qty)} {mat(l.materialId).unit}</b></td><td>{l.note}</td></tr>))}</tbody>
        </table></div>
      </div>
    </>
  );
}
