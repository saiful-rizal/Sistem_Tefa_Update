import { batchInfo, localYmd } from "./stokjadi.js";
import { planMonthly } from "./planner.js";
import { loadLocal, saveLocal } from "./solver.js";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const pad2 = (value) => String(value).padStart(2, "0");

function dateOffset(offset) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function createDemoData(products, materials, params) {
  const productById = Object.fromEntries(products.map((product) => [product.id, product]));
  const dates = Array.from({ length: 29 }, (_, index) => dateOffset(index - 28));
  const batches = [];
  const sales = [];
  const transactions = [];
  const realisasi = [];
  const waste = [];
  let batchSeq = 1;
  let transactionSeq = 1;

  const addBatch = (productId, date, qty) => {
    if (!productById[productId] || qty <= 0) return;
    batches.push({
      id: `DEMO-B${String(batchSeq++).padStart(4, "0")}`,
      productId,
      date: dateKey(date),
      qty,
      remaining: qty,
    });
  };

  const openingDate = dateOffset(-29);
  addBatch("PRD01", openingDate, 40);
  addBatch("PRD02", openingDate, 16);
  addBatch("PRD03", openingDate, 18);
  addBatch("PRD04", openingDate, 12);
  addBatch("PRD05", openingDate, 7);

  dates.forEach((date, dayIndex) => {
    const weekday = date.getDay();
    const day = DAY_NAMES[weekday];
    const isRotiDay = weekday === 1 || weekday === 4;
    const isKeringDay = weekday === 2 || weekday === 5;

    batches.forEach((batch) => {
      if (batch.remaining <= 0) return;
      const product = productById[batch.productId];
      if (product && batchInfo(batch, product, dateKey(date)).expired) {
        waste.push({
          id: `DEMO-W${String(waste.length + 1).padStart(4, "0")}`,
          date: dateKey(date),
          productId: batch.productId,
          qty: batch.remaining,
          by: "Admin Produksi Demo",
        });
        batch.remaining = 0;
      }
    });

    if (isRotiDay) {
      addBatch("PRD01", date, 22);
      addBatch("PRD02", date, 8);
    }
    if (isKeringDay) {
      addBatch("PRD03", date, 16);
      addBatch("PRD04", date, 8);
      addBatch("PRD05", date, 4);
    }

    const transactionsForDay = [
      { items: [["PRD01", 1 + (dayIndex % 2)], ["PRD03", 1]], method: dayIndex % 3 === 0 ? "QRIS" : "Tunai" },
      { items: [["PRD02", 1], ["PRD04", 1 + (dayIndex % 2 === 0 ? 1 : 0)]], method: dayIndex % 3 === 1 ? "Transfer" : "Tunai" },
      { items: [["PRD05", 1], ["PRD01", 1]], method: dayIndex % 3 === 2 ? "QRIS" : "Tunai" },
    ];

    transactionsForDay.forEach((entry, orderIndex) => {
      const items = entry.items
        .map(([productId, qty]) => productById[productId] && ({
          productId,
          name: productById[productId].name,
          qty,
          price: productById[productId].price,
        }))
        .filter(Boolean);
      if (!items.length) return;

      const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
      const tsDate = new Date(date);
      tsDate.setHours(8 + orderIndex * 3, 10 + dayIndex, 0, 0);
      const id = `DEMO-TRX-${dateKey(date).replace(/-/g, "")}-${String(orderIndex + 1).padStart(2, "0")}`;
      const paid = entry.method === "Tunai" ? Math.ceil(total / 10000) * 10000 : total;
      const transaction = {
        id,
        date: dateKey(date),
        ts: tsDate.toISOString(),
        items,
        total,
        method: entry.method,
        paid,
        change: Math.max(0, paid - total),
        ref: entry.method === "Transfer" ? `DEMO-REF-${String(transactionSeq).padStart(4, "0")}` : "",
        by: "Kasir Demo",
        noStock: false,
      };
      transactionSeq += 1;
      transactions.unshift(transaction);

      items.forEach((item) => {
        sales.unshift({
          id: `DEMO-S${String(sales.length + 1).padStart(4, "0")}`,
          date: transaction.date,
          productId: item.productId,
          qty: item.qty,
          by: transaction.by,
          trxId: id,
        });

        let qtyToSell = item.qty;
        batches
          .filter((batch) => batch.productId === item.productId && batch.remaining > 0 && !batchInfo(batch, productById[item.productId], transaction.date).expired)
          .sort((a, b) => a.date.localeCompare(b.date))
          .forEach((batch) => {
            if (qtyToSell <= 0) return;
            const sold = Math.min(batch.remaining, qtyToSell);
            batch.remaining -= sold;
            qtyToSell -= sold;
          });
          if (qtyToSell > 0) transaction.noStock = true;
      });
    });

    if (isRotiDay || isKeringDay) {
      realisasi.unshift({
        id: `DEMO-REAL-${dateKey(date).replace(/-/g, "")}`,
        date: dateKey(date),
        day,
        x1: isRotiDay ? 22 : 0,
        x2: isRotiDay ? 8 : 0,
        x3: isKeringDay ? 16 : 0,
        x4: isKeringDay ? 8 : 0,
        x5: isKeringDay ? 4 : 0,
        reject: 1,
        note: isRotiDay ? "Produksi rutin roti manis dan tawar" : "Produksi rutin aneka roti kering",
        by: "Admin Produksi Demo",
      });
    }
  });

  const requestDate = localYmd();
  const approvedPlan = planMonthly(params, products, materials);
  return {
    batches,
    sales,
    transactions,
    realisasi,
    waste,
    orders: [
      { id: "DEMO-ORD-001", act: "Roti Manis", productId: "PRD01", sub: "Pesanan Khusus", deadline: "Besok, 09:00 WIB", qty: 24, status: "Diproses", st: "process", paymentMethod: "QRIS", recordingMethod: "Manual", note: "Pembayaran terkonfirmasi" },
      { id: "DEMO-ORD-002", act: "Roti Tawar", productId: "PRD02", sub: "Produksi Rutin", deadline: "Hari ini, 14:00 WIB", qty: 12, status: "Menunggu", st: "wait", paymentMethod: "Tunai", recordingMethod: "Manual", note: "Pengiriman ke kantin kampus" },
      { id: "DEMO-ORD-003", act: "Roti Kering 100g", productId: "PRD03", sub: "Pesanan Khusus", deadline: "Besok, 10:00 WIB", qty: 8, status: "Menunggu", st: "wait", paymentMethod: "Transfer", recordingMethod: "Google Sheet", note: "Referensi pembayaran DEMO-ORDER-03" },
      { id: "DEMO-ORD-004", act: "Roti Kering Toples", productId: "PRD05", sub: "Produksi Rutin", deadline: "Selesai hari ini", qty: 4, status: "Selesai", st: "done", paymentMethod: "QRIS", recordingMethod: "Manual", note: "Pesanan contoh selesai" },
    ],
    requests: [
      { id: "DEMO-REQ-001", date: requestDate, by: "Admin Produksi Demo", materialId: "RM001", qty: 15, reason: "Persediaan tepung untuk jadwal produksi berikutnya", status: "Menunggu" },
      { id: "DEMO-REQ-002", date: requestDate, by: "Admin Produksi Demo", materialId: "RM005", qty: 5, reason: "Pengadaan gula untuk produksi roti", status: "Disetujui", decidedBy: "Admin Utama Demo" },
    ],
    approved: approvedPlan.status === "Optimal"
      ? { status: "approved", approvedAt: new Date().toISOString(), approvedBy: "Admin Utama Demo", snapshot: approvedPlan }
      : null,
  };
}

