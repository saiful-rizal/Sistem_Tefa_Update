import React from "react";
import { USERS, ROLES } from "../lib/roles.js";

export default function Login({ onLogin }) {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <section className="login-panel">
          <div className="login-brand">
            <b>TEFA Bakery</b>
            <span>Sistem Optimasi Modal, Produksi & Laba</span>
          </div>
          <div className="login-demo">
            <b>Pilih dan klik akun demo</b>
            {USERS.map((u) => (
              <button key={u.username} type="button" className="pill" onClick={() => onLogin(u)}>
                <span>{ROLES[u.role].label}</span>
                <small>{u.username}</small>
              </button>
            ))}
          </div>
          <small className="login-footer">Akses aplikasi sesuai peran akun yang dipilih.</small>
        </section>
        <section className="login-showcase" aria-label="Informasi TEFA Bakery">
          <div className="login-art" aria-hidden="true">
            <div className="login-orbit login-orbit-one" />
            <div className="login-orbit login-orbit-two" />
            <div className="login-diamond login-diamond-one" />
            <div className="login-diamond login-diamond-two" />
            <div className="login-laptop">
              <div className="login-screen">
                <div className="login-screen-sidebar" />
                <div className="login-screen-content">
                  <i /><i /><i />
                  <span /><span /><span />
                </div>
              </div>
              <div className="login-laptop-base" />
            </div>
          </div>
          <div className="login-showcase-copy">
            <b>Kelola TEFA Bakery</b>
            <span>Produksi, persediaan, dan penjualan dalam satu sistem.</span>
          </div>
        </section>
      </div>
    </div>
  );
}
