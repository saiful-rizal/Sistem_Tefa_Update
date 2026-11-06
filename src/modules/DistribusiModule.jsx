import React from "react";
import Icon from "../components/Icon.jsx";
import QuickAdd from "../components/QuickAdd.jsx";
import { fmtQty } from "../lib/format.js";

export default function DistribusiModule({ materials, logs, onAddLog, onAddOrder }) {
  const distributions = logs.filter((log) => log.type === "Keluar");
  const mat = (id) => materials.find((item) => item.id === id) || { name: id, unit: "" };

  return (
    <>
      <div className="module-grid three">
        <div className="card metric-card">
          <div className="metric-label">Total distribusi</div>
          <div className="metric-value">{distributions.length}</div>
          <div className="metric-note">Transaksi bahan keluar</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Unit bahan tersalur</div>
          <div className="metric-value">{fmtQty(distributions.reduce((sum, log) => sum + Number(log.qty || 0), 0))}</div>
          <div className="metric-note">Akumulasi seluruh bahan</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Status distribusi</div>
          <div className="metric-value">Aktif</div>
          <div className="metric-note">Terhubung ke stok dan solver</div>
        </div>
      </div>
      <div className="card">
        <div className="module-card-title">
          <div>
            <h3>Distribusi bahan ke produksi</h3>
            <p>Catat bahan baku yang dikeluarkan untuk pemakaian produksi, kerusakan, atau susut.</p>
          </div>
          <QuickAdd materials={materials} onAddLog={onAddLog} onAddOrder={onAddOrder} preset="distribusi" />
        </div>
        <div className="formula">
          <b>Catatan stok:</b> setiap distribusi otomatis mengurangi stok dan langsung terlihat oleh Admin Utama pada laporan serta dashboard.
        </div>
      </div>
      <div className="card">
        <div className="module-card-title">
          <div><h3>Riwayat distribusi</h3><p>{distributions.length} transaksi distribusi tercatat.</p></div>
          <button className="primary-btn" onClick={() => window.print()}><Icon name="download" size={14} /> Export</button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Tanggal</th><th>Bahan</th><th>Jumlah</th><th>Keterangan</th></tr></thead>
            <tbody>
              {distributions.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada distribusi.</td></tr>}
              {distributions.map((log) => {
                const material = mat(log.materialId);
                return (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td><b>{material.name}</b><small style={{ display: "block", color: "var(--muted)" }}>{log.materialId} • {log.id}</small></td>
                    <td><b>− {fmtQty(log.qty)} {material.unit}</b></td>
                    <td>{log.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
