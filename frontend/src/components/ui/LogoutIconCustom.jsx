import React from "react";

const LogoutIconCustom = () => {
  const styles = {
    arrow: {
      animation: "slide 1s infinite alternate",
    },
    '@keyframes slide': {
      from: { transform: "translateX(0)" },
      to: { transform: "translateX(10px)" }
    }
  };

  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          @keyframes slide {
            from { transform: translateX(0); }
            to { transform: translateX(10px); }
          }
        `}
      </style>

      {/* Door outline */}
      <path
        d="M25 10 h30 a10 10 0 0 1 10 10 v20"
        fill="none"
        stroke="#000"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M65 60 v20 a10 10 0 0 1 -10 10 h-30 a10 10 0 0 1 -10 -10 v-60 a10 10 0 0 1 10 -10"
        fill="none"
        stroke="#000"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Sliding arrow */}
      <line
        x1="45"
        y1="50"
        x2="85"
        y2="50"
        stroke="#2DCCD3"
        strokeWidth="6"
        strokeLinecap="round"
        className="arrow"
      />
      <polyline
        points="70,35 85,50 70,65"
        fill="none"
        stroke="#2DCCD3"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="arrow"
      />
    </svg>
  );
};

export default LogoutIconCustom;
