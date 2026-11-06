import React, { useState, useEffect } from "react";
import Icon from "./Icon.jsx";

// Struktur menu: grup yang bisa dibuka-tutup (dropdown), submenu menjorok.
// Grup dipisah antara Produksi (pelaksanaan) dan Pemasaran (penjualan/pesanan).
const MENU = [
  { id: "Dashboard", icon: "grid" },
  {
    key: "perencanaan", label: "Perencanaan", icon: "wallet",
    items: [
      { id: "Perencanaan Modal", icon: "wallet" },
      { id: "Biaya & Kapasitas", icon: "coins" },
      { id: "Optimasi", icon: "target" },
      { id: "Frekuensi Produksi", icon: "refresh" },
      { id: "Peramalan", icon: "trend" },
    ],
  },
  {
    key: "persediaan", label: "Persediaan", icon: "box",
    items: [
      { id: "Bahan Baku", label: "Stok Bahan Baku", icon: "box" },
      { id: "Pengelolaan Bahan Baku", icon: "list" },
      { id: "Barang Masuk", icon: "in" },
      { id: "Distribusi Bahan", icon: "out" },
      { id: "Pengajuan Bahan", icon: "receipt" },
      { id: "Riwayat Mutasi", icon: "history" },
    ],
  },
  {
    key: "operasional", label: "Operasional", icon: "bread",
    items: [
      { id: "Rencana Produksi", icon: "layers" },
      { id: "Penjadwalan", icon: "layers" },
      { id: "Stok Barang Jadi", icon: "bread" },
      { id: "Proses Produksi", icon: "target" },
      { id: "Pesanan", icon: "receipt" },
      { id: "Kasir POS", icon: "wallet" },
      { id: "Riwayat Penjualan", icon: "history" },
    ],
  },
  {
    key: "analisis", label: "Laporan & Pengaturan", icon: "doc",
    items: [
      { id: "Laporan", label: "Laporan Keuangan", icon: "coins" },
      { id: "Laporan Produksi", icon: "doc" },
      { id: "Master Data", label: "Produk & Resep", icon: "list" },
      { id: "Hak Akses", label: "Hak Akses & Log", icon: "shield" },
      { id: "Pengaturan", icon: "gear" },
    ],
  },
];

// Halaman pendek untuk Kasir (front office) — tidak menampilkan grup penuh.
const KASIR_MENU = [
  { id: "Dashboard", icon: "grid" },
  { id: "Kasir POS", icon: "wallet" },
  { id: "Riwayat Penjualan", icon: "history" },
  { id: "Stok Barang Jadi", icon: "bread" },
  { id: "Pesanan", icon: "receipt" },
  { id: "Bahan Baku", icon: "box" },
];
const BOTTOM = [
  { id: "Bantuan", icon: "help" },
  { id: "Keluar", icon: "logout" },
];

export default function Sidebar({ page, setPage, goParams, lowStockCount, allowedPages, role, badges = {} }) {
  const isKasir = role.id === "kasir";
  const groupOfPage = (p) => (MENU.find((g) => g.items && g.items.some((i) => i.id === p)) || {}).key;
  const [open, setOpen] = useState(() => ({ [groupOfPage(page)]: true }));
  const [q, setQ] = useState("");

  // Grup yang berisi halaman aktif otomatis terbuka
  useEffect(() => {
    const k = groupOfPage(page);
    if (k) setOpen((o) => (o[k] ? o : { ...o, [k]: true }));
  }, [page]);

  const term = q.trim().toLowerCase();
  const match = (it) => !term || (it.label || it.id).toLowerCase().includes(term);

  const link = (it, sub) => (
    <div
      key={it.id}
      className={"nav" + (sub ? " sub" : "") + (page === it.id ? " active" : "")}
      onClick={() => setPage(it.id)}
    >
      <Icon name={it.icon} size={sub ? 15 : 17} />
      {it.label || it.id}
      {badges[it.id] && <span className="nav-badge">{badges[it.id]}</span>}
    </div>
  );

  return (
    <aside className="sidebar">
      <div className="logo">
        <div>
          <div className="logo-name">TEFA Bakery</div>
          <div className="logo-sub">Politeknik Negeri Jember</div>
          <div className="role-badge">{role.label}</div>
        </div>
      </div>
      <div className="search">
        <Icon name="search" size={15} />
        <input placeholder="Cari menu" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="nav-tree">
        {isKasir ? (
          // Kasir: daftar lurus tanpa grup, hanya halaman yang diperlukan
          <div className="nav-group">
            {KASIR_MENU.filter((it) => allowedPages.includes(it.id) && match(it)).map((it) => link(it, false))}
          </div>
        ) : (
          MENU.map((g) => {
            if (!g.items) return allowedPages.includes(g.id) && match(g) ? link(g) : null;
            const items = g.items.filter((it) => allowedPages.includes(it.id) && match(it));
            if (items.length === 0) return null;
            const isOpen = term ? true : !!open[g.key];
            const hasActive = items.some((i) => i.id === page);
            const groupBadge = g.key === "persediaan" && lowStockCount > 0 ? lowStockCount : null;
            return (
              <div key={g.key} className="nav-group">
                <button
                  type="button"
                  className={"nav-group-toggle" + (hasActive ? " has-active" : "")}
                  aria-expanded={isOpen}
                  onClick={() => setOpen((o) => ({ ...o, [g.key]: !o[g.key] }))}
                >
                  <span className="group-label"><Icon name={g.icon} size={16} />{g.label}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {groupBadge && <span className="nav-badge warn">{groupBadge}</span>}
                    <span className={"chev" + (isOpen ? " open" : "")}><Icon name="chevD" size={14} /></span>
                  </span>
                </button>
                {isOpen && <div className="nav-submenu">{items.map((it) => link(it, true))}</div>}
              </div>
            );
          })
        )}
      </div>

      <div className="nav-bottom">{BOTTOM.filter((it) => allowedPages.includes(it.id) && match(it)).map((it) => link(it))}</div>

      <div className="promo">
        <h4>{role.label}</h4>
        <p>{role.tagline}</p>
      </div>
    </aside>
  );
}
