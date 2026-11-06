import React, { useState, useMemo } from "react";
import Icon from "../components/Icon.jsx";
import { rp } from "../lib/format.js";
import { PAY_METHODS, summarize, hhmm, ymd } from "../lib/pos.js";

// QR contoh (bukan QRIS asli): pola deterministik dari nilai total.
function FakeQR({ seed }) {
  const n = 21;
  const cells = [];
  let h = (seed * 2654435761) >>> 0;
  const rnd = () => ((h = (h * 1664525 + 1013904223) >>> 0) / 4294967296);
  const finder = (x, y) => (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let on = rnd() > 0.52;
    if (finder(x, y)) {
      const fx = x < 7 ? x : x - (n - 7), fy = y < 7 ? y : y - (n - 7);
      on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
    }
    if (on) cells.push(<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />);
  }
  return <svg viewBox={`0 0 ${n} ${n}`} className="pos-qr" role="img" aria-label="Contoh kode QRIS"><rect width={n} height={n} fill="#fff" /><g fill="#101828">{cells}</g></svg>;
}

export default function KasirPOSModule({ products, trx, stokJadi, onCheckout, canSell, go }) {
  const [cart, setCart] = useState({});
  const [productSearch, setProductSearch] = useState("");
  const [method, setMethod] = useState("Tunai");
  const [paid, setPaid] = useState("");
  const [ref, setRef] = useState("");
  const [receipt, setReceipt] = useState(null);

  const today = ymd();
  const todayTrx = useMemo(() => trx.filter((t) => t.date === today), [trx, today]);
  const sum = useMemo(() => summarize(todayTrx), [todayTrx]);

  const lines = products.filter((p) => cart[p.id] > 0).map((p) => ({ ...p, qty: cart[p.id] }));
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const paidNum = Number(paid) || 0;
  const change = paidNum - total;
  const add = (id, d = 1) => setCart((c) => { const q = Math.max(0, (c[id] || 0) + d); const n = { ...c }; if (q === 0) delete n[id]; else n[id] = q; return n; });
  const clear = () => { setCart({}); setPaid(""); setRef(""); };

  const readyToPay = lines.length > 0 && canSell && (method !== "Tunai" || (paidNum >= total && total > 0)) && (method !== "Transfer" || ref.trim());
  const pay = () => {
    const rec = onCheckout({ items: lines.map((l) => ({ productId: l.id, qty: l.qty })), method, paid: paidNum, ref });
    if (rec) { setReceipt(rec); clear(); }
  };

  const groups = [
    { title: "Roti", ids: ["PRD01", "PRD02"] },
    { title: "Kue Kering", ids: ["PRD03", "PRD04", "PRD05"] },
  ];
  const quick = [total, 10000, 20000, 50000, 100000].filter((v, i, a) => v > 0 && a.indexOf(v) === i);
  const shortName = (p) => p.name.replace("Roti Kering ", "Kue Kering ");
  const searchTerm = productSearch.trim().toLocaleLowerCase("id-ID");

  return (
    <div className="pos-workspace">
      <div className="pos-summary">
        <div className="card metric-card"><div className="metric-label">Penjualan hari ini</div><div className="metric-value">{rp(sum.total)}</div><div className="metric-note">{sum.count} transaksi tercatat</div></div>
        <div className="card metric-card"><div className="metric-label">Produk terjual</div><div className="metric-value">{sum.items}<small> pcs</small></div><div className="metric-note">semua varian</div></div>
        {PAY_METHODS.map((m) => (
          <div className="card metric-card" key={m.id}><div className="metric-label">{m.label}</div><div className="metric-value">{rp(sum.byMethod[m.id] || 0)}</div><div className="metric-note">hari ini</div></div>
        ))}
      </div>

      <div className="pos-layout">
        <div className="pos-products">
          <label className="pos-search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Cari menu..."
              aria-label="Cari produk"
            />
            {productSearch && <button type="button" onClick={() => setProductSearch("")} aria-label="Hapus pencarian">×</button>}
          </label>
          {groups.map((g) => (
            <section className="card pos-category" key={g.title}>
              <div className="module-card-title"><div><h3>{g.title}</h3><p>Ketuk produk untuk memasukkannya ke keranjang.</p></div></div>
              <div className="pos-tiles">
                {g.ids.map((id) => products.find((p) => p.id === id)).filter((p) => p && shortName(p).toLocaleLowerCase("id-ID").includes(searchTerm)).map((p) => {
                  const fresh = stokJadi && stokJadi[p.id] ? stokJadi[p.id].fresh : 0;
                  const inCart = cart[p.id] || 0;
                  return (
                    <button type="button" key={p.id} className={"pos-tile" + (inCart ? " picked" : "")} onClick={() => add(p.id)} disabled={!canSell}>
                      {inCart > 0 && <span className="pos-count">{inCart}</span>}
                      <span className="pos-tile-ico"><Icon name={g.title === "Roti" ? "bread" : "cookie"} size={28} /></span>
                      <span className="pos-tile-name">{shortName(p)}</span>
                      <span className="pos-tile-gram">{p.id === "PRD05" ? "Toples" : `${p.beratAdonan} g`}</span>
                      <span className="pos-tile-price">{rp(p.price)}</span>
                      <span className={"pos-tile-stock" + (fresh > 0 ? "" : " none")}>{fresh > 0 ? `Stok ${fresh} pcs` : "Stok belum tercatat"}</span>
                    </button>
                  );
                })}
              </div>
              {!g.ids.some((id) => {
                const product = products.find((item) => item.id === id);
                return product && shortName(product).toLocaleLowerCase("id-ID").includes(searchTerm);
              }) && <p className="pos-no-results">{searchTerm ? "Produk tidak ditemukan pada kategori ini." : "Belum ada produk pada kategori ini."}</p>}
            </section>
          ))}
        </div>

        <aside className="card pos-cart">
          <div className="module-card-title"><div><h3>Keranjang</h3><p>{lines.length ? `${lines.reduce((s, l) => s + l.qty, 0)} item` : "Belum ada produk dipilih"}</p></div>
            {lines.length > 0 && <button type="button" className="pill" onClick={clear}>Kosongkan</button>}</div>
          <div className="pos-lines">
            {lines.length === 0 && <div className="pos-empty">Ketuk produk di sebelah kiri untuk mulai menjual.</div>}
            {lines.map((l) => (
              <div className="pos-line" key={l.id}>
                <div className="pos-line-name"><b>{shortName(l)}</b><span>{rp(l.price)} × {l.qty}</span></div>
                <div className="pos-stepper">
                  <button type="button" onClick={() => add(l.id, -1)} aria-label={"Kurangi " + l.name}>−</button>
                  <b>{l.qty}</b>
                  <button type="button" onClick={() => add(l.id, 1)} aria-label={"Tambah " + l.name}>+</button>
                </div>
                <div className="pos-line-sum">{rp(l.qty * l.price)}</div>
              </div>
            ))}
          </div>
          <div className="pos-total"><span>Total bayar</span><b>{rp(total)}</b></div>

          <div className="pos-methods" role="tablist" aria-label="Metode pembayaran">
            {PAY_METHODS.map((m) => (
              <button type="button" role="tab" aria-selected={method === m.id} key={m.id} className={"pos-method" + (method === m.id ? " on" : "")} onClick={() => setMethod(m.id)}>{m.label}</button>
            ))}
          </div>
          <p className="pos-hint">{PAY_METHODS.find((m) => m.id === method).hint}</p>

          {method === "Tunai" && (
            <div className="gudang-form">
              <div><label>Uang diterima (Rp)</label><input type="number" min="0" inputMode="numeric" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="0" /></div>
              <div className="pos-quick">{quick.map((v) => <button type="button" className="pill" key={v} onClick={() => setPaid(String(v))}>{v === total ? "Uang pas" : rp(v)}</button>)}</div>
              <div className={"pos-change" + (paidNum > 0 && change < 0 ? " bad" : "")}>{paidNum > 0 && change < 0 ? `Kurang ${rp(-change)}` : `Kembalian ${rp(Math.max(0, change))}`}</div>
            </div>
          )}
          {method === "QRIS" && (
            <div className="pos-qr-wrap"><FakeQR seed={total + 7} /><p>Contoh tampilan. Hubungkan ke penyedia QRIS asli untuk kode yang sebenarnya, lalu tekan Bayar setelah uang masuk.</p></div>
          )}
          {method === "Transfer" && (
            <div className="gudang-form">
              <div className="pos-bank">Rekening tujuan: isi di menu Pengaturan</div>
              <div><label>Nomor referensi / nama pengirim</label><input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Contoh: Budi — BCA 14.32" /></div>
            </div>
          )}

          <button type="button" className="primary-btn pos-pay" disabled={!readyToPay} onClick={pay}><Icon name="check" size={20} /> Bayar sekarang</button>
          {!canSell && <p className="pos-hint">Hanya Kasir yang dapat menjual. Anda dapat melihat rekapnya.</p>}
        </aside>
      </div>

      <section className="card">
        <div className="module-card-title"><div><h3>Transaksi hari ini</h3><p>{todayTrx.length} transaksi tercatat. Tabel ini bertambah otomatis setiap kali ada pembayaran.</p></div>
          <button type="button" className="pill" onClick={() => go("Riwayat Penjualan")}>Lihat semua riwayat</button></div>
        <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
          <thead><tr><th>Jam</th><th>No. transaksi</th><th>Barang</th><th>Total</th><th>Bayar</th><th>Kasir</th></tr></thead>
          <tbody>
            {todayTrx.length === 0 && <tr><td colSpan={6} className="empty-cell">Belum ada transaksi hari ini.</td></tr>}
            {todayTrx.slice(0, 15).map((t) => (
              <tr key={t.id}><td>{hhmm(t.ts)}</td><td><b>{t.id}</b></td><td>{t.items.map((i) => `${i.qty}× ${i.name.replace("Roti Kering ", "Kue Kering ")}`).join(", ")}</td><td><b>{rp(t.total)}</b></td><td><span className={"chip-status " + (t.method === "Tunai" ? "ok" : t.method === "QRIS" ? "info" : "warn")}><span className="dot"></span>{t.method}</span></td><td>{t.by}</td></tr>
            ))}
          </tbody>
        </table></div>
      </section>

      {receipt && (
        <div className="modal-backdrop" onMouseDown={() => setReceipt(null)}>
          <div className="help-modal receipt" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="receipt-body" id="struk">
              <div className="receipt-ok"><Icon name="check" size={30} /></div>
              <h2>Pembayaran berhasil</h2>
              <p className="receipt-id">{receipt.id} • {hhmm(receipt.ts)}</p>
              <div className="receipt-lines">
                {receipt.items.map((i) => <div key={i.productId}><span>{i.qty}× {i.name.replace("Roti Kering ", "Kue Kering ")}</span><b>{rp(i.qty * i.price)}</b></div>)}
              </div>
              <div className="receipt-lines tot">
                <div><span>Total</span><b>{rp(receipt.total)}</b></div>
                <div><span>Metode</span><b>{receipt.method}</b></div>
                {receipt.method === "Tunai" && <><div><span>Diterima</span><b>{rp(receipt.paid)}</b></div><div><span>Kembalian</span><b>{rp(receipt.change)}</b></div></>}
                {receipt.ref && <div><span>Referensi</span><b>{receipt.ref}</b></div>}
              </div>
              {receipt.noStock && <p className="pos-hint">Catatan: stok barang jadi belum tercatat untuk sebagian item. Minta Admin Produksi menyelesaikan batch produksi.</p>}
            </div>
            <div className="receipt-actions">
              <button type="button" className="pill" onClick={() => window.print()}>Cetak struk</button>
              <button type="button" className="primary-btn" onClick={() => setReceipt(null)}>Transaksi baru</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
