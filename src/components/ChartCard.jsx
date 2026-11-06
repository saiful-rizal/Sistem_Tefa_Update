import React, { useState } from "react";
import { rp, fmtAxis, niceMax } from "../lib/format.js";

export default function ChartCard({ data, mode, setMode }) {
  const [hover, setHover] = useState(null);
  const n = data.length;
  const maxV = niceMax(Math.max(...data.map((d) => d.laba)));
  const active = hover == null ? n - 1 : hover;
  const d = data[active];
  return (
    <div className="card">
      <div className="chart-head">
        <div>
          <div className="chart-label">Proyeksi Laba Bersih</div>
          <div className="chart-big">{rp(d.laba)}</div>
        </div>
        <div className="seg">
          <button className={mode === "harian" ? "on" : ""} onClick={() => setMode("harian")}>Harian</button>
          <button className={mode === "mingguan" ? "on" : ""} onClick={() => setMode("mingguan")}><span className="segdot"></span>Mingguan</button>
        </div>
      </div>
      <div className="plot">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <div key={t} className="gridline" style={{ bottom: t * 100 + "%" }}>
            <span>{t === 0 ? "0" : fmtAxis(maxV * t)}</span>
          </div>
        ))}
        <div className="plot-cols">
          {data.map((dd, i) => {
            const h = Math.max(2, (dd.laba / maxV) * 100);
            const hot = i === active;
            const tipStyle = i === 0 ? { left: 6, transform: "none" } : i === n - 1 ? { right: 6, left: "auto", transform: "none" } : {};
            return (
              <div key={i} className="col" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {hot && (
                  <div className="tip" style={{ bottom: `calc(${h}% + 16px)`, ...tipStyle }}>
                    <div className="t-title">{dd.title}</div>
                    <div className="t-row"><span>Pendapatan</span><b>{rp(dd.pendapatan)}</b></div>
                    <div className="t-row"><span>Laba Bersih</span><b>{rp(dd.laba)}</b></div>
                  </div>
                )}
                <div className={"bar" + (hot ? " hot" : "")} style={{ height: h + "%" }}></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="xlabels">
        {data.map((dd, i) => (
          <span key={i} style={i === active ? { color: "#101828", fontWeight: 700 } : {}}>{dd.label}</span>
        ))}
      </div>
    </div>
  );
}
