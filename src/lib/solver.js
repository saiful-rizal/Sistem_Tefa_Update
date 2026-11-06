import staticData from "../data/tefa-data.json";

export const PRODUCTS_DEFAULT = staticData.products;
export const MATERIALS_DEFAULT = staticData.materials;
export const DEFAULTS = staticData.defaults;
export const LABA_KEMARIN = staticData.labaKemarin;
export const DAILY = staticData.daily;
export const WEEKLY = staticData.weekly;
export const ORDERS = staticData.orders;
export const STOCK_LOGS_DEFAULT = staticData.stockLogs || [];
export const PRODUCTION_PROCESS = staticData.productionProcess || [];
export const CAPACITY_RULES = staticData.capacityRules || {};
export const PAYMENT_METHODS = staticData.paymentMethods || [];
export const RECORDING_METHODS = staticData.recordingMethods || [];
export const COST_CATEGORIES = staticData.costCategories || [];
export const MATERIAL_MIX_RATIO = staticData.materialMixRatio || {};

export function maxByStock(stockMap, bom, dmax) {
  let cap = dmax;
  Object.keys(bom || {}).forEach((mid) => {
    const need = bom[mid] || 0;
    if (need > 0) cap = Math.min(cap, Math.floor((stockMap[mid] ?? 0) / need));
  });
  return Math.max(0, cap);
}

export function predictCoverage(materials, usage, remain) {
  const out = {};
  materials.forEach((m) => {
    const need = usage[m.id] || 0;
    const left = Math.max(0, remain[m.id] ?? m.stock);
    const days = need > 1e-9 ? left / need : 99;
    const cappedDays = Math.min(99, days);
    const need7 = need * 7;
    const suggest7 = Math.max(0, need7 - left);
    const status =
      left <= 0
        ? "Habis"
        : left < (m.minStock || 0)
          ? "Kritis"
          : need > 0 && cappedDays < 3
            ? "Menipis"
            : left < (m.minStock || 0) * 2
              ? "Waspada"
              : "Aman";
    out[m.id] = {
      need,
      left,
      days: cappedDays,
      daysLabel:
        need > 1e-9
          ? cappedDays >= 99
            ? "99 lebih"
            : cappedDays.toFixed(1).replace(".", ",")
          : "Belum terpakai",
      suggest7,
      status,
    };
  });
  return out;
}

