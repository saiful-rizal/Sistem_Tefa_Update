import React, { useEffect } from "react";
import Icon from "./Icon.jsx";

function useEscape(onClose) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
}

export default function ModalForm({ title, desc, onClose, children, icon = "plus" }) {
  useEscape(onClose);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="help-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title-icon"><Icon name={icon} size={19} /></div>
          <div>
            <h2>{title}</h2>
            <p>{desc}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
        <div className="modal-footer" style={{ margin: "4px -20px -20px", borderRadius: "0 0 18px 18px" }}>
          <button type="button" className="pill" onClick={onClose}>Batal</button>
        </div>
      </div>
    </div>
  );
}
