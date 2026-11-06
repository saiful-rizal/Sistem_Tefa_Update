import React, { useState } from "react";
import { rp } from "../lib/format.js";
import { compareFrequency, groupOf } from "../lib/stokjadi.js";

export default function FrekuensiModule({ stokJadi, products, params, setParam }) {
  const [ovr, setOvr] = useState({});
  const groupCount = (g) => products.filter((p) => groupOf(p) === g).length;
  return (
    <>
      <div className="guide">
        <b>Pertanyaan yang dijawab:</b> kalau satu kali produksi (misalnya 400 pcs) tidak langsung habis, lebih baik produksi <b>sekali</b> atau <b>dua kali</b> seminggu?
        Sistem membandingkan berdasarkan <b>rata-rata penjualan per hari</b> dan <b>masa simpan</b> roti. Hasilnya bisa Anda ubah dengan mengetik angka perkiraan penjualan.
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="module-card-title"><div><h3>Biaya tetap tiap hari produksi</h3><p>Gas oven, listrik, dan tenaga yang keluar setiap kali produksi, berapa pun jumlahnya.</p></div>
          <input className="table-input" type="number" min="0" step="10000" style={{ width: 150 }} value={params.biayaSetup} onChange={(e) => setParam("biayaSetup", Number(e.target.value))} /></div>
      </div>
      {products.map((p) => {
        const c = stokJadi[p.id];
        const auto = c.avg.value != null ? Math.round(c.avg.value) : 0;
        const D = ovr[p.id] != null ? ovr[p.id] : auto;
        const r = compareFrequency({ D, product: p, planQty: c.planQty, setupShare: params.biayaSetup / groupCount(c.group) });
        const days = c.group === "roti" ? ["Senin & Kamis", "Senin"] : ["Selasa & Jumat", "Selasa"];
        const msg = D <= 0 ? "Isi perkiraan penjualan per hari agar perbandingan muncul."
          : r.best.key === "satu" ? `Cukup produksi 1x seminggu (${days[1]}). Roti tahan ${r.shelf} hari, jadi satu kali produksi cukup untuk seminggu dan Anda menghemat biaya produksi.`
          : r.best.key === "dua" ? `Produksi 2x seminggu (${days[0]}) dengan jumlah mengikuti penjualan. Roti hanya tahan ${r.shelf} hari, jadi produksi 1x membuat penjualan hari-hari terakhir hilang.`
          : "Rencana sistem saat ini sudah yang paling menguntungkan.";
        const rencana = r.rows[0];
        return (
          <div className="card" key={p.id} style={{ marginBottom: 16 }}>
            <div className="module-card-title"><div><h3>{p.name}</h3><p>Tahan {r.shelf} hari • terjual rata-rata {c.avg.value != null ? Math.round(c.avg.value) : "-"} pcs/hari{c.avg.value != null && !c.avg.real ? " (perkiraan awal)" : ""}</p></div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Perkiraan terjual/hari <input className="table-input" type="number" min="0" style={{ width: 90 }} value={D} onChange={(e) => setOvr({ ...ovr, [p.id]: Number(e.target.value) })} /></label></div>
            <div className="guide" style={{ background: "#FFF8E6", borderColor: "#F5DFA3", color: "#7A4F01" }}><b>Saran:</b> {msg}</div>
            <div className="data-table-wrap"><table className="data-table" style={{ minWidth: 0 }}>
              <thead><tr><th>Pilihan</th><th>Diproduksi/minggu</th><th>Terjual</th><th>Terbuang</th><th>Tak terlayani</th><th>Laba/minggu</th></tr></thead>
              <tbody>{r.rows.map((x) => (<tr key={x.key} style={x.key === r.best.key ? { background: "var(--green-soft)" } : null}>
                <td><b>{x.label}</b>{x.key === r.best.key && <small style={{ display: "block", color: "var(--green-text)" }}>paling menguntungkan</small>}</td>
                <td>{x.produced} pcs</td><td>{x.sold} pcs</td><td style={x.waste > 0 ? { color: "var(--red)", fontWeight: 700 } : null}>{x.waste} pcs</td><td>{x.unmet} pcs</td><td><b>{rp(x.laba)}</b></td></tr>))}</tbody>
            </table></div>
            {rencana.waste > 0 && <div className="formula">Dengan jumlah tetap seperti rencana, sekitar <b>{rencana.waste} pcs/minggu</b> terbuang (≈ {rp(rencana.waste * p.hpp)}). Gunakan saran produksi di menu Stok Barang Jadi.</div>}
          </div>
        );
      })}
    </>
  );
}
