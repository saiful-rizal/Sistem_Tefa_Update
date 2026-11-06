import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { rp, fmtQty } from "../lib/format.js";
import { stockStatusClass } from "../lib/solver.js";

export default function GudangModule({ res, materials, logs, coverage, stockValue, onAddLog, onAddOrder, onSetStock, canFinance = true, canAdjust = true, canIn = true }) {
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">{canFinance ? "Nilai persediaan" : "Jenis bahan"}</div><div className="metric-value">{canFinance ? rp(stockValue) : materials.length}</div><div className="metric-note">{materials.length} jenis bahan</div></div>
        <div className="card metric-card">
          <div className="metric-label">Bahan kritis/habis</div>
          <div className="metric-value">
            {materials.filter((m) => { const c = coverage[m.id]; return c && (c.status === "Kritis" || c.status === "Habis"); }).length}
          </div>
          <div className="metric-note">Di bawah stok minimum</div>
        </div>
        <div className="card metric-card"><div className="metric-label">Bottleneck solver</div><div className="metric-value" style={{ fontSize: 18 }}>{res.bottleneck}</div><div className="metric-note">{res.bottleneckPct}% utilisasi</div></div>
        <div className="card metric-card"><div className="metric-label">Mutasi tercatat</div><div className="metric-value">{logs.length}</div><div className="metric-note">Riwayat gudang</div></div>
      </div>
      <div className="module-grid two">
        <div className="card">
          <div className="module-card-title">
            <div><h3>Prediksi ketahanan &amp; saran beli</h3><p>Dihitung dari rencana optimal hari ini (kebutuhan/hari).</p></div>
          </div>
          <div className="module-list">
            {materials.map((m) => {
              const c = coverage[m.id] || { need: 0, left: m.stock, daysLabel: "—", suggest7: 0, status: "Aman" };
              return (
                <div className="module-list-row" key={m.id}>
                  <div
                    className="row-icon"
                    style={{ background: c.status === "Aman" ? "var(--green-soft)" : c.status === "Waspada" ? "var(--blue-soft)" : "var(--amber-soft)" }}
                  >
                    {m.id.replace("RM", "")}
                  </div>
                  <div className="row-main">
                    <strong>{m.name} — {fmtQty(c.left)} {m.unit}</strong>
                    <span>
                      Butuh {fmtQty(c.need)}/{m.unit}/hari • tahan {c.daysLabel} hari • saran 7hr:{" "}
                      {c.suggest7 > 0.05 ? fmtQty(Math.ceil(c.suggest7 * 10) / 10) + " " + m.unit : "cukup"}
                    </span>
                  </div>
                  <div className="row-end">
                    <span className={"st " + stockStatusClass(c.status)}><span className="dot"></span>{c.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="module-card-title">
          <div><h3>Stok &amp; kebutuhan produksi</h3><p>Klik nilai stok untuk koreksi manual (stock opname). Harga sesuai PDF.</p></div>
          <button className="primary-btn" onClick={() => window.print()}><Icon name="download" size={14} /> Daftar Belanja</button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Bahan</th>{canFinance && <th>Harga</th>}<th>Stok gudang</th><th>Kebutuhan</th><th>Sisa rencana</th><th>Daya tahan</th><th>Status</th></tr></thead>
            <tbody>
              {materials.map((m) => {
                const c = coverage[m.id] || { need: 0, left: m.stock, daysLabel: "—", suggest7: 0, status: "Aman" };
                const need = res.usage[m.id] || 0;
                const left = res.remain[m.id] ?? m.stock;
                return (
                  <tr key={m.id}>
                    <td><b>{m.name}</b><small style={{ display: "block", color: "var(--muted)", marginTop: 3 }}>{m.id} • min {fmtQty(m.minStock || 0)} {m.unit}</small></td>
                    {canFinance && <td>Rp {Number(m.price || 0).toLocaleString("id-ID")}/{m.unit}</td>}
                    <td>
                      {canAdjust && editId === m.id ? (
                        <span style={{ display: "flex", gap: 6 }}>
                          <input
                            type="number" min="0" step="0.1" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                            style={{ width: 80, padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8 }}
                          />
                          <button className="pill" onClick={() => { onSetStock(m.id, editVal); setEditId(null); }}>OK</button>
                        </span>
                      ) : !canAdjust ? (
                        <b>{fmtQty(m.stock)} {m.unit}</b>
                      ) : (
                        <button className="text-btn" style={{ fontWeight: 700 }} title="Klik untuk koreksi" onClick={() => { setEditId(m.id); setEditVal(m.stock); }}>
                          {fmtQty(m.stock)} {m.unit} ✎
                        </button>
                      )}
                    </td>
                    <td>{fmtQty(need)} {m.unit}</td>
                    <td><b>{fmtQty(Math.max(0, left))} {m.unit}</b></td>
                    <td>{c.daysLabel} hari</td>
                    <td><span className={"st " + stockStatusClass(c.status)}><span className="dot"></span>{c.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
