import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { rp, fmtQty } from "../lib/format.js";
import ModalForm from "../components/ModalForm.jsx";

const UNITS = ["kg", "gr", "liter", "ml", "pcs", "butir", "pak"];
const EMPTY = { name: "", unit: "kg", price: "", stock: "", minStock: "", shelfDays: "" };

export default function PengelolaanBahanModule({ materials, products, onAdd, onEdit, onDelete, canFinance = true }) {
  const [f, setF] = useState(EMPTY);
  const [draft, setDraft] = useState({});
  const [q, setQ] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const usedBy = (id) => products.filter((p) => (p.bom[id] || 0) > 0).map((p) => p.name);
  const list = materials.filter((m) => !q || (m.name + m.id).toLowerCase().includes(q.toLowerCase()));
  const low = materials.filter((m) => m.stock < (m.minStock || 0)).length;
  const value = materials.reduce((s, m) => s + m.stock * (m.price || 0), 0);

  const submitAdd = (e) => { e.preventDefault(); if (onAdd(f)) { setF(EMPTY); setOpenAdd(false); } };
  const startEdit = (m) => { setEditId(m.id); setDraft({ name: m.name, unit: m.unit, price: m.price, minStock: m.minStock, shelfDays: m.shelfDays }); setOpenEdit(true); };
  const saveEdit = () => { if (onEdit(editId, draft)) { setEditId(null); setOpenEdit(false); } };
  const d = (k) => (e) => setDraft((x) => ({ ...x, [k]: e.target.value }));
  const u = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Jenis bahan baku</div><div className="metric-value">{materials.length}</div><div className="metric-note">terdaftar di sistem</div></div>
        <div className="card metric-card"><div className="metric-label">Di bawah stok minimum</div><div className="metric-value" style={low ? { color: "var(--red)" } : null}>{low}</div><div className="metric-note">perlu restock</div></div>
        <div className="card metric-card"><div className="metric-label">Nilai persediaan</div><div className="metric-value">{canFinance ? rp(value) : "—"}</div><div className="metric-note">stok × harga satuan</div></div>
        <div className="card metric-card"><div className="metric-label">Dipakai di resep</div><div className="metric-value">{materials.filter((m) => usedBy(m.id).length).length}</div><div className="metric-note">bahan terhubung ke produk</div></div>
      </div>

      <div className="card">
        <div className="module-card-title">
          <div><h3>Tambah bahan baku</h3><p>Setelah ditambah, bahan langsung muncul di daftar dan dapat dipakai pada resep.</p></div>
          <button type="button" className="primary-btn" onClick={() => { setF(EMPTY); setOpenAdd((v) => !v); }}>
            <Icon name="plus" size={14} /> {openAdd ? "Tutup Form" : "Tambah Bahan"}
          </button>
        </div>
        {openAdd && (
          <form className="gudang-form inline-entry-form" onSubmit={submitAdd}>
            <div className="inline-entry-grid">
              <div><label>Nama bahan</label><input value={f.name} onChange={u("name")} placeholder="Contoh Susu Bubuk" required /></div>
              <div><label>Satuan</label><select value={f.unit} onChange={u("unit")}>{UNITS.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label>Harga per satuan (Rp)</label><input type="number" min="0" value={f.price} onChange={u("price")} required /></div>
              <div><label>Stok awal</label><input type="number" min="0" step="0.1" value={f.stock} onChange={u("stock")} placeholder="0" /></div>
              <div><label>Stok minimum</label><input type="number" min="0" step="0.1" value={f.minStock} onChange={u("minStock")} placeholder="0" /></div>
              <div><label>Masa simpan (hari)</label><input type="number" min="1" value={f.shelfDays} onChange={u("shelfDays")} placeholder="90" /></div>
            </div>
            <button className="primary-btn" type="submit"><Icon name="check" size={14} /> Simpan Bahan</button>
          </form>
        )}
      </div>

      <div className="card">
        <div className="module-card-title">
          <div><h3>Daftar bahan baku</h3><p>Ubah data bahan atau hapus bahan yang tidak lagi dipakai.</p></div>
          <div className="search" style={{ width: 220 }}><Icon name="search" size={14} /><input placeholder="Cari bahan" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Kode</th><th>Nama bahan</th><th>Satuan</th><th>Harga</th><th>Stok</th><th>Stok min.</th><th>Masa simpan</th><th>Dipakai di</th><th>Aksi</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--faint)" }}>Tidak ada bahan.</td></tr>}
            {list.map((m) => {
              const used = usedBy(m.id);
              return (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td><b>{m.name}</b></td>
                  <td>{m.unit}</td>
                  <td>{canFinance ? rp(m.price) : "—"}</td>
                  <td style={m.stock < (m.minStock || 0) ? { color: "var(--red)", fontWeight: 700 } : null}>{fmtQty(m.stock)} {m.unit}</td>
                  <td>{fmtQty(m.minStock || 0)}</td>
                  <td>{(m.shelfDays || "—") + " hari"}</td>
                  <td>{used.length ? used.join(", ") : <span style={{ color: "var(--faint)" }}>belum dipakai</span>}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="icon-act" onClick={() => startEdit(m)}><Icon name="edit" size={13} /> Ubah</button>{" "}
                    <button className="icon-act danger" onClick={() => { if (window.confirm(`Hapus bahan ${m.name}?`)) onDelete(m.id); }}><Icon name="trash" size={13} /> Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
        {editId && (
          <ModalForm title="Ubah Bahan Baku" desc="Perbarui data bahan baku yang dipilih." onClose={() => { setEditId(null); setOpenEdit(false); }} icon="edit">
            <form className="gudang-form" onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
              <div><label>Nama bahan</label><input value={draft.name || ""} onChange={d("name")} required /></div>
              <div><label>Satuan</label><select value={draft.unit || "kg"} onChange={d("unit")}>{UNITS.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label>Harga per satuan (Rp)</label><input type="number" min="0" value={draft.price || ""} onChange={d("price")} required /></div>
              <div><label>Stok minimum</label><input type="number" min="0" step="0.1" value={draft.minStock || ""} onChange={d("minStock")} placeholder="0" /></div>
              <div><label>Masa simpan (hari)</label><input type="number" min="1" value={draft.shelfDays || ""} onChange={d("shelfDays")} placeholder="90" /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="pill" onClick={() => { setEditId(null); setOpenEdit(false); }}>Batal</button>
                <button className="primary-btn" style={{ flex: 1, justifyContent: "center" }}><Icon name="check" size={14} /> Simpan Perubahan</button>
              </div>
            </form>
          </ModalForm>
        )}
        <div className="formula">Stok tidak diubah di sini. Tambah stok lewat <b>Barang Masuk</b>, kurangi lewat <b>Distribusi Bahan</b>, koreksi lewat <b>Stok Bahan Baku</b>. Bahan yang masih dipakai di resep tidak bisa dihapus.</div>
      </div>
    </>
  );
}
