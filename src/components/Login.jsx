import React from "react";
import { USERS, ROLES } from "../lib/roles.js";

export default function Login({ onLogin }) {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand"><b>TEFA Bakery</b><span>Sistem Optimasi Modal, Produksi & Laba</span></div>
        <div className="login-demo">
          <b>Pilih dan klik akun demo</b>
          {USERS.map((u) => (
            <button key={u.username} type="button" className="pill" onClick={() => onLogin(u)}>
              {ROLES[u.role].label} <small>{u.username}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
