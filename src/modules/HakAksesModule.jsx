import React from "react";
import Icon from "../components/Icon.jsx";
import { PERMISSIONS, ROLES, USERS } from "../lib/roles.js";

export default function HakAksesModule({ audit }) {
  const groups = [...new Set(PERMISSIONS.map((p) => p.group))];
  const tick = (v) => <span style={{ color: v ? "var(--green-text)" : "var(--faint)", fontWeight: 800 }}>{v ? "✓ Ya" : "— Tidak"}</span>;
  return (
    <>
      <div className="module-grid two" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {Object.values(ROLES).map((r) => (
          <div className="card" key={r.id}>
            <div className="module-card-title"><div><h3>{r.label}</h3><p>{r.tagline}</p></div></div>
            <h4 style={{ fontSize: 12, margin: "6px 0" }}>Tugas & wewenang</h4>
            <ul className="role-list">{r.duties.map((d) => <li key={d}>{d}</li>)}</ul>
            <h4 style={{ fontSize: 12, margin: "10px 0 6px" }}>Pembatasan</h4>
            <ul className="role-list lim">{r.limits.map((d) => <li key={d}>{d}</li>)}</ul>
            <div className="formula">Menu: {r.pages.filter((p) => p !== "Keluar").join(", ")}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="module-card-title"><div><h3>Matriks hak akses</h3><p>Pengecekan dilakukan di setiap tindakan, bukan hanya menyembunyikan menu.</p></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Fungsi</th><th>Admin Utama</th><th>Admin Produksi</th><th>Kasir</th></tr></thead>
          <tbody>{groups.map((g) => (<React.Fragment key={g}><tr><td colSpan={4} style={{ background: "#F4F7FA", fontWeight: 800, fontSize: 11, letterSpacing: 1 }}>{g.toUpperCase()}</td></tr>
            {PERMISSIONS.filter((p) => p.group === g).map((p) => (<tr key={p.id}><td>{p.label}</td><td>{tick(p.utama)}</td><td>{tick(p.produksi)}</td><td>{tick(p.kasir)}</td></tr>))}</React.Fragment>))}</tbody>
        </table></div>
      </div>
      <div className="module-grid two" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
        <div className="card">
          <div className="module-card-title"><div><h3>Akun pengguna</h3><p>Akun demo; sambungkan ke backend untuk produksi.</p></div></div>
          {USERS.map((u) => (<div className="setting-row" key={u.username}><div><strong>{u.name}</strong><span>{u.username}</span></div><span className="chip-status ok"><span className="dot"></span>{ROLES[u.role].label}</span></div>))}
        </div>
        <div className="card">
          <div className="module-card-title"><div><h3>Log aktivitas</h3><p>{audit.length} catatan terakhir, termasuk tindakan yang ditolak.</p></div><button className="pill" onClick={() => window.print()}><Icon name="download" size={13} /> Cetak</button></div>
          <div className="data-table-wrap" style={{ maxHeight: 360, overflowY: "auto" }}><table className="data-table" style={{ minWidth: 0 }}>
            <thead><tr><th>Waktu</th><th>Pengguna</th><th>Aktivitas</th></tr></thead>
            <tbody>{audit.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--faint)" }}>Belum ada aktivitas.</td></tr>}
              {audit.map((a) => (<tr key={a.id}><td style={{ whiteSpace: "nowrap" }}>{new Date(a.ts).toLocaleString("id-ID")}</td><td>{a.user}<small style={{ display: "block", color: "var(--muted)" }}>{a.role}</small></td><td><b style={a.denied ? { color: "var(--red)" } : null}>{a.action}</b><small style={{ display: "block", color: "var(--muted)" }}>{a.detail}</small></td></tr>))}</tbody>
          </table></div>
        </div>
      </div>
    </>
  );
}
