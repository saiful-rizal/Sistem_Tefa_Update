import React, { useState } from "react";
import Icon from "./Icon.jsx";
import QuickAdd from "./QuickAdd.jsx";
import { ORDERS as ORDERS_DEFAULT } from "../lib/solver.js";

export default function OrdersCard({ orders, materials, onAddLog, onAddOrder, onUpdateOrderStatus, showAdd = true }) {
  const list = orders || ORDERS_DEFAULT;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Semua");
  const [filterOpen, setFilterOpen] = useState(false);
  const rows = list.filter(
    (o) => (o.act + " " + o.id).toLowerCase().includes(q.toLowerCase()) && (status === "Semua" || o.status === status)
  );
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <div>
          <h3>Pesanan &amp; Aktivitas Terbaru</h3>
          <div className="sub">Pesanan khusus otomatis menjadi constraint minimum (X &gt;= Dmin) pada solver</div>
        </div>
        <div className="right table-tools">
          {onAddOrder && showAdd && (
            <QuickAdd materials={materials || []} onAddLog={onAddLog} onAddOrder={onAddOrder} preset="pesanan" />
          )}
          <div className="tsearch">
            <Icon name="search" size={14} />
            <input placeholder="Cari pesanan..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="filter-wrap">
            <button className="pill" onClick={() => setFilterOpen((v) => !v)}>
              Filter: {status} <Icon name="filter" size={13} />
            </button>
            {filterOpen && (
              <div className="filter-menu">
                {["Semua", "Menunggu", "Diproses", "Selesai", "Dibatalkan"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setStatus(item);
                      setFilterOpen(false);
                    }}
                    className={status === item ? "selected" : ""}
                  >
                    {item}
                    <span>{item === "Semua" ? list.length : list.filter((o) => o.status === item).length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Aktivitas</th>
            <th>Order ID</th>
            <th>Jumlah</th>
            <th>Pembayaran</th>
            <th>Pencatatan</th>
            <th>Deadline</th>
            <th>Status</th>
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td>
                <div className="act">
                  <div className="act-ico" style={{ background: o.tint }}>
                    <Icon name={o.act.includes("Kering") ? "cookie" : "bread"} size={15} />
                  </div>
                  <div>
                    <div className="act-name">{o.act}</div>
                    <div className="act-sub">{o.sub}</div>
                  </div>
                </div>
              </td>
              <td style={{ fontWeight: 600 }}>{o.id}</td>
              <td style={{ fontWeight: 600 }}>{o.qty} unit</td>
              <td><span className={"chip-status " + (o.paymentMethod === "QRIS" ? "ok" : o.paymentMethod === "Transfer" ? "process" : "wait")}><span className="dot"></span>{o.paymentMethod || "-"}</span></td>
              <td>{o.recordingMethod || "-"}</td>
              <td>{o.deadline}</td>
              <td>
                {onUpdateOrderStatus ? (
                  <select className="order-status-select" aria-label={`Status ${o.id}`} value={o.status} onChange={(e) => onUpdateOrderStatus(o.id, e.target.value)}>
                    {["Menunggu", "Diproses", "Selesai", "Dibatalkan"].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                ) : <span className={"st " + o.st}><span className="dot"></span>{o.status}</span>}
              </td>
              <td>
                <button
                  className="dots-btn"
                  aria-label={"Detail " + o.id}
                  onClick={() => window.alert(o.id + " - " + o.act + "\nJumlah: " + o.qty + " unit\nPembayaran: " + (o.paymentMethod || "-") + "\nPencatatan: " + (o.recordingMethod || "-") + "\nDeadline: " + o.deadline + "\nStatus: " + o.status)}
                >
                  <Icon name="dots" size={16} />
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", color: "var(--faint)", padding: 22 }}>
                Tidak ada pesanan yang cocok.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
