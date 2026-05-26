'use client'

interface LucyEyeProps {
  state: 'idle' | 'thinking' | 'speaking'
  size?: number
}

export default function LucyEye({ state, size = 200 }: LucyEyeProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38

  return (
    <div className={`eye-${state}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="iris-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2a4028" />
            <stop offset="40%" stopColor="#1a2e18" />
            <stop offset="100%" stopColor="#0d120d" />
          </radialGradient>
          <radialGradient id="pupil-grad" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#3d5939" />
            <stop offset="100%" stopColor="#060908" />
          </radialGradient>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <clipPath id="eye-clip">
            <ellipse cx={cx} cy={cy} rx={r * 1.15} ry={r * 0.65} />
          </clipPath>
        </defs>

        {/* ── Outer ambient glow ── */}
        <ellipse
          className="outer-ring"
          cx={cx}
          cy={cy}
          rx={r * 1.45}
          ry={r * 0.85}
          fill="none"
          stroke="#5d8156"
          strokeWidth="1"
          opacity="0.3"
          filter="url(#glow-filter)"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 1.35}
          ry={r * 0.78}
          fill="none"
          stroke="#5d8156"
          strokeWidth="0.5"
          opacity="0.2"
        />

        {/* ── Eyelid shape background ── */}
        <ellipse cx={cx} cy={cy} rx={r * 1.15} ry={r * 0.65} fill="#080c08" />

        {/* ── Iris (clipped to eye shape) ── */}
        <g clipPath="url(#eye-clip)">
          {/* Base iris */}
          <circle
            className="iris"
            cx={cx}
            cy={cy}
            r={r * 0.75}
            fill="url(#iris-grad)"
          />

          {/* Iris ring lines */}
          <circle
            cx={cx}
            cy={cy}
            r={r * 0.65}
            fill="none"
            stroke="#5d8156"
            strokeWidth="0.8"
            opacity="0.4"
          />
          <circle
            cx={cx}
            cy={cy}
            r={r * 0.5}
            fill="none"
            stroke="#5d8156"
            strokeWidth="0.5"
            opacity="0.3"
          />

          {/* ── Scan ring 1 ── */}
          <g className="scan-1" style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.72}
              fill="none"
              stroke="#5d8156"
              strokeWidth="1"
              strokeDasharray="8 16 4 8"
              opacity="0.5"
            />
          </g>

          {/* ── Scan ring 2 ── */}
          <g className="scan-2" style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.58}
              fill="none"
              stroke="#7aab72"
              strokeWidth="0.8"
              strokeDasharray="4 12 2 6"
              opacity="0.4"
            />
          </g>

          {/* ── Pupil ── */}
          <g className="pupil" style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.28}
              fill="url(#pupil-grad)"
            />
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.28}
              fill="none"
              stroke="#5d8156"
              strokeWidth="1.5"
              opacity="0.8"
            />
            {/* Pupil glint */}
            <circle
              cx={cx - r * 0.08}
              cy={cy - r * 0.1}
              r={r * 0.04}
              fill="#8fca85"
              opacity="0.6"
            />
          </g>

          {/* ── Inner glow ── */}
          <circle
            cx={cx}
            cy={cy}
            r={r * 0.3}
            fill="none"
            stroke="#5d8156"
            strokeWidth="4"
            opacity="0.15"
            filter="url(#glow-strong)"
          />
        </g>

        {/* ── Eyelid borders ── */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 1.15}
          ry={r * 0.65}
          fill="none"
          stroke="#5d8156"
          strokeWidth="1.5"
          opacity="0.7"
          filter="url(#glow-filter)"
        />

        {/* ── Corner accents ── */}
        <line
          x1={cx - r * 1.15}
          y1={cy}
          x2={cx - r * 1.35}
          y2={cy}
          stroke="#5d8156"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1={cx + r * 1.15}
          y1={cy}
          x2={cx + r * 1.35}
          y2={cy}
          stroke="#5d8156"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* ── Data tick marks ── */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const outerR = r * 1.5
          const innerR = r * 1.38
          const x1 = cx + Math.cos(rad) * innerR
          const y1 = cy + Math.sin(rad) * innerR * 0.6
          const x2 = cx + Math.cos(rad) * outerR
          const y2 = cy + Math.sin(rad) * outerR * 0.6
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#5d8156"
              strokeWidth="1"
              opacity="0.3"
            />
          )
        })}
      </svg>
    </div>
  )
}
