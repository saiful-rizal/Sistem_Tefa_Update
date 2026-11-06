import React from "react";
import Icon from "../components/Icon.jsx";
import OptimasiModule from "./OptimasiModule.jsx";
import GudangModule from "./GudangModule.jsx";
import DistribusiModule from "./DistribusiModule.jsx";
import PesananModule from "./PesananModule.jsx";
import PeramalanModule from "./PeramalanModule.jsx";
import PenjadwalanModule from "./PenjadwalanModule.jsx";
import LaporanModule from "./LaporanModule.jsx";
import PengaturanModule from "./PengaturanModule.jsx";
import BantuanModule from "./BantuanModule.jsx";
import PerencanaanModule from "./PerencanaanModule.jsx";
import RencanaProduksiModule from "./RencanaProduksiModule.jsx";
import PengajuanModule from "./PengajuanModule.jsx";
import MasterDataModule from "./MasterDataModule.jsx";
import HakAksesModule from "./HakAksesModule.jsx";
import PengelolaanBahanModule from "./PengelolaanBahanModule.jsx";
import BarangMasukModule from "./BarangMasukModule.jsx";
import RiwayatMutasiModule from "./RiwayatMutasiModule.jsx";
import LaporanProduksiModule from "./LaporanProduksiModule.jsx";
import StokJadiModule from "./StokJadiModule.jsx";
import FrekuensiModule from "./FrekuensiModule.jsx";
import ProductionProcessModule from "./ProductionProcessModule.jsx";
import KasirPOSModule from "./KasirPOSModule.jsx";
import RiwayatPenjualanModule from "./RiwayatPenjualanModule.jsx";
import BiayaKapasitasModule from "./BiayaKapasitasModule.jsx";
import { can } from "../lib/roles.js";

const TITLES = {
  "Kasir POS": ["Kasir Tefa Bakery", "Pilih produk, pilih cara bayar, lalu tekan Bayar. Stok dan laporan langsung ikut berubah."],
  "Riwayat Penjualan": ["Riwayat Penjualan", "Semua transaksi kasir: tunai, QRIS, dan transfer."],
  "Biaya & Kapasitas": ["Biaya & Kapasitas Produksi", "Atur kapasitas rutin 10–15 kg atau penuh 25 kg, dan lihat pembagian biaya 60/20/10/10."],
  "Proses Produksi": ["Proses Produksi", "Pantau tahapan dari penimbangan sampai packing dalam satu alur."],
  "Perencanaan Modal": ["Perencanaan Modal Bulanan", "Masukkan modal, sistem menghitung kebutuhan bahan baku, produksi, penjualan, dan laba maksimal."],
  "Rencana Produksi": ["Rencana Produksi", "Perintah kerja dari rencana yang disetujui Admin Utama dan input realisasi harian."],
  "Pengajuan Bahan": ["Pengajuan Pembelian Bahan", "Admin Produksi mengajukan, Admin Utama menyetujui, penerimaan mengisi stok otomatis."],
  "Bahan Baku": ["Stok Bahan Baku", "Pantau persediaan, prediksi ketahanan, dan koreksi stok."],
  "Pengelolaan Bahan Baku": ["Pengelolaan Bahan Baku", "Tambah, ubah, dan hapus data bahan baku: satuan, harga, stok minimum, masa simpan."],
  "Barang Masuk": ["Barang Masuk", "Catat pembelian dan penerimaan bahan baku; stok bertambah otomatis."],
  "Riwayat Mutasi": ["Riwayat Mutasi Bahan Baku", "Seluruh barang masuk, keluar, dan koreksi stok untuk audit."],
  "Laporan Produksi": ["Laporan Produksi", "Capaian realisasi produksi terhadap rencana bulanan."],
  "Laporan": ["Laporan Keuangan", "Rangkum pendapatan, laba, dan nilai persediaan."],
  "Master Data": ["Produk & Resep", "Harga jual, HPP, kapasitas, dan resep (BOM) tiap produk. Hanya Admin Utama."],
  "Stok Barang Jadi": ["Stok Barang Jadi & Penjualan", "Catat penjualan, pantau masa simpan, dan dapatkan saran jumlah produksi."],
  "Frekuensi Produksi": ["Frekuensi Produksi", "Bandingkan produksi 1x dan 2x seminggu agar roti tidak terbuang."],
  "Hak Akses": ["Hak Akses & Log Aktivitas", "Pembagian wewenang Admin Utama dan Admin Produksi serta jejak audit."],
  Optimasi: ["Optimasi Produksi", "MILP sadar stok. Memaksimalkan laba dengan kendala modal, oven, mixer, SDM, stok gudang, dan batas pesanan."],
  "Distribusi Bahan": ["Distribusi Bahan Baku", "Catat penyaluran bahan dari gudang ke proses produksi."],
  Pesanan: ["Pesanan Pelanggan", "Kelola pesanan rutin dan pesanan khusus."],
  Peramalan: ["Peramalan Permintaan", "Forecast kebutuhan bahan dan daya tahan stok berbasis rencana optimal."],
  Penjadwalan: ["Penjadwalan Produksi", "Susun urutan produksi berdasarkan deadline dan kapasitas."],
  Pengaturan: ["Pengaturan Sistem", "Kelola parameter operasional dan notifikasi."],
  Bantuan: ["Pusat Bantuan", "Pelajari alur penggunaan sistem dan cara membaca rekomendasi."],
  Keluar: ["Keluar dari Sistem", "Pastikan pekerjaan sudah tersimpan sebelum mengakhiri sesi."],
};

