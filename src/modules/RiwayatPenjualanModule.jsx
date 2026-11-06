import React, { useState, useMemo } from "react";
import { rp } from "../lib/format.js";
import { PAY_METHODS, summarize, hhmm, ymd } from "../lib/pos.js";

export default function RiwayatPenjualanModule({ trx, products }) {
  const [date, setDate] = useState(ymd());
  const [method, setMethod] = useState("Semua");
  const list = useMemo(() => trx.filter((t) => (!date || t.date === date) && (method === "Semua" || t.method === method)), [trx, date, method]);
  const sum = useMemo(() => summarize(list), [list]);
  const recap = Object.entries(sum.byProduct);
  const shortName = (n) => n.replace("Roti Kering ", "Kue Kering ");
  return (
    <>
      <div className="pos-summary">
        <div className="card metric-card"><div className="metric-label">Total penjualan</div><div className="metric-value">{rp(sum.total)}</div><div className="metric-note">{sum.count} transaksi</div></div>
        <div className="card metric-card"><div className="metric-label">Produk terjual</div><div className="metric-value">{sum.items}<small> pcs</small></div><div className="metric-note">sesuai filter</div></div>
        {PAY_METHODS.map((m) => (<div className="card metric-card" key={m.id}><div className="metric-label">{m.label}</div><div className="metric-value">{rp(sum.byMethod[m.id] || 0)}</div><div className="metric-note">sesuai filter</div></div>))}
      </div>

      <section className="card">
        <div className="module-card-title"><div><h3>Filter</h3><p>Pilih tanggal dan metode pembayaran.</p></div></div>
        <div className="filter-row">
          <div className="gudang-form"><div><label>Tanggal</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div></div>
          <div className="gudang-form"><div><label>Metode</label><select value={method} onChange={(e) => setMethod(e.target.value)}><option>Semua</option>{PAY_METHODS.map((m) => <option key={m.id}>{m.id}</option>)}</select></div></div>
          <button type="button" className="pill" onClick={() => { setDate(""); setMethod("Semua"); }}>Tampilkan semua tanggal</button>
        </div>
      </section>

      <section className="card">
        <div className="module-card-title"><div><h3>Rekap per produk</h3><p>Jumlah dan nilai penjualan tiap produk.</p></div></div>
        <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Produk</th><th>Harga</th><th>Terjual</th><th>Nilai</th></tr></thead>
          <tbody>
            {recap.length === 0 && <tr><td colSpan={4} className="empty-cell">Belum ada penjualan pada filter ini.</td></tr>}
            {products.filter((p) => sum.byProduct[p.id]).map((p) => (<tr key={p.id}><td><b>{shortName(p.name)}</b></td><td>{rp(p.price)}</td><td>{sum.byProduct[p.id].qty} pcs</td><td><b>{rp(sum.byProduct[p.id].total)}</b></td></tr>))}
          </tbody>
        </table></div>
      </section>

      <section className="card">
        <div className="module-card-title"><div><h3>Daftar transaksi</h3><p>{list.length} transaksi.</p></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Tanggal</th><th>Jam</th><th>No. transaksi</th><th>Barang</th><th>Total</th><th>Metode</th><th>Referensi</th><th>Kasir</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={8} className="empty-cell">Belum ada transaksi.</td></tr>}
            {list.slice(0, 200).map((t) => (
              <tr key={t.id}><td>{t.date}</td><td>{hhmm(t.ts)}</td><td><b>{t.id}</b></td><td>{t.items.map((i) => `${i.qty}× ${shortName(i.name)}`).join(", ")}</td><td><b>{rp(t.total)}</b></td><td>{t.method}</td><td>{t.ref || "-"}</td><td>{t.by}</td></tr>
            ))}
          </tbody>
        </table></div>
      </section>
    </>
  );
}
