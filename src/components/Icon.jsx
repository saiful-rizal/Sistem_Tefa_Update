import React from "react";

const ICONS = {
  grid: <g><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></g>,
  trend: <g><path d="M3 17l5.5-5.5 3.5 3.5L21 7" /><path d="M15 7h6v6" /></g>,
  box: <g><path d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2V8.2z" /><path d="M3 8.2l9 5.2 9-5.2" /><path d="M12 13.4V21" /></g>,
  receipt: <g><path d="M6 3h12v18l-2.4-1.6L13.2 21l-2.4-1.6L8.4 21 6 19.4V3z" /><path d="M9.5 8h5M9.5 12h5" /></g>,
  doc: <g><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 12h5M10 16h5" /></g>,
  layers: <g><path d="M12 3 3 8l9 5 9-5-9-5z" /><path d="M3 13l9 5 9-5" /></g>,
  gear: <g><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /></g>,
  help: <g><circle cx="12" cy="12" r="9" /><path d="M9.6 9.2a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.9" /><path d="M12 16.8h.01" /></g>,
  logout: <g><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" /><path d="M16 17l5-5-5-5" /><path d="M21 12H10" /></g>,
  search: <g><circle cx="11" cy="11" r="7" /><path d="M20.5 20.5 16.6 16.6" /></g>,
  bell: <g><path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z" /><path d="M10.3 20a2 2 0 0 0 3.4 0" /></g>,
  mail: <g><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 7.5 8.5 6 8.5-6" /></g>,
  chevD: <path d="m6 9 6 6 6-6" />,
  chevUD: <g><path d="m8 9 4-4 4 4" /><path d="m8 15 4 4 4-4" /></g>,
  arrowR: <g><path d="M4.5 12h15" /><path d="m13.5 6 6 6-6 6" /></g>,
  filter: <path d="M3.5 5h17l-6.8 8v5.5l-3.4-1.8V13L3.5 5z" />,
  refresh: <g><path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" /><path d="M20.5 3.5V9H15" /></g>,
  download: <g><path d="M12 15V3.5" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" /></g>,
  wallet: <g><rect x="2.8" y="6" width="18.4" height="13" rx="3" /><path d="M2.8 10.5h18.4" /><circle cx="17" cy="14.7" r="1.1" fill="currentColor" stroke="none" /></g>,
  coins: <g><circle cx="9" cy="9" r="5.5" /><path d="M14.2 8.6a5.5 5.5 0 1 1-5.6 6.8" /></g>,
  bread: <g><path d="M4 11.5c0-3.8 3.6-6.5 8-6.5s8 2.7 8 6.5v5.2A2.3 2.3 0 0 1 17.7 19H6.3A2.3 2.3 0 0 1 4 16.7v-5.2z" /><path d="M8 11c.3-1.6 1.4-2.5 3-3M13 11c.3-1.6 1.4-2.5 3-3" /></g>,
  cookie: <g><circle cx="12" cy="12" r="8.5" /><circle cx="8.5" cy="9" r="1" fill="currentColor" stroke="none" /><circle cx="15.5" cy="9.5" r="1" fill="currentColor" stroke="none" /><circle cx="13" cy="15" r="1" fill="currentColor" stroke="none" /><circle cx="8.5" cy="14.5" r="1" fill="currentColor" stroke="none" /></g>,
  check: <path d="m5 12 4 4L19 6" />,
  target: <g><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></g>,
  dots: <g fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></g>,
  dotsV: <g fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></g>,
  plus: <g><path d="M12 5v14M5 12h14" /></g>,
  in: <g><path d="M12 3.5V15" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" /></g>,
  out: <g><path d="M12 15V3.5" /><path d="m7.5 7.5 4.5-4.5 4.5 4.5" /><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" /></g>,
  history: <g><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" /><path d="M3.5 4v4.5H8" /><path d="M12 7.5V12l3 2" /></g>,
  shield: <g><path d="M12 3 4.5 6v5.5c0 4.4 3 7.7 7.5 9.5 4.5-1.8 7.5-5.1 7.5-9.5V6L12 3z" /><path d="m9 12 2.2 2.2L15.5 10" /></g>,
  list: <g><path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" /><circle cx="4.5" cy="6.5" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="17.5" r="1" fill="currentColor" stroke="none" /></g>,
  trash: <g><path d="M4 7h16" /><path d="M9 7V4.5h6V7" /><path d="M6.5 7l.8 12.5h9.4L17.5 7" /></g>,
  edit: <g><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" /><path d="m14.5 7.5 3 3" /></g>,
};

export default function Icon({ name, size = 18, style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {ICONS[name]}
    </svg>
  );
}
