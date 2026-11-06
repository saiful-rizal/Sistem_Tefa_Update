import React from "react";
import Icon from "./Icon.jsx";
import { rp } from "../lib/format.js";

export default function NotificationPanel({ onClose, onAction, res, lowStockCount, materials, coverage }) {
  const critNames = (materials || [])
    .filter((m) => {
      const c = (coverage || {})[m.id];
      return c && (c.status === "Kritis" || c.status === "Habis");
    })
    .map((m) => m.name);
  const items = [
    ...(critNames.length > 0
      ? [
          {
            icon: "box",
            title: critNames.length + " bahan perlu restock",
            detail: critNames.slice(0, 3).join(", ") + (critNames.length > 3 ? "…" : "") + " di bawah minimum.",
            time: "live dari Gudang",
            target: "Bahan Baku",
            tone: "warn",
          },
        ]
      : []),
    {
      icon: "receipt",
      title: "Pesanan ORD-001 diproses",
      detail: "Deadline besok pukul 09:00 WIB.",
      time: "18 menit lalu",
      target: "Pesanan",
      tone: "info",
    },
    {
      icon: "target",
      title: "Solver " + (res && res.status === "Optimal" ? "optimal" : "perlu perhatian"),
      detail: res ? "Laba " + rp(res.profit) + " • bottleneck " + res.bottleneck : "—",
      time: "live",
      target: "Optimasi",
      tone: res && res.status === "Optimal" ? "ok" : "warn",
    },
  ];
  return (
    <div className="notification-panel" role="dialog" aria-label="Notifikasi">
      <div className="notification-head">
        <div><strong>Notifikasi</strong><span>{items.length} pembaruan untuk Anda</span></div>
        <button className="text-btn" onClick={onClose}>Tutup</button>
      </div>
      {items.map((item) => (
        <button className="notification-item" key={item.title} onClick={() => onAction(item.target)}>
          <span className={"notification-icon " + item.tone}><Icon name={item.icon} size={15} /></span>
          <span className="notification-copy">
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
            <small>{item.time}</small>
          </span>
          <Icon name="arrowR" size={14} />
        </button>
      ))}
      <button
        className="notification-footer"
        onClick={() => {
          onClose();
          onAction("Bantuan");
        }}
      >
        Lihat panduan notifikasi <Icon name="arrowR" size={14} />
      </button>
    </div>
  );
}
