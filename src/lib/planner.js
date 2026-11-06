// ============================================================
// Perencana bulanan: modal bulanan → alokasi → produksi → bahan baku → laba
// Jadwal (sesuai konsep klien):
//   Senin & Kamis  : Roti Manis + Roti Tawar
//   Selasa & Jumat : Roti Kering
// 4 minggu = 8 siklus roti + 8 siklus kering
// Model: MILP bilangan bulat per siklus (enumerasi eksak) + pencarian alokasi modal terbaik.
// ============================================================

export const WEEKS = 4;
export const DAYS_ROTI = ["Senin", "Kamis"];
export const DAYS_KERING = ["Selasa", "Jumat"];
export const CYCLES = WEEKS * 2;

const fl = (a, b) => (b > 0 ? Math.floor(a / b + 1e-9) : Infinity);

function cycleRoti(modal, caps, A, B, dminA) {
  let best = null;
  const maxX1 = Math.min(A.dmax, fl(modal, A.hpp), fl(caps.oven, A.oven), fl(caps.mixer, A.mixer), fl(caps.sdm, A.sdm));
  for (let x1 = dminA; x1 <= maxX1; x1++) {
    const rm = modal - x1 * A.hpp;
    const ro = caps.oven - x1 * A.oven;
    const rx = caps.mixer - x1 * A.mixer;
    const rs = caps.sdm - x1 * A.sdm;
    const x2 = Math.max(0, Math.min(B.dmax, fl(rm, B.hpp), fl(ro, B.oven), fl(rx, B.mixer), fl(rs, B.sdm)));
    const profit = x1 * A.margin + x2 * B.margin;
    if (!best || profit > best.profit) best = { x1, x2, profit };
  }
  return best;
}

function cycleKering(modal, caps, C) {
  const x3 = Math.max(0, Math.min(C.dmax, fl(modal, C.hpp), fl(caps.oven, C.oven), fl(caps.mixer, C.mixer), fl(caps.sdm, C.sdm)));
  return { x3, profit: x3 * C.margin };
}

export function bomCost(product, materials) {
  return materials.reduce((s, m) => s + (product.bom[m.id] || 0) * (m.price || 0), 0);
}

const emptyPlan = (reason, modal) => ({ status: "Infeasible", reason, modal, monthly: { x1: 0, x2: 0, x3: 0, units: 0, revenue: 0, hpp: 0, profit: 0 }, shopping: [], days: [], usage: {} });