export function initializeDemoData(products, materials, params, ordersFallback) {
  const key = "tefa-demo-seed-v1";
  if (loadLocal(key, false)) return createDemoData(products, materials, params);

  const keys = ["tefa-sales", "tefa-trx", "tefa-batches", "tefa-realisasi", "tefa-waste", "tefa-requests"];
  const hasExistingActivity = keys.some((storageKey) => {
    const value = loadLocal(storageKey, null);
    return Array.isArray(value) && value.length > 0;
  });
  const demo = createDemoData(products, materials, params);

  if (!hasExistingActivity) {
    saveLocal("tefa-sales", demo.sales);
    saveLocal("tefa-trx", demo.transactions);
    saveLocal("tefa-batches", demo.batches);
    saveLocal("tefa-realisasi", demo.realisasi);
    saveLocal("tefa-waste", demo.waste);
    saveLocal("tefa-requests", demo.requests);

    const storedOrders = loadLocal("tefa-orders", null);
    if (Array.isArray(storedOrders) && storedOrders.some((order) => String(order.id).startsWith("DEMO-ORD-"))) {
      demo.orders = [];
    } else {
      saveLocal("tefa-orders", [...(Array.isArray(storedOrders) ? storedOrders : ordersFallback), ...demo.orders]);
    }

    const storedApproved = loadLocal("tefa-approved", null);
    if (!storedApproved) saveLocal("tefa-approved", demo.approved);
  } else {
    demo.sales = [];
    demo.transactions = [];
    demo.batches = [];
    demo.realisasi = [];
    demo.waste = [];
    demo.requests = [];
    demo.orders = [];
    demo.approved = null;
  }

  saveLocal(key, true);
  return demo;
}
