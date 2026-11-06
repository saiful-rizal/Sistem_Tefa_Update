import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { fmtQty } from "../lib/format.js";

export default function RiwayatMutasiModule({ logs, materials }) {
  const [jenis, setJenis] = useState("Semua");
  const [bahan, setBahan] = useState("Semua");
  const mat = (id) => materials.find((m) => m.id === id) || { name: id, unit: "" };
  const rows = logs.filter((l) => (jenis === "Semua" || l.type === jenis) && (bahan === "Semua" || l.materialId === bahan));
  const cnt = (t) => logs.filter((l) => l.type === t).length;
  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Total mutasi</div><div className="metric-value">{logs.length}</div></div>
        <div className="card metric-card"><div className="metric-label">Barang masuk</div><div className="metric-value">{cnt("Masuk")}</div></div>
        <div className="card metric-card"><div className="metric-label">Barang keluar</div><div className="metric-value">{cnt("Keluar")}</div></div>
        <div className="card metric-card"><div className="metric-label">Koreksi stok</div><div className="metric-value">{cnt("Penyesuaian")}</div></div>
      </div>
      <div className="card">
        <div className="module-card-title"><div><h3>Riwayat mutasi bahan baku</h3><p>{rows.length} dari {logs.length} transaksi. Dasar audit stok.</p></div>
          <div className="module-actions">
            <select className="table-input" style={{ width: 130 }} value={jenis} onChange={(e) => setJenis(e.target.value)}>{["Semua", "Masuk", "Keluar", "Penyesuaian"].map((x) => <option key={x}>{x}</option>)}</select>
            <select className="table-input" style={{ width: 170 }} value={bahan} onChange={(e) => setBahan(e.target.value)}><option value="Semua">Semua bahan</option>{materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <button className="pill" onClick={() => window.print()}><Icon name="download" size={13} /> Cetak</button>
          </div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Tanggal</th><th>Bahan</th><th>Jenis</th><th>Jumlah</th><th>Keterangan</th></tr></thead>
          <tbody>{rows.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--faint)" }}>Tidak ada mutasi.</td></tr>}
            {rows.map((l) => (<tr key={l.id}><td>{l.date}</td><td><b>{mat(l.materialId).name}</b><small style={{ display: "block", color: "var(--muted)" }}>{l.materialId} • {l.id}</small></td>
              <td><span className={"st " + (l.type === "Masuk" ? "done" : l.type === "Keluar" ? "wait" : "process")}><span className="dot"></span>{l.type}</span></td>
              <td><b>{l.type === "Penyesuaian" ? "→ " : l.type === "Keluar" ? "− " : "+ "}{fmtQty(l.qty)} {mat(l.materialId).unit}</b></td><td>{l.note}</td></tr>))}</tbody>
        </table></div>
      </div>
    </>
  );
}
