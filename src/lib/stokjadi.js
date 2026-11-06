// ============================================================
// Stok barang jadi, penjualan, masa simpan, rekomendasi produksi,
// dan perbandingan frekuensi produksi (1x vs 2x seminggu).
// Asumsi: roti sisa dijual lagi sampai masa simpannya habis, lalu dibuang (waste).
// ============================================================

export const DEFAULT_SHELF = { PRD01: 3, PRD02: 4, PRD03: 14, PRD04: 14, PRD05: 21 };
export const GROUP_OF = { PRD01: "roti", PRD02: "roti", PRD03: "kering", PRD04: "kering", PRD05: "kering" };
const PROD_DAYS = { roti: [1, 4], kering: [2, 5] };
const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const shelfOf = (p) => Number(p && p.shelfDays) || DEFAULT_SHELF[p && p.id] || 3;
export const groupOf = (p) => GROUP_OF[p && p.id] || "roti";

export const localYmd = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};
export const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 864e5);

export function batchInfo(b, product, today = localYmd()) {
  const shelf = shelfOf(product || { id: b.productId });
  const age = daysBetween(b.date, today);
  return { age, shelf, left: shelf - age, expired: age > shelf };
}

export function stockSummary(batches, products, today = localYmd()) {
  const out = {};
  products.forEach((p) => {
    const items = batches
      .filter((b) => b.productId === p.id && b.remaining > 0)
      .map((b) => ({ ...b, ...batchInfo(b, p, today) }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const fresh = items.filter((i) => !i.expired).reduce((s, i) => s + i.remaining, 0);
    const soon = items.filter((i) => !i.expired && i.left <= 1).reduce((s, i) => s + i.remaining, 0);
    const expiredQty = items.filter((i) => i.expired).reduce((s, i) => s + i.remaining, 0);
    out[p.id] = { items, fresh, soon, expiredQty };
  });
  return out;
}

export function avgDaily(sales, productId, today = localYmd(), windowDays = 14, fallback = null) {
  const rows = sales.filter((s) => s.productId === productId && daysBetween(s.date, today) >= 0 && daysBetween(s.date, today) < windowDays);
  if (rows.length === 0) return { value: fallback, real: false };
  const first = rows.reduce((m, r) => (r.date < m ? r.date : m), rows[0].date);
  const observed = Math.max(1, Math.min(windowDays, daysBetween(first, today) + 1));
  return { value: rows.reduce((s, r) => s + r.qty, 0) / observed, real: true };
}

// Hari produksi berikutnya (>= hari ini) dan lama jeda ke produksi sesudahnya
export function cycleInfo(group, now = new Date()) {
  const days = PROD_DAYS[group] || PROD_DAYS.roti;
  const at = (o) => { const d = new Date(now); d.setDate(d.getDate() + o); return d; };
  let off = 0;
  while (!days.includes(at(off).getDay())) off++;
  let off2 = off + 1;
  while (!days.includes(at(off2).getDay())) off2++;
  return { nextDate: localYmd(at(off)), nextDay: DAY_NAMES[at(off).getDay()], cover: off2 - off, isToday: off === 0 };
}

export function recommend(avg, shelf, cover, stockAt) {
  const sellDays = Math.min(cover, shelf);
  const target = Math.ceil(avg * sellDays);
  return { sellDays, target, rekom: Math.max(0, target - stockAt) };
}

const planQtyOf = (snap, pid) => (!snap ? null : pid === "PRD01" ? snap.cycle.roti.x1 : pid === "PRD02" ? snap.cycle.roti.x2 : pid === "PRD03" ? snap.cycle.kering.x3 : null);

export function overview({ products, batches, sales, approved, now = new Date() }) {
  const today = localYmd(now);
  const snap = approved && approved.status === "approved" ? approved.snapshot : null;
  const sum = stockSummary(batches, products, today);
  const out = {};
  products.forEach((p) => {
    const g = groupOf(p);
    const planQty = planQtyOf(snap, p.id);
    const avg = avgDaily(sales, p.id, today, 14, planQty != null ? (planQty * 2) / 7 : null);
    const cyc = cycleInfo(g, now);
    const daysUntil = daysBetween(today, cyc.nextDate);
    const stockAt = sum[p.id].items.filter((i) => !i.expired && i.left >= daysUntil).reduce((s, i) => s + i.remaining, 0);
    const rec = avg.value != null ? recommend(avg.value, shelfOf(p), cyc.cover, stockAt) : null;
    out[p.id] = { ...sum[p.id], product: p, group: g, planQty, avg, cycle: cyc, daysUntil, stockAt, rec, shelf: shelfOf(p) };
  });
  return out;
}

// Perbandingan frekuensi produksi per produk (per minggu)
export function compareFrequency({ D, product, planQty, setupShare }) {
  const S = shelfOf(product);
  const price = product.price, hpp = product.hpp;
  const round = (x) => Math.round(x);
  const calc = (label, key, freq, producedList, gaps) => {
    let produced = 0, sold = 0, unmet = 0;
    gaps.forEach((g, i) => {
      const cap = D * Math.min(g, S);
      const q = producedList[i];
      produced += q;
      sold += Math.min(q, cap);
      unmet += Math.max(0, D * g - Math.min(q, cap));
    });
    const waste = produced - sold;
    const laba = sold * price - produced * hpp - freq * setupShare;
    return { key, label, freq, produced: round(produced), sold: round(sold), waste: round(waste), unmet: round(unmet), laba };
  };
  const q = planQty != null ? planQty : 0;
  const rows = [
    calc("Rencana sistem sekarang (jumlah tetap)", "rencana", 2, [q, q], [3, 4]),
    calc("2x seminggu, jumlah mengikuti penjualan", "dua", 2, [D * Math.min(3, S), D * Math.min(4, S)], [3, 4]),
    calc("1x seminggu, jumlah mengikuti penjualan", "satu", 1, [D * Math.min(7, S)], [7]),
  ];
  const best = rows.reduce((b, r) => (r.laba > b.laba ? r : b), rows[0]);
  return { rows, best, shelf: S };
}
