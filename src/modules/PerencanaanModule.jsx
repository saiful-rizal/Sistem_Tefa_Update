import React, { useMemo } from "react";
import Icon from "../components/Icon.jsx";
import { rp, fmtQty } from "../lib/format.js";
import { scenarios, WEEKS } from "../lib/planner.js";

export default function PerencanaanModule({ demandCaps = {}, plan, params, setParam, products, materials, approved, onApprove, onRevoke, go }) {
  const sc = useMemo(() => scenarios(params, products, materials), [params, products, materials]);
  const m = plan.monthly;
  const isApproved = approved && approved.status === "approved";
  const stale = isApproved && approved.snapshot && (approved.snapshot.modal !== plan.modal || approved.snapshot.monthly.profit !== plan.monthly.profit);
  const pct = (v) => Math.round(v * 100) + "%";

  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Modal bulanan</div><div className="metric-value">{rp(plan.modal)}</div><div className="metric-note">{WEEKS} minggu • 16 siklus produksi</div></div>
        <div className="card metric-card"><div className="metric-label">Prediksi omzet penjualan</div><div className="metric-value">{rp(m.revenue)}</div><div className="metric-note">{m.units.toLocaleString("id-ID")} unit terjual</div></div>
        <div className="card metric-card"><div className="metric-label">Laba maksimal</div><div className="metric-value" style={{ color: "var(--green-text)" }}>{rp(m.profit)}</div><div className="metric-note">Margin {pct(plan.margin || 0)} • ROI {pct(plan.roi || 0)}</div></div>
        <div className="card metric-card"><div className="metric-label">Belanja bahan baku</div><div className="metric-value">{rp(plan.belanja || 0)}</div><div className="metric-note">Sudah dikurangi stok & ditambah stok pengaman</div></div>
      </div>

      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title">
            <div><h3>1. Input modal & kapasitas</h3><p>Ubah angka, seluruh rencana di bawah dihitung ulang otomatis.</p></div>
            <span className={"chip-status " + (plan.status === "Optimal" ? "ok" : "err")}><span className="dot"></span>Solver {plan.status}</span>
          </div>
          <div className="plan-inputs">
            <label>Modal bulanan (Rp)
              <input type="number" min="0" step="500000" value={params.modalBulanan} onChange={(e) => setParam("modalBulanan", Number(e.target.value))} />
            </label>
            <input type="range" min="3000000" max="60000000" step="500000" value={params.modalBulanan} onChange={(e) => setParam("modalBulanan", Number(e.target.value))} style={{ width: "100%" }} />
            <div className="plan-row3">
              <label>Oven (jam/hari)<input type="number" min="1" step="0.5" value={params.ovenJam} onChange={(e) => setParam("ovenJam", Number(e.target.value))} /></label>
              <label>Mixer (jam/hari)<input type="number" min="1" step="0.5" value={params.mixerJam} onChange={(e) => setParam("mixerJam", Number(e.target.value))} /></label>
              <label>SDM (jam kerja/hari)<input type="number" min="1" step="1" value={params.sdmJam} onChange={(e) => setParam("sdmJam", Number(e.target.value))} /></label>
            </div>
            <label>Pesanan khusus Roti Manis minimum per siklus (unit)
              <input type="number" min="0" step="5" value={params.orderMin} onChange={(e) => setParam("orderMin", Number(e.target.value))} />
            </label>
          </div>
          <label className="chk"><input type="checkbox" checked={!!params.useDemand} disabled={!Object.values(demandCaps).some((c) => c && c.real)} onChange={(e) => setParam("useDemand", e.target.checked)} /> Batasi produksi sesuai penjualan nyata</label>
          <div className="formula" style={{ marginTop: 6 }}>{Object.values(demandCaps).some((c) => c && c.real) ? Object.values(demandCaps).filter(Boolean).map((c) => `${c.name} ≤ ${c.cap} pcs/siklus`).join(" • ") : "Aktif setelah ada catatan penjualan di menu Stok Barang Jadi."}</div>
          {plan.status !== "Optimal" && <div className="infeasible">{plan.reason}</div>}
          {plan.belanjaMelebihiModal && <div className="infeasible" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>Perkiraan belanja bahan baku melebihi modal bulanan. Tambah modal atau kurangi stok pengaman.</div>}
        </div>

        <div className="card">
          <div className="module-card-title"><div><h3>Status rencana</h3><p>Admin Produksi hanya bekerja dari rencana yang disetujui.</p></div>
            <span className={"chip-status " + (isApproved ? "ok" : "warn")}><span className="dot"></span>{isApproved ? "Disetujui" : "Draft"}</span></div>
          {isApproved ? (
            <div className="formula" style={{ marginTop: 0 }}>
              Disetujui oleh <b>{approved.approvedBy}</b> pada {new Date(approved.approvedAt).toLocaleString("id-ID")}.<br />
              Modal terkunci {rp(approved.snapshot.modal)} • Laba {rp(approved.snapshot.monthly.profit)}.
              {stale && <><br /><b style={{ color: "var(--amber)" }}>Input sudah berubah dari versi yang disetujui.</b> Terbitkan ulang agar Admin Produksi memakai angka terbaru.</>}
            </div>
          ) : (
            <div className="formula" style={{ marginTop: 0 }}>Rencana masih draft. Admin Produksi belum melihat perintah kerja bulan ini.</div>
          )}
          <div className="module-actions" style={{ marginTop: 14, flexWrap: "wrap" }}>
            <button className="primary-btn" disabled={plan.status !== "Optimal"} onClick={onApprove}><Icon name="check" size={14} /> {isApproved ? "Terbitkan ulang" : "Setujui & terbitkan"}</button>
            {isApproved && <button className="pill" onClick={onRevoke}>Tarik rencana</button>}
            <button className="pill" onClick={() => go("Pengajuan Bahan")}>Lihat pengajuan bahan</button>
          </div>
        </div>
      </div>

      {plan.status === "Optimal" && (
        <>
          <div className="module-grid two">
            <div className="card">
              <div className="module-card-title"><div><h3>2. Alokasi modal otomatis</h3><p>Solver mencari pembagian modal terbaik antara siklus roti dan siklus kering.</p></div></div>
              <div className="split-bar"><div style={{ width: plan.split.rotiPct + "%" }}>Roti {plan.split.rotiPct}%</div><div style={{ width: 100 - plan.split.rotiPct + "%" }} className="k">Kering {100 - plan.split.rotiPct}%</div></div>
              <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
                <thead><tr><th>Kelompok</th><th>Hari</th><th>Modal/bulan</th><th>Modal/siklus</th></tr></thead>
                <tbody>
                  <tr><td><b>Roti Manis + Tawar</b></td><td>Senin & Kamis</td><td>{rp(plan.split.roti)}</td><td>{rp(plan.split.perCycleRoti)}</td></tr>
                  <tr><td><b>Roti Kering</b></td><td>Selasa & Jumat</td><td>{rp(plan.split.kering)}</td><td>{rp(plan.split.perCycleKering)}</td></tr>
                </tbody></table></div>
              <div className="formula"><b>Faktor pembatas:</b> {plan.bottleneck.name} ({plan.bottleneck.pct}%). Sisa modal tidak terpakai {rp(plan.sisaModal)}.</div>
            </div>
            <div className="card">
              <div className="module-card-title"><div><h3>Proyeksi keuangan bulanan</h3><p>Dampak langsung ke penjualan dan laba.</p></div></div>
              {[["Omzet penjualan", rp(m.revenue)], ["Biaya produksi (HPP)", rp(m.hpp)], ["— Bahan baku (resep)", rp(plan.bahanTerpakai)], ["— Tenaga, energi & lain-lain", rp(plan.overhead)], ["Laba bersih", rp(m.profit)], ["Sisa kas modal", rp(plan.sisaModal)]].map((x) => (
                <div className="setting-row" key={x[0]}><div><strong>{x[0]}</strong></div><b>{x[1]}</b></div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="module-card-title"><div><h3>3. Rencana produksi & penjualan</h3><p>Hasil optimasi MILP: jumlah per siklus dikalikan 8 siklus.</p></div></div>
            <div className="data-table-wrap"><table className="data-table">
              <thead><tr><th>Produk</th><th>Hari produksi</th><th>Per siklus</th><th>Per bulan</th><th>Omzet</th><th>HPP</th><th>Laba</th></tr></thead>
              <tbody>{plan.perProduct.map((p) => (<tr key={p.id}><td><b>{p.name}</b></td><td>{p.days}</td><td>{p.perCycle} unit</td><td><b>{p.monthly.toLocaleString("id-ID")} unit</b></td><td>{rp(p.revenue)}</td><td>{rp(p.hpp)}</td><td><b>{rp(p.profit)}</b></td></tr>))}</tbody>
            </table></div>
          </div>

          <div className="card">
            <div className="module-card-title"><div><h3>4. Daftar belanja bahan baku</h3><p>Kebutuhan resep sebulan dikurangi stok gudang, ditambah stok pengaman. Bahan cepat rusak dibeli mingguan.</p></div>
              <button className="pill" onClick={() => window.print()}><Icon name="download" size={14} /> Cetak</button></div>
            <div className="data-table-wrap"><table className="data-table">
              <thead><tr><th>Bahan</th><th>Kebutuhan bulan</th><th>Stok kini</th><th>Stok pengaman</th><th>Perlu dibeli</th><th>Harga</th><th>Biaya</th><th>Jadwal beli</th></tr></thead>
              <tbody>
                {plan.shopping.map((s) => (<tr key={s.id}><td><b>{s.name}</b></td><td>{fmtQty(s.need)} {s.unit}</td><td>{fmtQty(s.stock)} {s.unit}</td><td>{fmtQty(s.safety)} {s.unit}</td><td><b>{fmtQty(s.buy)} {s.unit}</b></td><td>{rp(s.price)}/{s.unit}</td><td>{rp(s.cost)}</td><td>{s.freq}{s.perWeek ? <small style={{ display: "block", color: "var(--muted)" }}>{fmtQty(s.perWeek)} {s.unit} per minggu</small> : null}</td></tr>))}
                <tr><td colSpan={6}><b>Total belanja</b></td><td colSpan={2}><b>{rp(plan.belanja)}</b></td></tr>
              </tbody>
            </table></div>
          </div>

          <div className="module-grid two">
            <div className="card">
              <div className="module-card-title"><div><h3>5. Kalender produksi {WEEKS} minggu</h3><p>Senin & Kamis roti; Selasa & Jumat kue kering.</p></div></div>
              <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
                <thead><tr><th>Minggu</th><th>Hari</th><th>Perintah produksi</th><th>Omzet</th></tr></thead>
                <tbody>{plan.days.map((d, i) => (<tr key={i}><td>{d.week}</td><td>{d.day}</td><td>{d.items.map((it) => `${it.qty} ${it.name}`).join(" • ")}</td><td>{rp(d.revenue)}</td></tr>))}</tbody>
              </table></div>
            </div>
            <div className="card">
              <div className="module-card-title"><div><h3>6. Prediksi: jika modal berubah</h3><p>Bandingkan skenario modal terhadap penjualan dan laba.</p></div></div>
              <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
                <thead><tr><th>Modal</th><th>Unit</th><th>Omzet</th><th>Laba</th><th>ROI</th></tr></thead>
                <tbody>{sc.map((s) => (<tr key={s.factor} style={s.factor === 1 ? { background: "var(--green-soft)" } : null}><td><b>{rp(s.modal)}</b>{s.factor === 1 && <small style={{ display: "block" }}>saat ini</small>}</td><td>{s.status === "Optimal" ? s.units.toLocaleString("id-ID") : "—"}</td><td>{s.status === "Optimal" ? rp(s.revenue) : "—"}</td><td><b>{s.status === "Optimal" ? rp(s.profit) : "tidak layak"}</b></td><td>{s.status === "Optimal" ? pct(s.roi) : "—"}</td></tr>))}</tbody>
              </table></div>
              <div className="formula">Jika laba berhenti naik meski modal ditambah, pembatasnya adalah kapasitas atau permintaan (Dmax), bukan modal.</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
