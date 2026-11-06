import React from "react";
import Icon from "../components/Icon.jsx";

export default function BantuanModule() {
  return (
    <>
      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title">
            <div><h3>Alur kerja TEFA</h3><p>Ikuti urutan ini untuk hasil rekomendasi yang konsisten.</p></div>
          </div>
          <div className="module-list">
            {[
              ["01", "Masukkan pesanan", "Pesanan khusus otomatis menjadi Dmin."],
              ["02", "Cek bahan baku", "Pastikan stok cukup untuk resep produk."],
              ["03", "Jalankan optimasi", "Solver memilih kombinasi laba maksimum."],
              ["04", "Jadwalkan produksi", "Bagi beban mesin dan SDM sesuai deadline."],
            ].map((x) => (
              <div className="module-list-row" key={x[0]}>
                <div className="row-icon">{x[0]}</div>
                <div className="row-main"><strong>{x[1]}</strong><span>{x[2]}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="module-card-title">
            <div><h3>Panduan membaca hasil</h3><p>Istilah penting dalam dashboard.</p></div>
          </div>
          {[
            ["Optimal", "Semua kendala modal, mesin, SDM, dan pesanan terpenuhi."],
            ["Infeasible", "Batasan belum dapat dipenuhi. Tambah kapasitas atau turunkan Dmin."],
            ["Utilisasi", "Persentase kapasitas yang terpakai untuk rencana produksi."],
          ].map((x) => (
            <div className="help-card" style={{ marginBottom: 10 }} key={x[0]}>
              <div><b>{x[0]}</b><p>{x[1]}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="module-card-title">
          <div><h3>Butuh bantuan lebih lanjut</h3><p>Hubungi pengelola sistem TEFA untuk koreksi data master atau parameter.</p></div>
          <button className="primary-btn"><Icon name="mail" size={14} /> Hubungi admin</button>
        </div>
      </div>
    </>
  );
}