export function planMonthly(params, products, materials) {
  const [A, B, C] = products;
  const M = Math.max(0, Number(params.modalBulanan) || 0);
  const caps = { oven: params.ovenJam * 60, mixer: params.mixerJam * 60, sdm: params.sdmJam * 60 };
  const dmin = Math.max(0, Number(params.orderMin) || 0);

  let best = null;
  for (let pct = 0; pct <= 100; pct++) {
    const mR = (M * pct) / 100;
    const mK = M - mR;
    const r = cycleRoti(mR / CYCLES, caps, A, B, dmin);
    if (!r) continue;
    const k = cycleKering(mK / CYCLES, caps, C);
    const total = CYCLES * (r.profit + k.profit);
    if (!best || total > best.total) best = { pct, r, k, total, mR, mK };
  }
  if (!best) return emptyPlan("Modal atau kapasitas belum cukup untuk memenuhi pesanan khusus minimum per siklus. Naikkan modal atau turunkan pesanan minimum.", M);

  const { r, k } = best;
  const monthly = { x1: CYCLES * r.x1, x2: CYCLES * r.x2, x3: CYCLES * k.x3 };
  const xs = [monthly.x1, monthly.x2, monthly.x3];
  monthly.units = xs.reduce((s, x) => s + x, 0);
  monthly.revenue = xs.reduce((s, x, i) => s + x * products[i].price, 0);
  monthly.hpp = xs.reduce((s, x, i) => s + x * products[i].hpp, 0);
  monthly.profit = monthly.revenue - monthly.hpp;

  const usage = {};
  materials.forEach((m) => {
    usage[m.id] = xs.reduce((s, x, i) => s + x * (products[i].bom[m.id] || 0), 0);
  });

  const shopping = materials.map((m) => {
    const need = usage[m.id] || 0;
    const safety = m.minStock || 0;
    const buy = Math.max(0, Math.ceil((need + safety - m.stock) * 10) / 10);
    const weekly = (m.shelfDays || 999) < 30;
    return {
      id: m.id, name: m.name, unit: m.unit, need, stock: m.stock, safety, buy,
      price: m.price || 0, cost: buy * (m.price || 0),
      freq: weekly ? "Mingguan (4x)" : "Sekali di awal bulan",
      perWeek: weekly ? Math.ceil((buy / WEEKS) * 10) / 10 : null,
      shelfDays: m.shelfDays,
    };
  });
  const belanja = shopping.reduce((s, x) => s + x.cost, 0);
  const bahanTerpakai = xs.reduce((s, x, i) => s + x * bomCost(products[i], materials), 0);

  const util = (used, cap) => (cap > 0 ? used / cap : 0);
  const rotiUsed = { oven: r.x1 * A.oven + r.x2 * B.oven, mixer: r.x1 * A.mixer + r.x2 * B.mixer, sdm: r.x1 * A.sdm + r.x2 * B.sdm, modal: r.x1 * A.hpp + r.x2 * B.hpp };
  const kerUsed = { oven: k.x3 * C.oven, mixer: k.x3 * C.mixer, sdm: k.x3 * C.sdm, modal: k.x3 * C.hpp };
  const utilRoti = { Oven: util(rotiUsed.oven, caps.oven), Mixer: util(rotiUsed.mixer, caps.mixer), SDM: util(rotiUsed.sdm, caps.sdm), Modal: util(rotiUsed.modal, best.mR / CYCLES) };
  const utilKering = { Oven: util(kerUsed.oven, caps.oven), Mixer: util(kerUsed.mixer, caps.mixer), SDM: util(kerUsed.sdm, caps.sdm), Modal: util(kerUsed.modal, best.mK / CYCLES) };
  const topOf = (u) => Object.entries(u).sort((a, b) => b[1] - a[1])[0];
  const atDemand = r.x2 >= B.dmax && k.x3 >= C.dmax;
  const topR = topOf(utilRoti);
  const topK = topOf(utilKering);
  const bottleneck = atDemand && topR[1] < 0.95 && topK[1] < 0.95 ? { name: "Permintaan pasar (Dmax)", pct: 100 } : topR[1] >= topK[1] ? { name: topR[0] + " (siklus roti)", pct: Math.round(topR[1] * 100) } : { name: topK[0] + " (siklus kering)", pct: Math.round(topK[1] * 100) };

  const days = [];
  for (let w = 1; w <= WEEKS; w++) {
    days.push({ week: w, day: "Senin", group: "roti" });
    days.push({ week: w, day: "Selasa", group: "kering" });
    days.push({ week: w, day: "Kamis", group: "roti" });
    days.push({ week: w, day: "Jumat", group: "kering" });
  }
  const dayRows = days.map((d) => d.group === "roti"
    ? { ...d, items: [{ name: A.name, qty: r.x1, pid: A.id }, { name: B.name, qty: r.x2, pid: B.id }], hpp: r.x1 * A.hpp + r.x2 * B.hpp, revenue: r.x1 * A.price + r.x2 * B.price }
    : { ...d, items: [{ name: C.name, qty: k.x3, pid: C.id }], hpp: k.x3 * C.hpp, revenue: k.x3 * C.price });

  return {
    status: "Optimal", modal: M,
    split: { rotiPct: best.pct, roti: best.mR, kering: best.mK, perCycleRoti: best.mR / CYCLES, perCycleKering: best.mK / CYCLES },
    cycle: { roti: r, kering: k },
    monthly, usage, shopping, belanja, bahanTerpakai,
    overhead: monthly.hpp - bahanTerpakai,
    sisaModal: M - monthly.hpp,
    roi: monthly.hpp > 0 ? monthly.profit / monthly.hpp : 0,
    margin: monthly.revenue > 0 ? monthly.profit / monthly.revenue : 0,
    belanjaMelebihiModal: belanja > M,
    utilRoti, utilKering, bottleneck, days: dayRows,
    perProduct: products.map((p, i) => ({ id: p.id, name: p.name, perCycle: i === 0 ? r.x1 : i === 1 ? r.x2 : k.x3, monthly: xs[i], revenue: xs[i] * p.price, profit: xs[i] * p.margin, hpp: xs[i] * p.hpp, days: i < 2 ? "Senin & Kamis" : "Selasa & Jumat" })),
  };
}

export function scenarios(params, products, materials, factors = [0.5, 0.75, 1, 1.25, 1.5, 2]) {
  return factors.map((f) => {
    const modal = Math.round((params.modalBulanan * f) / 100000) * 100000;
    const p = planMonthly({ ...params, modalBulanan: modal }, products, materials);
    return { factor: f, modal, status: p.status, units: p.monthly.units, revenue: p.monthly.revenue, profit: p.monthly.profit, roi: p.roi, belanja: p.belanja, bottleneck: p.bottleneck ? p.bottleneck.name : "-" };
  });
}

export function dayNameID(date = new Date()) {
  return ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][date.getDay()];
}
