import React, { useState } from "react";
import Icon from "./Icon.jsx";
import { USERS, ROLES } from "../lib/roles.js";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const u = USERS.find((x) => x.username === username.trim() && x.password === password);
    if (!u) return setError("Username atau kata sandi salah.");
    onLogin(u);
  };
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand"><b>TEFA Bakery</b><span>Sistem Optimasi Modal, Produksi & Laba</span></div>
        <form onSubmit={submit} className="gudang-form">
          <div><label>Username</label><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin.utama / admin.produksi / kasir" autoFocus /></div>
          <div><label>Kata sandi</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <div className="infeasible">{error}</div>}
          <button className="primary-btn" style={{ justifyContent: "center" }}><Icon name="check" size={14} /> Masuk</button>
        </form>
        <div className="login-demo">
          <b>Akun demo</b>
          {USERS.map((u) => (
            <button key={u.username} type="button" className="pill" onClick={() => { setUsername(u.username); setPassword(u.password); setError(""); }}>
              {ROLES[u.role].label} <small>{u.username}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
