import React from "react";

export default function PenjadwalanModule() {
  const cells = [
    ["07.00-09.00", "Roti Manis", "Roti Manis", "Roti Tawar", "Roti Tawar", "Bagelan"],
    ["09.00-11.00", "Roti Tawar", "Bagelan", "Roti Manis", "Bagelan", "Roti Manis"],
    ["13.00-15.00", "Bagelan", "Roti Manis", "Roti Tawar", "Roti Manis", "Bagelan"],
  ];
  return (
    <>
      <div className="module-grid four">
        <div className="card metric-card"><div className="metric-label">Shift aktif</div><div className="metric-value">2</div><div className="metric-note">Pagi dan siang</div></div>
        <div className="card metric-card"><div className="metric-label">Beban oven</div><div className="metric-value">84%</div><div className="metric-note">Kapasitas tertinggi</div></div>
        <div className="card metric-card"><div className="metric-label">Beban SDM</div><div className="metric-value">71%</div><div className="metric-note">16 jam tersedia</div></div>
        <div className="card metric-card"><div className="metric-label">Deadline aman</div><div className="metric-value">5/5</div><div className="metric-note trend-up">Tidak ada keterlambatan</div></div>
      </div>
      <div className="card">
        <div className="module-card-title">
          <div><h3>Jadwal produksi mingguan</h3><p>Urutan dibuat dari deadline pesanan dan efisiensi kapasitas mesin.</p></div>
          <span className="chip-status ok"><span className="dot"></span>Sinkron</span>
        </div>
        <div className="schedule-grid">
          <div className="schedule-cell head">Jam</div>
          {["Sen", "Sel", "Rab", "Kam", "Jum"].map((x) => (
            <div className="schedule-cell head" key={x}>{x}<small style={{ display: "block", fontWeight: 500, marginTop: 3 }}>18 Okt</small></div>
          ))}
          {cells.map((r) => (
            <React.Fragment key={r[0]}>
              <div className="schedule-cell time">{r[0]}</div>
              {r.slice(1).map((x, j) => (
                <div key={j} className={"schedule-cell schedule-block " + (x === "Roti Tawar" ? "blue" : x === "Bagelan" ? "amber" : "")}>
                  {x}<small style={{ display: "block", fontWeight: 500, marginTop: 5 }}>Rutin</small>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
