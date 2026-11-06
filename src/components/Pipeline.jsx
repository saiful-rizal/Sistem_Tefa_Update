import React from "react";
import Icon from "./Icon.jsx";

// Pipeline horizontal: tiap tahap berupa lingkaran bernomor yang tersambung garis.
// steps: [{ id, name, durationMin }]   run: (opsional) batch yang sedang berjalan
export const fmtClock = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function Pipeline({ steps, run, now }) {
  return (
    <ol className="pipe" aria-label="Alur tahapan produksi">
      {steps.map((st, i) => {
        const rs = run ? run.stages[i] : null;
        const done = !!(rs && rs.doneAt);
        const active = !!(rs && rs.startedAt && !rs.doneAt && run.status === "jalan");
        const state = done ? "done" : active ? "active" : "wait";
        let timeText = `${st.durationMin} menit`;
        let over = false;
        if (active) {
          const el = (now - new Date(rs.startedAt).getTime()) / 1000;
          timeText = `${fmtClock(el)} / ${st.durationMin}:00`;
          over = el > st.durationMin * 60;
        } else if (done) {
          const mins = Math.max(1, Math.round((new Date(rs.doneAt) - new Date(rs.startedAt)) / 60000));
          timeText = `selesai (${mins} mnt)`;
        }
        const pct = active ? Math.min(100, ((now - new Date(rs.startedAt).getTime()) / 1000 / (st.durationMin * 60)) * 100) : done ? 100 : 0;
        return (
          <li key={st.id} className={"pipe-step " + state}>
            <div className="pipe-dot">{done ? <Icon name="check" size={20} /> : i + 1}</div>
            <div className="pipe-name">{st.name}</div>
            <div className={"pipe-time" + (over ? " over" : "")}>{timeText}</div>
            <div className="pipe-bar"><span style={{ width: pct + "%" }} /></div>
          </li>
        );
      })}
    </ol>
  );
}
