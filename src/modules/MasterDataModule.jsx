import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import ModalForm from "../components/ModalForm.jsx";
import { rp } from "../lib/format.js";
import { shelfOf } from "../lib/stokjadi.js";

const numInp = { width: 84, padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8 };

export default function MasterDataModule({ products, materials, onProduct, onBom }) {
  const [openEdit, setOpenEdit] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [editVals, setEditVals] = useState({});

  const startEdit = (p) => {
    setEditProd(p);
    setEditVals({ name: p.name, price: p.price, hpp: p.hpp, oven: p.oven, mixer: p.mixer, sdm: p.sdm, dmax: p.dmax, shelfDays: p.shelfDays });
    setOpenEdit(true);
  };
  const saveEdit = () => {
    if (!editProd) return;
    onProduct(editProd.id, "name", editVals.name);
    ["price", "hpp", "oven", "mixer", "sdm", "dmax", "shelfDays"].forEach((k) => onProduct(editProd.id, k, Number(editVals[k])));
    setOpenEdit(false);
    setEditProd(null);
  };

  return (
    <>
      <div className="card">
        <div className="module-card-title"><div><h3>Produk: harga jual, HPP, dan permintaan maksimum</h3><p>Margin = harga jual − HPP, dihitung otomatis. Perubahan langsung dipakai solver.</p></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Produk</th><th>Harga jual</th><th>HPP</th><th>Margin</th><th>Oven (mnt)</th><th>Mixer (mnt)</th><th>SDM (mnt)</th><th>Dmax/siklus</th><th>Tahan (hari)</th><th>Aksi</th></tr></thead>
          <tbody>{products.map((p) => (<tr key={p.id}>
            <td><b>{p.name}</b><small style={{ display: "block", color: "var(--muted)" }}>{p.id}</small></td>
            {["price", "hpp", null, "oven", "mixer", "sdm", "dmax", "shelfDays"].map((k, i) => k ? <td key={i}><input type="number" min="0" style={numInp} value={k === "shelfDays" ? shelfOf(p) : p[k]} onChange={(e) => onProduct(p.id, k, Number(e.target.value))} /></td> : <td key={i}><b>{rp(p.margin)}</b></td>)}
            <td style={{ whiteSpace: "nowrap" }}><button className="icon-act" onClick={() => startEdit(p)}><Icon name="edit" size={13} /> Ubah</button></td>
          </tr>))}</tbody>
        </table></div>
      </div>

      {openEdit && editProd && (
        <ModalForm title={`Ubah Produk: ${editProd.name}`} desc="Ubah harga jual, HPP, kapasitas, dan batas produksi." onClose={() => { setOpenEdit(false); setEditProd(null); }} icon="doc">
          <form className="gudang-form" onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
            <div><label>Nama produk</label><input value={editVals.name || ""} required /></div>
            <div className="g-row2">
              <div><label>Harga jual (Rp)</label><input type="number" min="0" value={editVals.price || ""} required /></div>
              <div><label>HPP (Rp)</label><input type="number" min="0" value={editVals.hpp || ""} required /></div>
            </div>
            <div className="g-row2">
              <div><label>Oven (menit/unit)</label><input type="number" min="0" step="0.1" value={editVals.oven || ""} /></div>
              <div><label>Mixer (menit/unit)</label><input type="number" min="0" step="0.1" value={editVals.mixer || ""} /></div>
              <div><label>SDM (menit/unit)</label><input type="number" min="0" step="0.1" value={editVals.sdm || ""} /></div>
            </div>
            <div className="g-row2">
              <div><label>Dmax per siklus</label><input type="number" min="0" value={editVals.dmax || ""} /></div>
              <div><label>Masa simpan (hari)</label><input type="number" min="1" value={editVals.shelfDays || ""} /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="pill" onClick={() => { setOpenEdit(false); setEditProd(null); }}>Batal</button>
              <button className="primary-btn" style={{ flex: 1, justifyContent: "center" }}><Icon name="check" size={14} /> Simpan Perubahan</button>
            </div>
          </form>
        </ModalForm>
      )}

      <div className="card">
        <div className="module-card-title"><div><h3>Resep (BOM): bahan per 1 unit produk</h3><p>Dasar perhitungan kebutuhan bahan baku bulanan.</p></div></div>
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Bahan</th>{products.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
          <tbody>{materials.map((m) => (<tr key={m.id}><td><b>{m.name}</b> <small>({m.unit})</small></td>{products.map((p) => (<td key={p.id}><input type="number" min="0" step="0.001" style={numInp} value={p.bom[m.id] || 0} onChange={(e) => onBom(p.id, m.id, Number(e.target.value))} /></td>))}</tr>))}</tbody>
        </table></div>
      </div>
    </>
  );
}