// Solver MILP dinamis untuk N produk (menggunakan pendekatan iterasi terbatas)
export function solveMILP(p, materials = MATERIALS_DEFAULT, products = PRODUCTS_DEFAULT) {
  const stockMap = {};
  materials.forEach((m) => {
    stockMap[m.id] = m.stock;
  });
  const modal = p.modal;
  const oven = p.ovenJam * 60;
  const mixer = p.mixerJam * 60;
  const sdm = p.sdmJam * 60;
  const caps = { modal, oven, mixer, sdm };
  const usage = {};
  const remain = {};
  materials.forEach((m) => {
    usage[m.id] = 0;
    remain[m.id] = m.stock;
  });

  const zero = (reason) => ({
    status: "Infeasible",
    reason,
    x1: 0,
    x2: 0,
    x3: 0,
    x: products.map(() => 0),
    profit: 0,
    revenue: 0,
    used: { modal: 0, oven: 0, mixer: 0, sdm: 0 },
    usage,
    remain,
    caps,
    bottleneck: "Belum ada",
    bottleneckPct: 0,
    stockConstrained: false,
    coverage: {},
  });

  // Hitung kapasitas per produk berdasarkan batasan
  const productCaps = products.map((prod, i) => {
    const capByModal = Math.floor(modal / (prod.hpp || 1));
    const capByOven = Math.floor(oven / (prod.oven || 1));
    const capByMixer = Math.floor(mixer / (prod.mixer || 1));
    const capBySdm = Math.floor(sdm / (prod.sdm || 1));
    const capByStock = maxByStock(stockMap, prod.bom, prod.dmax || 1e9);
    return Math.min(prod.dmax || 1e9, capByModal, capByOven, capByMixer, capBySdm, capByStock);
  });

  // Pesanan minimum pada produk pertama (Roti Manis)
  const orderMin = p.orderMin || 0;
  if (orderMin > productCaps[0]) {
    let cause = "Kapasitas atau modal belum cukup untuk pesanan khusus minimum.";
    return zero(cause);
  }

  // Cari kombinasi optimal dengan iterasi terbatas (untuk performa)
  let best = null;
  const maxIter = 2000;
  let iter = 0;

  // Untuk performa, batasi iterasi produk pertama
  const x1Start = orderMin;
  const x1End = Math.min(productCaps[0], x1Start + 100);

  for (let x1 = x1Start; x1 <= x1End && iter < maxIter; x1++) {
    iter++;
    const remModal = modal - x1 * (products[0]?.hpp || 0);
    const remOven = oven - x1 * (products[0]?.oven || 0);
    const remMixer = mixer - x1 * (products[0]?.mixer || 0);
    const remSdm = sdm - x1 * (products[0]?.sdm || 0);
    if (remModal < 0 || remOven < 0 || remMixer < 0 || remSdm < 0) break;

    const rem1 = {};
    let ok1 = true;
    for (const m of materials) {
      rem1[m.id] = (stockMap[m.id] || 0) - x1 * ((products[0]?.bom || {})[m.id] || 0);
      if (rem1[m.id] < -1e-9) { ok1 = false; break; }
    }
    if (!ok1) break;

    // Untuk produk ke-2 dan seterusnya, gunakan greedy berdasarkan margin per unit terbatas
    const xs = [x1];
    let curModal = remModal;
    let curOven = remOven;
    let curMixer = remMixer;
    let curSdm = remSdm;
    const curRem = { ...rem1 };

    for (let i = 1; i < products.length; i++) {
      const prod = products[i];
      const capByModal = Math.floor(curModal / (prod.hpp || 1));
      const capByOven = Math.floor(curOven / (prod.oven || 1));
      const capByMixer = Math.floor(curMixer / (prod.mixer || 1));
      const capBySdm = Math.floor(curSdm / (prod.sdm || 1));
      const capByStock = maxByStock(curRem, prod.bom, prod.dmax || 1e9);
      const xi = Math.min(prod.dmax || 1e9, capByModal, capByOven, capByMixer, capBySdm, capByStock, 100); // batasi 100 untuk performa
      xs.push(xi);

      curModal -= xi * (prod.hpp || 0);
      curOven -= xi * (prod.oven || 0);
      curMixer -= xi * (prod.mixer || 0);
      curSdm -= xi * (prod.sdm || 0);
      for (const m of materials) {
        curRem[m.id] -= xi * ((prod.bom || {})[m.id] || 0);
      }
    }

    const profit = xs.reduce((s, x, i) => s + x * (products[i]?.margin || 0), 0);
    if (!best || profit > best.profit) {
      best = { x: xs, profit };
    }
  }

  if (!best) return zero("Belum ada kombinasi yang memenuhi semua batas.");

  const xs = best.x;
  const used = {
    modal: xs.reduce((s, x, i) => s + x * (products[i]?.hpp || 0), 0),
    oven: xs.reduce((s, x, i) => s + x * (products[i]?.oven || 0), 0),
    mixer: xs.reduce((s, x, i) => s + x * (products[i]?.mixer || 0), 0),
    sdm: xs.reduce((s, x, i) => s + x * (products[i]?.sdm || 0), 0),
  };
  materials.forEach((m) => {
    usage[m.id] = xs.reduce((s, x, i) => s + x * ((products[i]?.bom || {})[m.id] || 0), 0);
    remain[m.id] = (stockMap[m.id] || 0) - usage[m.id];
  });

  const utils = [
    { k: "Modal", v: used.modal / caps.modal },
    { k: "Oven", v: used.oven / caps.oven },
    { k: "Mixer", v: used.mixer / caps.mixer },
    { k: "SDM", v: used.sdm / caps.sdm },
  ];
  materials.forEach((m) => {
    const awal = stockMap[m.id] || 0;
    if (awal > 0) utils.push({ k: m.name, v: usage[m.id] / awal });
  });
  utils.sort((a, b) => b.v - a.v);
  const coverage = predictCoverage(materials, usage, remain);
  const stockConstrained = materials.some((m) => remain[m.id] < (m.minStock || 0));

  // Backward-compat: ekspos x1, x2, x3 untuk kode lama
  return {
    status: "Optimal",
    x1: xs[0] || 0,
    x2: xs[1] || 0,
    x3: xs[2] || 0,
    x: xs,
    profit: best.profit,
    revenue: xs.reduce((s, x, i) => s + x * (products[i]?.price || 0), 0),
    used,
    usage,
    remain,
    caps,
    bottleneck: utils[0] ? utils[0].k : "Belum ada",
    bottleneckPct: utils[0] ? Math.round(utils[0].v * 100) : 0,
    stockConstrained,
    coverage,
  };
}

export function stockStatusClass(s) {
  if (s === "Aman") return "done";
  if (s === "Waspada") return "process";
  return "wait";
}

export function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* abaikan */
  }
}