export default function ModulePage(props) {
  const { page, res, setPage, materials, logs, orders, coverage, stockValue, onAddLog, onSetStock, onAddOrder, onUpdateOrderStatus, roleId, role, canFinance, plan, params, setParam, products, approved, onApprove, onRevoke, realisasi, onReport, requests, onCreateRequest, onDecideRequest, onReceiveRequest, onProduct, onBom, onAddMaterial, onEditMaterial, onDeleteMaterial, audit, onLogout, stokJadi, sales, waste, onSale, onDiscard, demandCaps, trx, onCheckout, runs, onStartRun, onAdvanceRun, onCancelRun } = props;
  const go = (id) => setPage(id);
  const [title, description] = TITLES[page] || [page, ""];

  if (page === "Keluar") {
    return (
      <div className="module-page">
        <div className="card" style={{ maxWidth: 560, margin: "70px auto", textAlign: "center" }}>
          <div className="ph-ico"><Icon name="logout" size={26} /></div>
          <h2 style={{ fontSize: 18 }}>Akhiri sesi {role.label}</h2>
          <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, margin: "8px auto 20px" }}>
            Data tetap tersimpan di perangkat ini. Aktivitas Anda tercatat di log.
          </p>
          <div className="module-actions" style={{ justifyContent: "center" }}>
            <button className="pill" onClick={() => go("Dashboard")}>Kembali ke Dashboard</button>
            <button className="primary-btn" onClick={onLogout}><Icon name="logout" size={15} /> Konfirmasi Keluar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-page">
      <div className="module-intro">
        <div><h1>{title}</h1><p>{description}</p>{page === "Kasir POS" && <span className="demo-badge">Termasuk transaksi simulasi</span>}</div>
        {roleId !== "kasir" && (
          <div className="module-actions">
            <button className="pill"><Icon name="refresh" size={14} /> Segarkan</button>
            <button className="primary-btn" onClick={() => window.print()}><Icon name="download" size={14} /> Export</button>
          </div>
        )}
      </div>
      {page === "Perencanaan Modal" && <PerencanaanModule demandCaps={demandCaps} plan={plan} params={params} setParam={setParam} products={products} materials={materials} approved={approved} onApprove={onApprove} onRevoke={onRevoke} go={go} />}
      {page === "Rencana Produksi" && <RencanaProduksiModule stokJadi={stokJadi} approved={approved} products={products} materials={materials} realisasi={realisasi} onReport={onReport} go={go} canFinance={canFinance} />}
      {page === "Pengajuan Bahan" && <PengajuanModule requests={requests} materials={materials} canApprove={can(roleId, "request.approve")} canReceive={can(roleId, "request.receive")} canFinance={canFinance} onCreate={onCreateRequest} onDecide={onDecideRequest} onReceive={onReceiveRequest} />}
      {page === "Master Data" && <MasterDataModule products={products} materials={materials} onProduct={onProduct} onBom={onBom} />}
      {page === "Pengelolaan Bahan Baku" && <PengelolaanBahanModule materials={materials} products={products} onAdd={onAddMaterial} onEdit={onEditMaterial} onDelete={onDeleteMaterial} canFinance={canFinance} />}
      {page === "Barang Masuk" && <BarangMasukModule materials={materials} logs={logs} plan={plan} onAddLog={onAddLog} />}
      {page === "Riwayat Mutasi" && <RiwayatMutasiModule logs={logs} materials={materials} />}
      {page === "Laporan Produksi" && <LaporanProduksiModule approved={approved} realisasi={realisasi} products={products} />}
      {page === "Stok Barang Jadi" && <StokJadiModule stokJadi={stokJadi} products={products} sales={sales} waste={waste} onSale={onSale} onDiscard={onDiscard} canFinance={canFinance} roleId={roleId} go={go} />}
      {page === "Proses Produksi" && <ProductionProcessModule products={products} runs={runs} params={params} onStartRun={onStartRun} onAdvanceRun={onAdvanceRun} onCancelRun={onCancelRun} canTrack={can(roleId, "process.track")} />}
      {page === "Kasir POS" && <KasirPOSModule products={products} trx={trx} stokJadi={stokJadi} onCheckout={onCheckout} canSell={can(roleId, "pos.sell")} go={go} />}
      {page === "Riwayat Penjualan" && <RiwayatPenjualanModule trx={trx} products={products} />}
      {page === "Biaya & Kapasitas" && <BiayaKapasitasModule params={params} setParam={setParam} products={products} />}
      {page === "Frekuensi Produksi" && <FrekuensiModule stokJadi={stokJadi} products={products} params={params} setParam={setParam} />}
      {page === "Hak Akses" && <HakAksesModule audit={audit} />}
      {page === "Optimasi" && <OptimasiModule res={res} go={go} materials={materials} coverage={coverage} />}
      {page === "Bahan Baku" && (
        <GudangModule
          res={res}
          materials={materials}
          logs={logs}
          coverage={coverage}
          stockValue={stockValue}
          onAddLog={onAddLog}
          onAddOrder={onAddOrder}
          onSetStock={onSetStock}
          canFinance={canFinance}
          canAdjust={can(roleId, "stock.adjust")}
          canIn={can(roleId, "stock.in")}
        />
      )}
      {page === "Distribusi Bahan" && (
        <DistribusiModule materials={materials} logs={logs} onAddLog={onAddLog} onAddOrder={onAddOrder} canIn={can(roleId, "stock.in")} />
      )}
      {page === "Pesanan" && (
        <PesananModule go={go} orders={orders} materials={materials} onAddOrder={onAddOrder} onAddLog={onAddLog} onUpdateOrderStatus={onUpdateOrderStatus} />
      )}
      {page === "Peramalan" && <PeramalanModule res={res} materials={materials} coverage={coverage} canFinance={canFinance} />}
      {page === "Penjadwalan" && <PenjadwalanModule />}
      {page === "Laporan" && <LaporanModule res={res} materials={materials} coverage={coverage} stockValue={stockValue} trx={trx} />}
      {page === "Pengaturan" && <PengaturanModule />}
      {page === "Bantuan" && <BantuanModule />}
    </div>
  );
}
