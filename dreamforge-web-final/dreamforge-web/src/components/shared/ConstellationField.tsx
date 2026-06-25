"use client";

import { motion } from "framer-motion";

interface ConstellationFieldProps {
  className?: string;
  dense?: boolean;
}

// A drifting field of connected nodes — the visual signature of DreamForge.
// Pure decoration here; the same node/edge concept reappears functionally
// in the Scene Graph viewer.
const POINTS = [
  [40, 60], [180, 30], [320, 90], [120, 160], [260, 200],
  [400, 150], [60, 240], [340, 260], [200, 300], [460, 70],
];

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [3, 4], [2, 5],
  [3, 6], [4, 7], [4, 8], [5, 9], [2, 9],
];

export function ConstellationField({ className, dense = false }: ConstellationFieldProps) {
  const points = dense ? POINTS : POINTS.slice(0, 7);
  const links = LINKS.filter(([a, b]) => a < points.length && b < points.length);

  return (
    <svg
      viewBox="0 0 500 320"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A6B1FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A6B1FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {links.map(([a, b], i) => (
        <motion.line
          key={`link-${i}`}
          x1={points[a][0]}
          y1={points[a][1]}
          x2={points[b][0]}
          y2={points[b][1]}
          stroke="#7C8CFF"
          strokeOpacity="0.18"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.25 }}
          transition={{ duration: 1.6, delay: i * 0.08, ease: "easeOut" }}
        />
      ))}

      {points.map((p, i) => (
        <motion.g
          key={`node-${i}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.07 }}
        >
          <motion.circle
            cx={p[0]}
            cy={p[1]}
            r={18}
            fill="url(#nodeGlow)"
            animate={{ cy: [p[1], p[1] - 8, p[1]] }}
            transition={{
              duration: 6 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
          <motion.circle
            cx={p[0]}
            cy={p[1]}
            r={3}
            fill="#EDEDF5"
            animate={{ cy: [p[1], p[1] - 8, p[1]] }}
            transition={{
              duration: 6 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        </motion.g>
      ))}
    </svg>
  );
}
