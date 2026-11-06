import React from "react";
import Icon from "../components/Icon.jsx";
import OrdersCard from "../components/OrdersCard.jsx";
import QuickAdd from "../components/QuickAdd.jsx";

export default function PesananModule({ go, orders, materials, onAddOrder, onAddLog, onUpdateOrderStatus }) {
  const list = orders || [];
  const menunggu = list.filter((o) => o.status === "Menunggu" || o.status === "Diproses").length;
  const selesai = list.filter((o) => o.status === "Selesai").length;
  const totalUnit = list.filter((o) => o.status !== "Dibatalkan").reduce((s, o) => s + (Number(o.qty) || 0), 0);
  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Total pesanan</div><div className="metric-value">{list.length}</div><div className="metric-note">Periode berjalan</div></div>
        <div className="card metric-card"><div className="metric-label">Perlu diproses</div><div className="metric-value">{menunggu}</div><div className="metric-note">Prioritas hari ini</div></div>
        <div className="card metric-card"><div className="metric-label">Selesai</div><div className="metric-value">{selesai}</div><div className="metric-note trend-up">Pesanan selesai</div></div>
        <div className="card metric-card"><div className="metric-label">Unit terpesan</div><div className="metric-value">{totalUnit}</div><div className="metric-note">Semua produk</div></div>
      </div>
      <QuickAdd materials={materials || []} onAddLog={onAddLog} onAddOrder={onAddOrder} preset="pesanan" inline />
      <OrdersCard orders={list} materials={materials} onAddLog={onAddLog} onAddOrder={onAddOrder} onUpdateOrderStatus={onUpdateOrderStatus} showAdd={false} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <button className="primary-btn" onClick={() => go("Optimasi")}>
          Gunakan pesanan sebagai constraint <Icon name="arrowR" size={14} />
        </button>
      </div>
    </>
  );
}
