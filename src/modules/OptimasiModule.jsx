import React from "react";
import { rp } from "../lib/format.js";

export default function OptimasiModule({ res, go }) {
  const rows = [
    ["Roti Manis", "X1", res.x1, "Rp 2.000", "Pesanan minimum (Dmin)"],
    ["Roti Tawar", "X2", res.x2, "Rp 6.000", "Margin tertinggi"],
    ["Roti Kering (Bagelan)", "X3", res.x3, "Rp 5.000", "Kapasitas sisa"],
  ];
  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card">
          <div className="metric-label">Status solver</div>
          <div className="metric-value" style={{ color: res.status === "Optimal" ? "var(--green-text)" : "var(--red)" }}>{res.status}</div>
          <div className="metric-note">
            {res.status === "Optimal" ? "Semua kendala (modal, alat, SDM, stok, Dmin/Dmax) terpenuhi" : res.reason || "Infeasible"}
          </div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Laba maksimum</div>
          <div className="metric-value">{rp(res.profit)}</div>
          <div className="metric-note">Dari {rp(res.revenue)} pendapatan</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Total produksi</div>
          <div className="metric-value">{(res.x1 + res.x2 + res.x3).toLocaleString("id-ID")} <small>unit</small></div>
          <div className="metric-note">Bottleneck: {res.bottleneck} ({res.bottleneckPct}%)</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Pesanan khusus</div>
          <div className="metric-value">{res.x1} <small>unit</small></div>
          <div className="metric-note">Roti Manis sebagai Dmin</div>
        </div>
      </div>
      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title">
            <div><h3>Rekomendasi keputusan produksi</h3><p>Kuantitas optimal hasil MILP sadar-stok gudang.</p></div>
            <span className={"chip-status " + (res.status === "Optimal" ? "ok" : "err")}>
              <span className="dot"></span>{res.status === "Optimal" ? "Layak" : "Cek batasan"}
            </span>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Produk</th><th>Variabel</th><th>Jumlah</th><th>Margin/unit</th><th>Alasan</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[0]}><td><b>{r[0]}</b></td><td>{r[1]}</td><td><b>{r[2]} unit</b></td><td>{r[3]}</td><td>{r[4]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="formula">
            <b>Model PDF:</b> Max Z = Σ Mi·Xi &nbsp;•&nbsp; Σ HPPi·Xi ≤ modal &nbsp;•&nbsp; Σ tik·Xi ≤ Kk &nbsp;•&nbsp; Σ aij·Xi ≤ stok<sub>j</sub> &nbsp;•&nbsp; Dmin ≤ Xi ≤ Dmax
          </div>
        </div>
        <div className="card">
          <div className="module-card-title">
            <div><h3>Langkah berikutnya</h3><p>Jalankan keputusan secara berurutan.</p></div>
          </div>
          <div className="module-list">
            {["Validasi stok bahan baku", "Tetapkan jadwal produksi", "Konfirmasi pesanan pelanggan"].map((x, i) => (
              <div className="module-list-row" key={x}>
                <div className="row-icon">{i + 1}</div>
                <div className="row-main">
                  <strong>{x}</strong>
                  <span>
                    {i === 0 ? "Stok live menentukan batas solver" : i === 1 ? "Alokasikan oven, mixer, dan SDM" : "Kirim waktu selesai ke pelanggan"}
                  </span>
                </div>
                <button className="pill" onClick={() => go(i === 0 ? "Bahan Baku" : i === 1 ? "Penjadwalan" : "Pesanan")}>Buka</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
