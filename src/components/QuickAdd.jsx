import React, { useState, useEffect } from "react";
import Icon from "./Icon.jsx";
import { fmtQty } from "../lib/format.js";

const PRODUCT_OPTIONS = ["Roti Manis", "Roti Tawar", "Roti Kering 100g", "Roti Kering 180g", "Roti Kering Toples"];
const PAYMENT_OPTIONS = ["QRIS", "Transfer", "Tunai"];
const RECORDING_OPTIONS = ["Google Sheet", "Manual", "Aplikasi Play Store"];

function useEscape(onClose) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
}

function ModalShell({ title, desc, onClose, children }) {
  useEscape(onClose);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="help-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title-icon"><Icon name="plus" size={19} /></div>
          <div>
            <h2>{title}</h2>
            <p>{desc}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function OrderForm({ onAddOrder, onDone, inline = false }) {
  const [product, setProduct] = useState(PRODUCT_OPTIONS[0]);
  const [qty, setQty] = useState("");
  const [kind, setKind] = useState("Rutin");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [recordingMethod, setRecordingMethod] = useState("Manual");
  return (
    <form
      className={"gudang-form" + (inline ? " order-inline-form" : "")}
      style={inline ? undefined : { padding: 20 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (onAddOrder({ product, qty, kind, deadline, note, paymentMethod, recordingMethod })) onDone();
      }}
    >
      <div>
        <label>Pilih Produk</label>
        <select value={product} onChange={(e) => setProduct(e.target.value)}>
          {PRODUCT_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="g-row2">
        <div>
          <label>Jumlah Pesanan</label>
          <input type="number" min="1" step="1" placeholder="Contoh 50" value={qty} onChange={(e) => setQty(e.target.value)} required />
        </div>
        <div>
          <label>Jenis Pesanan</label>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="Rutin">Rutin, jadwal biasa</option>
            <option value="Khusus">Khusus, prioritas tinggi</option>
          </select>
        </div>
      </div>
      <div className="g-row2">
        <div>
          <label>Metode Pembayaran</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {PAYMENT_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Metode Pencatatan</label>
          <select value={recordingMethod} onChange={(e) => setRecordingMethod(e.target.value)}>
            {RECORDING_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label>Deadline</label>
        <input placeholder="Contoh Besok jam 09 pagi" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <div>
        <label>Catatan (opsional)</label>
        <input placeholder="Contoh untuk acara kampus" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="modal-footer" style={inline ? undefined : { margin: "4px -20px -20px", borderRadius: "0 0 18px 18px" }}>
        <span>Pesanan baru masuk daftar Menunggu. Pembayaran: {paymentMethod} • Pencatatan: {recordingMethod}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="pill" onClick={onDone}>Batal</button>
          <button type="submit" className="primary-btn"><Icon name="check" size={14} /> Simpan Pesanan</button>
        </div>
      </div>
    </form>
  );
}

function StockForm({ materials, arahAwal, fixedType, onAddLog, onDone }) {
  const [materialId, setMaterialId] = useState(materials[0] ? materials[0].id : "");
  const [arah, setArah] = useState(arahAwal || "Masuk");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => {
    if (arahAwal) setArah(arahAwal);
  }, [arahAwal]);
  const mat = materials.find((m) => m.id === materialId);
  return (
    <form
      className="gudang-form"
      style={{ padding: 20 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (onAddLog({ materialId, type: arah, qty, note })) onDone();
      }}
    >
      <div>
        <label>Pilih Bahan</label>
        <select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.name}, sisa {fmtQty(m.stock)} {m.unit}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Arah Barang, satu pilihan</label>
        {fixedType ? (
          <input value={fixedType === "Masuk" ? "Barang Masuk, stok bertambah" : "Barang Keluar, stok berkurang"} readOnly />
        ) : (
          <select value={arah} onChange={(e) => setArah(e.target.value)}>
            <option value="Masuk">Barang Masuk, stok bertambah</option>
            <option value="Keluar">Barang Keluar, stok berkurang</option>
          </select>
        )}
        <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
          {arah === "Masuk"
            ? "Masuk dipakai saat pembelian, retur, atau koreksi tambah. Stok gudang bertambah."
            : "Keluar dipakai saat pemakaian produksi, barang rusak, atau susut. Stok gudang berkurang."}
          {mat && (
            <span> Stok {mat.name} sekarang {fmtQty(mat.stock)} {mat.unit}.</span>
          )}
        </p>
      </div>
      <div className="g-row2">
        <div>
          <label>Jumlah</label>
          <input type="number" min="0" step="0.1" placeholder="Contoh 5" value={qty} onChange={(e) => setQty(e.target.value)} required />
        </div>
        <div>
          <label>Keterangan</label>
          <input
            placeholder={arah === "Masuk" ? "Contoh beli ke supplier" : "Contoh dipakai produksi"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
      <div className="modal-footer" style={{ margin: "4px -20px -20px", borderRadius: "0 0 18px 18px" }}>
        <span>Catatan langsung update stok dan prediksi.</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="pill" onClick={onDone}>Batal</button>
          <button type="submit" className="primary-btn"><Icon name="check" size={14} /> Simpan Catatan</button>
        </div>
      </div>
    </form>
  );
}

export default function QuickAdd({ materials = [], onAddLog, onAddOrder, preset = "semua", canIn = true, inline = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [arahAwal, setArahAwal] = useState("Masuk");

  const openOrder = () => {
    setMenuOpen(false);
    setModal("pesanan");
  };
  const openStock = (arah) => {
    setMenuOpen(false);
    setArahAwal(arah || "Masuk");
    setModal("stok");
  };
  const close = () => setModal(null);

  if (preset === "pesanan") {
    if (inline) {
      return (
        <div className="card inline-entry">
          <div className="module-card-title">
            <div><h3>Pesanan pelanggan</h3><p>Tambahkan pesanan, lalu lihat status dan detailnya di daftar pesanan di bawah.</p></div>
            <button type="button" className="primary-btn" onClick={() => setModal((value) => value ? null : "pesanan")}>
              <Icon name="plus" size={14} /> {modal === "pesanan" ? "Tutup Form" : "Tambah Pesanan"}
            </button>
          </div>
          {modal === "pesanan" && <OrderForm onAddOrder={onAddOrder} onDone={close} inline />}
        </div>
      );
    }
    return (
      <>
        <button className="primary-btn" onClick={openOrder}><Icon name="plus" size={14} /> Tambah Pesanan</button>
        {modal === "pesanan" && (
          <ModalShell title="Tambah Pesanan Baru" desc="Isi produk, jumlah, dan jenis pesanan." onClose={close}>
            <OrderForm onAddOrder={onAddOrder} onDone={close} />
          </ModalShell>
        )}
      </>
    );
  }

  if (preset === "gudang") {
    if (!canIn) return null;
    return (
      <>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="primary-btn" onClick={() => openStock("Masuk")}><Icon name="in" size={14} /> Barang Masuk</button>
        </div>
        {modal === "stok" && (
          <ModalShell title="Catat Barang Masuk atau Keluar" desc="Satu formulir untuk tambah dan kurang stok." onClose={close}>
            <StockForm materials={materials} arahAwal={arahAwal} fixedType="Masuk" onAddLog={onAddLog} onDone={close} />
          </ModalShell>
        )}
      </>
    );
  }

  if (preset === "distribusi") {
    return (
      <>
        <button className="primary-btn" onClick={() => openStock("Keluar")}><Icon name="out" size={14} /> Catat Distribusi</button>
        {modal === "stok" && (
          <ModalShell title="Catat Distribusi Bahan Baku" desc="Catat bahan yang disalurkan untuk produksi." onClose={close}>
            <StockForm materials={materials} arahAwal="Keluar" fixedType="Keluar" onAddLog={onAddLog} onDone={close} />
          </ModalShell>
        )}
      </>
    );
  }

  return (
    <>
      <div className="quickadd-wrap">
        <button className="primary-btn" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen}>
          <Icon name="plus" size={14} /> Tambah <Icon name="chevD" size={13} />
        </button>
        {menuOpen && (
          <>
            <div className="quickadd-backdrop" onClick={() => setMenuOpen(false)} />
            <div className="quickadd-menu" role="menu">
              <button onClick={openOrder}>
                <span className="qa-icon"><Icon name="receipt" size={15} /></span>
                <span><strong>Tambah Pesanan</strong><small>Pesanan rutin atau khusus baru</small></span>
              </button>
              {canIn && <button onClick={() => openStock("Masuk")}>
                <span className="qa-icon in"><Icon name="in" size={15} /></span>
                <span><strong>Barang Masuk</strong><small>Stok bertambah, contoh beli bahan</small></span>
              </button>}
              <button onClick={() => openStock("Keluar")}>
                <span className="qa-icon out"><Icon name="out" size={15} /></span>
                <span><strong>Barang Keluar</strong><small>Stok berkurang, contoh dipakai produksi</small></span>
              </button>
            </div>
          </>
        )}
      </div>
      {modal === "pesanan" && (
        <ModalShell title="Tambah Pesanan Baru" desc="Isi produk, jumlah, dan jenis pesanan." onClose={close}>
          <OrderForm onAddOrder={onAddOrder} onDone={close} />
        </ModalShell>
      )}
      {modal === "stok" && (
        <ModalShell title="Catat Barang Masuk atau Keluar" desc="Satu formulir untuk tambah dan kurang stok." onClose={close}>
          <StockForm materials={materials} arahAwal={arahAwal} onAddLog={onAddLog} onDone={close} />
        </ModalShell>
      )}
    </>
  );
}
