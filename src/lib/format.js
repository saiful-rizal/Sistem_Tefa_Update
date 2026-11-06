export const rp = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export const fmtAxis = (v) => {
  if (v === 0) return "0";
  if (v >= 1e6) return (v / 1e6).toFixed(1).replace(".0", "").replace(".", ",") + "jt";
  return Math.round(v / 1e3) + "rb";
};

export const fmtQty = (v) => Number(v || 0).toFixed(1).replace(".", ",");

export const niceMax = (v) => {
  const s = v >= 1.5e6 ? 5e5 : v >= 8e5 ? 2e5 : 1e5;
  return Math.ceil((v || 0) / s) * s;
};

export const fmtPersen = (v) => `${Math.round(v || 0)} persen`;

export const fmtDelta = (profit, pembanding) => {
  if (!pembanding) return "Stabil";
  const d = ((profit - pembanding) / pembanding) * 100;
  const angka = Math.abs(d).toFixed(1).replace(".", ",");
  if (Math.abs(d) < 0.05) return "Stabil";
  return d >= 0 ? `Naik ${angka} persen` : `Turun ${angka} persen`;
};

export const fmtJam = (v) => `${v} jam`;
export const fmtJamKerja = (v) => `${v} jam kerja`;
export const fmtUnit = (v) => `${v} unit`;
