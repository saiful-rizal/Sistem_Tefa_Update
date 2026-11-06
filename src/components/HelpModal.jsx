import React from "react";
import Icon from "./Icon.jsx";

export default function HelpModal({ onClose, onNavigate }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-title-icon"><Icon name="help" size={19} /></div>
          <div>
            <h2 id="help-title">Bantuan cepat TEFA</h2>
            <p>Ikuti alur sederhana untuk menjalankan produksi.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup bantuan">×</button>
        </div>
        <div className="quick-help-list">
          {[
            ["1", "Masukkan pesanan", "Buka menu Pesanan dan cek deadline.", "Pesanan"],
            ["2", "Periksa stok", "Pastikan bahan baku cukup.", "Bahan Baku"],
            ["3", "Jalankan solver", "Gunakan rekomendasi produksi optimal.", "Optimasi"],
            ["4", "Susun jadwal", "Atur urutan kerja sesuai kapasitas.", "Penjadwalan"],
          ].map((row) => (
            <button key={row[0]} onClick={() => onNavigate(row[3])}>
              <span>{row[0]}</span>
              <span><strong>{row[1]}</strong><small>{row[2]}</small></span>
              <Icon name="arrowR" size={15} />
            </button>
          ))}
        </div>
        <div className="modal-footer">
          <span>Ini adalah prototype front-end. Data belum tersimpan ke server.</span>
          <button className="primary-btn" onClick={onClose}>Mengerti</button>
        </div>
      </div>
    </div>
  );
}
