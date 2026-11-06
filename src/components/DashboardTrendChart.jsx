import React from "react";
import { localYmd } from "../lib/stokjadi.js";

export default function DashboardTrendChart({ title, description, records = [], valueOf, unit = "pcs" }) {
  const today = new Date();
  const totals = new Map();
  records.forEach((record) => {
    const value = Number(valueOf(record)) || 0;
    totals.set(record.date, (totals.get(record.date) || 0) + value);
  });

  const data = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index);
    return {
      date: localYmd(date),
      label: date.toLocaleDateString("id-ID", { weekday: "short" }),
      value: totals.get(localYmd(date)) || 0,
    };
  });
  const maxValue = Math.max(1, ...data.map((item) => item.value));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="card dashboard-trend-card">
      <div className="dashboard-trend-head">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="dashboard-trend-total">
          <strong>{total.toLocaleString("id-ID")}</strong>
          <span>{unit} • 7 hari</span>
        </div>
      </div>
      <div className="dashboard-trend-chart" role="img" aria-label={`${title}: ${total.toLocaleString("id-ID")} ${unit} dalam 7 hari terakhir`}>
        {data.map((item) => (
          <div className="dashboard-trend-column" key={item.date} title={`${item.date}: ${item.value.toLocaleString("id-ID")} ${unit}`}>
            <span className="dashboard-trend-value">{item.value.toLocaleString("id-ID")}</span>
            <div className="dashboard-trend-track">
              <div className="dashboard-trend-bar" style={{ height: `${Math.max(3, (item.value / maxValue) * 100)}%` }} />
            </div>
            <span className="dashboard-trend-label">{item.label}</span>
          </div>
        ))}
      </div>
      {total === 0 && <p className="dashboard-trend-empty">Belum ada catatan untuk 7 hari terakhir.</p>}
    </section>
  );
}
