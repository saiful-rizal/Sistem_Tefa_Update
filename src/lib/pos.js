// ============================================================
// Bantuan untuk Kasir POS, kapasitas produksi, dan alokasi biaya.
// ============================================================
import { MATERIAL_MIX_RATIO, CAPACITY_RULES } from "./roles.js";

export const PAY_METHODS = [
  { id: "Tunai", label: "Tunai", hint: "Terima uang, hitung kembalian otomatis" },
  { id: "QRIS", label: "QRIS", hint: "Pelanggan scan kode, lalu konfirmasi" },
  { id: "Transfer", label: "Transfer", hint: "Pelanggan transfer bank, isi nomor referensi" },
];

export const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const dayName = (d = new Date()) => DAY_NAMES[d.getDay()];
export const pad2 = (n) => String(n).padStart(2, "0");
export const ymd = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const hhmm = (iso) => { const d = new Date(iso); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };

// Kapasitas produksi per hari menurut mode yang dipilih Admin Utama.
// rutin = 10–15 kg (dipakai pada Senin & Kamis), penuh = 25 kg.
export function capacityOf(params) {
  const R = CAPACITY_RULES;
  const mode = params && params.kapasitasMode === "penuh" ? "penuh" : "rutin";
  if (mode === "penuh") return { mode, min: 1, max: R.fullKg, label: `Penuh ${R.fullKg} kg` };
  return { mode, min: R.routineKgMin, max: R.routineKgMax, label: `Rutin ${R.routineKgMin}–${R.routineKgMax} kg` };
}

// Hari produksi rutin (Senin & Kamis) dalam bulan berjalan.
export function productionDaysOfMonth(date = new Date()) {
  const y = date.getFullYear(), m = date.getMonth();
  const out = [];
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    const dt = new Date(y, m, d);
    if (CAPACITY_RULES.routineDays.includes(dayName(dt))) out.push(dt);
  }
  return out;
}

// Pembagian biaya resep (persen): 60 utama, 20 penunjang, 10 isian, 10 overhead.
export const COST_SPLIT = [
  { key: "utama", label: "Bahan utama", pct: MATERIAL_MIX_RATIO.utama ?? 60, note: "Tepung, air, ragi, garam" },
  { key: "penunjang", label: "Bahan penunjang", pct: MATERIAL_MIX_RATIO.penunjang ?? 20, note: "Margarin, gula, telur, improver" },
  { key: "isian", label: "Isian", pct: MATERIAL_MIX_RATIO.isian ?? 10, note: "Coklat, meses, kacang, susu" },
  { key: "overhead", label: "Overhead", pct: MATERIAL_MIX_RATIO.lain ?? 10, note: "Listrik, gas, gaji, kemasan" },
];

// Ringkasan penjualan dari daftar transaksi.
export function summarize(trx) {
  const out = { count: 0, total: 0, items: 0, byMethod: { Tunai: 0, QRIS: 0, Transfer: 0 }, byProduct: {} };
  trx.forEach((t) => {
    out.count += 1;
    out.total += t.total;
    out.byMethod[t.method] = (out.byMethod[t.method] || 0) + t.total;
    t.items.forEach((i) => {
      out.items += i.qty;
      const b = out.byProduct[i.productId] || { name: i.name, qty: 0, total: 0 };
      b.qty += i.qty; b.total += i.qty * i.price;
      out.byProduct[i.productId] = b;
    });
  });
  return out;
}
