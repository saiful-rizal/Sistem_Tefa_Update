import React from "react";

const FLOW = {
  utama: [
    ["Atur modal", "Isi modal bulanan, lihat bahan & laba", "Perencanaan Modal"],
    ["Atur kapasitas", "Rutin 10–15 kg atau penuh 25 kg", "Biaya & Kapasitas"],
    ["Setujui rencana", "Rencana jadi perintah kerja", "Perencanaan Modal"],
    ["Setujui bahan", "Periksa pengajuan beli bahan", "Pengajuan Bahan"],
    ["Pantau penjualan", "Tunai, QRIS, dan transfer", "Riwayat Penjualan"],
  ],
  produksi: [
    ["Lihat perintah", "Apa yang diproduksi hari ini", "Rencana Produksi"],
    ["Mulai batch", "Timbang bahan, mulai alur produksi", "Proses Produksi"],
    ["Ikuti 8 tahap", "Sampai packing, hasil masuk stok", "Proses Produksi"],
    ["Bahan kurang?", "Ajukan pembelian bahan", "Pengajuan Bahan"],
  ],
  kasir: [
    ["Pilih produk", "Ketuk roti atau kue kering", "Kasir POS"],
    ["Terima bayar", "Tunai, QRIS, atau transfer", "Kasir POS"],
    ["Cetak struk", "Lihat transaksi hari ini", "Riwayat Penjualan"],
    ["Cek stok", "Lihat roti siap jual", "Stok Barang Jadi"],
  ],
};

export default function AlurKerja({ roleId, go }) {
  const steps = FLOW[roleId] || FLOW.produksi;
  return (
    <>
      <div className="alur-heading">
        <strong>Alur kerja Anda</strong>
        <span>Pilih langkah untuk langsung membuka menu yang dibutuhkan.</span>
      </div>
      <div className="alur">
        {steps.map((s, i) => (
          <button type="button" key={i} className="alur-step" onClick={() => go(s[2])}>
            <span className="alur-num">{i + 1}</span>
            <span><b>{s[0]}</b><small>{s[1]}</small></span>
          </button>
        ))}
      </div>
    </>
  );
}
