import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { rp } from "../lib/format.js";

const statusOf = (c) => (c.expiredQty > 0 ? ["err", "Ada yang kedaluwarsa"] : c.soon > 0 ? ["warn", "Segera jual"] : c.fresh > 0 ? ["ok", "Aman"] : ["warn", "Stok kosong"]);

export default function StokJadiModule({ stokJadi, products, sales, waste, onSale, onDiscard, canFinance, roleId, go }) {
  const isKasir = roleId === "kasir";
  const [saleQty, setSaleQty] = useState({});
  const list = products.map((p) => stokJadi[p.id]);
  const expiredTotal = list.reduce((s, c) => s + c.expiredQty, 0);
  const all = list.flatMap((c) => c.items.map((i) => ({ ...i, product: c.product })));
  const submitSale = (e, productId) => {
    e.preventDefault();
    if (onSale({ productId, qty: saleQty[productId] }) !== false) {
      setSaleQty((current) => ({ ...current, [productId]: "" }));
    }
  };
  const wasteMonth = waste.filter((w) => w.date.slice(0, 7) === new Date().toISOString().slice(0, 7));
  const todaySales = sales.filter((s) => s.date === new Date().toISOString().slice(0, 10));
  const todaySold = todaySales.reduce((s, x) => s + x.qty, 0);

  // ---------- Kasir view: sederhana, tombol besar, fokus penjualan ----------
  if (isKasir) {
    return (
      <>
        <div className="page-head">
          <div>
            <h1>Penjualan Harian</h1>
            <div className="sub">Lihat stok siap jual. Untuk menjual, gunakan Kasir Tefa Bakery agar pembayaran ikut tercatat.</div>
          </div>
          <div className="head-actions">
            <span className="chip-status ok"><span className="dot"></span>{todaySold} pcs terjual hari ini</span>
          </div>
        </div>

        {/* Ringkasan stok per produk */}
        <div className="pcard-grid">
          {list.map((c) => {
            const [cls, text] = statusOf(c);
            return (
              <div className="card pcard" key={c.product.id}>
                <div className="pcard-top"><b>{c.product.name}</b><span className={"chip-status " + cls}><span className="dot"></span>{text}</span></div>
                <div className="pcard-num">{c.fresh}<small> pcs siap jual</small></div>
                <div className="pcard-meta">Tahan {c.shelf} hari{c.soon > 0 ? ` • ${c.soon} pcs segera dijual` : ""}{c.expiredQty > 0 ? ` • ${c.expiredQty} pcs kedaluwarsa` : ""}</div>
                <div className="pcard-meta">Rata-rata laku: <b>{c.avg.value != null ? Math.round(c.avg.value) : "-"} pcs/hari</b></div>
                <button className="primary-btn" type="button" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={() => go("Kasir POS")}><Icon name="wallet" size={14} /> Jual lewat Kasir Tefa Bakery</button>
              </div>
            );
          })}
        </div>

        {/* Roti kedaluwarsa */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="module-card-title"><div><h3>Roti Kedaluwarsa</h3><p>Roti yang sudah lewat masa simpan tidak boleh dijual.</p></div></div>
          <div className="pcard-num" style={{ color: expiredTotal ? "var(--red)" : "var(--green-text)" }}>{expiredTotal}<small> pcs</small></div>
          <button className="primary-btn" disabled={!expiredTotal} onClick={onDiscard} style={{ marginTop: 10, width: "100%" }}><Icon name="trash" size={14} /> Catat sudah dibuang</button>
          <div className="formula">Terbuang bulan ini: <b>{wasteMonth.reduce((s, w) => s + w.qty, 0)} pcs</b>{canFinance ? ` • kerugian ${rp(wasteMonth.reduce((s, w) => s + w.qty * ((products.find((p) => p.id === w.productId) || {}).hpp || 0), 0))}` : ""}</div>
        </div>

        {/* Riwayat penjualan */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="module-card-title"><div><h3>Riwayat Penjualan Terbaru</h3></div></div>
          <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
            <thead><tr><th>Tanggal</th><th>Produk</th><th>Terjual</th><th>Dicatat oleh</th></tr></thead>
            <tbody>{sales.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada penjualan.</td></tr>}
              {sales.slice(0, 10).map((s) => (<tr key={s.id}><td>{s.date}</td><td>{(products.find((p) => p.id === s.productId) || {}).name}</td><td><b>{s.qty} pcs</b></td><td>{s.by}</td></tr>))}
            </tbody>
          </table></div>
        </div>
      </>
    );
  }

  // ---------- View standar (Admin Utama / Produksi) ----------
  return (
    <>
      <div className="guide">
        <b>Halaman ini menjawab 3 pertanyaan:</b> (1) Berapa roti jadi yang masih ada? (2) Mana yang hampir kedaluwarsa? (3) Produksi berikutnya sebaiknya berapa agar tidak terbuang?
        Isi <b>jumlah terjual</b> setiap hari, sistem menghitung sisanya dan memberi saran jumlah produksi.
      </div>

      <div className="pcard-grid">
        {list.map((c) => {
          const [cls, text] = statusOf(c);
          const rec = c.rec;
          return (
            <div className="card pcard" key={c.product.id}>
              <div className="pcard-top"><b>{c.product.name}</b><span className={"chip-status " + cls}><span className="dot"></span>{text}</span></div>
              <div className="pcard-num">{c.fresh}<small> pcs siap jual</small></div>
              <div className="pcard-meta">Tahan {c.shelf} hari{c.soon > 0 ? ` • ${c.soon} pcs harus segera dijual` : ""}{c.expiredQty > 0 ? ` • ${c.expiredQty} pcs kedaluwarsa` : ""}</div>
              <div className="pcard-meta">Rata-rata terjual: <b>{c.avg.value != null ? Math.round(c.avg.value) : "-"} pcs/hari</b>{c.avg.value != null && !c.avg.real ? " (perkiraan awal dari rencana)" : ""}</div>
              <form className="gudang-form inline-sale-form" onSubmit={(e) => submitSale(e, c.product.id)}>
                <div><label>Jumlah terjual (pcs)</label><input type="number" min="1" max={c.fresh} value={saleQty[c.product.id] || ""} onChange={(e) => setSaleQty((current) => ({ ...current, [c.product.id]: e.target.value }))} required disabled={c.fresh <= 0} placeholder="Masukkan jumlah" /></div>
                <button className="primary-btn" type="submit" style={{ width: "100%", justifyContent: "center" }} disabled={c.fresh <= 0}><Icon name="check" size={14} /> Catat Penjualan</button>
              </form>
              {rec ? (<div className="pcard-rec">Produksi {c.cycle.isToday ? "hari ini" : c.cycle.nextDay}: <b>{rec.rekom} pcs</b>
                <small>{rec.rekom === 0 ? "Stok masih cukup, tidak perlu produksi." : `Kebutuhan ${rec.target} pcs untuk ${rec.sellDays} hari, stok yang masih layak ${c.stockAt} pcs.`}{c.planQty != null ? ` Rencana sistem: ${c.planQty} pcs.` : ""}</small></div>)
                : <small>Isi penjualan beberapa hari agar saran produksi muncul.</small>}
            </div>
          );
        })}
      </div>

      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title"><div><h3>Roti kedaluwarsa</h3><p>Yang sudah lewat masa simpan tidak boleh dijual.</p></div></div>
          <div className="pcard-num" style={{ color: expiredTotal ? "var(--red)" : "var(--green-text)" }}>{expiredTotal}<small> pcs</small></div>
          <button className="primary-btn" disabled={!expiredTotal} onClick={onDiscard} style={{ marginTop: 10 }}><Icon name="trash" size={14} /> Catat sudah dibuang</button>
          <div className="formula">Terbuang bulan ini: <b>{wasteMonth.reduce((s, w) => s + w.qty, 0)} pcs</b>{canFinance ? ` • kerugian ${rp(wasteMonth.reduce((s, w) => s + w.qty * ((products.find((p) => p.id === w.productId) || {}).hpp || 0), 0))}` : ""}</div>
        </div>
      </div>

      <div className="card">
        <div className="module-card-title"><div><h3>Rincian stok per batch</h3><p>Setiap hasil produksi dicatat sebagai satu batch lengkap dengan batas jualnya.</p></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Produk</th><th>Diproduksi</th><th>Sisa</th><th>Umur</th><th>Batas jual</th><th>Status</th></tr></thead>
          <tbody>{all.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada stok jadi. Stok muncul setelah hasil produksi dicatat di Rencana Produksi.</td></tr>}
            {all.map((b) => (<tr key={b.id}><td><b>{b.product.name}</b></td><td>{b.date}</td><td>{b.remaining} pcs</td><td>{b.age} hari</td><td>{b.expired ? "lewat" : b.left === 0 ? "hari ini" : `${b.left} hari lagi`}</td>
              <td><span className={"chip-status " + (b.expired ? "err" : b.left <= 1 ? "warn" : "ok")}><span className="dot"></span>{b.expired ? "Kedaluwarsa" : b.left <= 1 ? "Segera jual" : "Aman"}</span></td></tr>))}
          </tbody>
        </table></div>
      </div>

      <div className="card">
        <div className="module-card-title"><div><h3>Riwayat penjualan terakhir</h3></div></div>
        <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Tanggal</th><th>Produk</th><th>Terjual</th><th>Dicatat oleh</th></tr></thead>
          <tbody>{sales.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada penjualan.</td></tr>}
            {sales.slice(0, 10).map((s) => (<tr key={s.id}><td>{s.date}</td><td>{(products.find((p) => p.id === s.productId) || {}).name}</td><td><b>{s.qty} pcs</b></td><td>{s.by}</td></tr>))}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
