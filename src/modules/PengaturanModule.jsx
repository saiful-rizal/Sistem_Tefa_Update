import React from "react";

export default function PengaturanModule() {
  return (
    <div className="module-grid two">
      <div className="card">
        <div className="module-card-title">
          <div><h3>Parameter operasional</h3><p>Nilai awal digunakan sebagai batasan solver harian.</p></div>
          <button className="primary-btn">Simpan</button>
        </div>
        {[
          ["Modal bahan baku", "Rp 750.000"],
          ["Jam operasi oven", "8 jam per hari"],
          ["Jam operasi mixer", "4 jam per hari"],
          ["Tenaga kerja", "16 jam per hari"],
        ].map((x) => (
          <div className="setting-row" key={x[0]}>
            <div><strong>{x[0]}</strong><span>{x[1]}</span></div>
            <button className="pill">Ubah</button>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="module-card-title">
          <div><h3>Preferensi notifikasi</h3><p>Atur kapan sistem memberi pengingat.</p></div>
        </div>
        {["Deadline pesanan mendekat", "Stok bahan di bawah minimum", "Solver selesai menghitung"].map((x, i) => (
          <div className="setting-row" key={x}>
            <div><strong>{x}</strong><span>{i === 0 ? "2 jam sebelum deadline" : "Notifikasi di dashboard"}</span></div>
            <button className="toggle on"><i /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
