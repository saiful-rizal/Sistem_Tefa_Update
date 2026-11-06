import React from "react";
import { rp, fmtQty } from "../lib/format.js";

export default function PeramalanModule({ res, materials, coverage, canFinance = true }) {
  const crit = materials.filter((m) => {
    const c = coverage[m.id];
    return c && (c.status === "Kritis" || c.status === "Habis");
  });
  return (
    <>
      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title">
            <div><h3>Proyeksi permintaan 7 hari</h3><p>Baseline histori + pesanan aktif. Dmax: Manis 250, Tawar 100, Bagelan 100.</p></div>
            <span className="chip-status ok"><span className="dot"></span>Confidence 86%</span>
          </div>
          <div className="module-list">
            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((d, i) => (
              <div className="module-list-row" key={d}>
                <div className="row-main"><strong>{d}</strong><span>{i < 5 ? "Hari sekolah" : "Akhir pekan"}</span></div>
                <div style={{ width: "45%" }}><div className="track"><div className="fill" style={{ width: 58 + i * 5 + "%" }} /></div></div>
                <div className="row-end">{110 + i * 14}<small>unit</small></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="module-card-title">
            <div><h3>Sinyal stok ke produksi</h3><p>Forecast dibatasi stok gudang aktual.</p></div>
          </div>
          {crit.length === 0 ? (
            <div className="help-card">
              <div className="row-icon">✓</div>
              <div><b>Stok mendukung forecast</b><p>Semua bahan di atas minimum. Rencana {res.x1 + res.x2 + res.x3} unit dapat berjalan.</p></div>
            </div>
          ) : (
            <div className="help-card">
              <div className="row-icon">!</div>
              <div><b>{crit.length} bahan kritis</b><p>{crit.map((m) => m.name).join(", ")} di bawah minimum. Tambah stok sebelum menaikkan Dmax/forecast.</p></div>
            </div>
          )}
          <div style={{ height: 10 }} />
          <div className="help-card">
            <div className="row-icon">!</div>
            <div><b>Bottleneck: {res.bottleneck}</b><p>Utilisasi {res.bottleneckPct}%. Sumber daya ini yang menahan laba naik lebih tinggi.</p></div>
          </div>
          <div style={{ height: 10 }} />
          <div className="module-list">
            {materials.map((m) => {
              const c = coverage[m.id];
              if (!c) return null;
              return (
                <div className="module-list-row" key={m.id}>
                  <div className="row-main">
                    <strong>{m.name}</strong>
                    <span>Butuh {fmtQty(c.need)} {m.unit}/hari • sisa {fmtQty(c.left)}</span>
                  </div>
                  <div className="row-end">
                    {c.daysLabel} hari<small>{c.suggest7 > 0.05 ? "beli " + fmtQty(Math.ceil(c.suggest7 * 10) / 10) : "cukup"}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="module-card-title">
          <div><h3>Rekomendasi pembaruan solver</h3><p>Forecast menjadi Dmax; stok menjadi batas atas. Keduanya bertemu di MILP.</p></div>
          <button className="primary-btn">Terapkan ke Optimasi</button>
        </div>
        <div className="formula">
          <b>Output model live:</b> Roti Manis {res.x1} unit • Roti Tawar {res.x2} unit • Bagelan {res.x3} unit {canFinance ? ` • Laba ${rp(res.profit)}` : ""}
        </div>
      </div>
    </>
  );
}
