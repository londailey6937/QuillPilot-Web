import React, { useState } from "react";

interface AnimatedLogoProps {
  size?: number;
  animate?: boolean;
}

/**
 * AnimatedLogo - Elegant quill pen logo for Quill Pilot
 *
 * Features:
 * - Quill pen with feathered vanes
 * - 3D twirling animation about vertical center
 * - Ink drip animation
 * - Feather sway effects
 * - Glowing effects on hover
 */
export function AnimatedLogo({
  size = 96,
  animate = true,
}: AnimatedLogoProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: size,
        height: size,
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "800px",
      }}
    >
      <style>{`
        @keyframes twirl {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }

        @keyframes ink-drip {
          0%, 100% {
            opacity: 0.8;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(2px);
          }
        }

        @keyframes feather-sway {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(239, 132, 50, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(239, 132, 50, 0.8));
          }
        }

        .quill-pen {
          transform-origin: center center;
          animation: ${
            animate
              ? isHovered
                ? "twirl 2s ease-in-out infinite"
                : "twirl 4s ease-in-out infinite"
              : "none"
          };
          transform-style: preserve-3d;
        }

        .ink-dot {
          animation: ${animate ? "ink-drip 1.5s ease-in-out infinite" : "none"};
        }

        .feather-vanes path {
          animation: ${
            animate ? "feather-sway 2s ease-in-out infinite" : "none"
          };
        }

        .feather-vanes path:nth-child(1) { animation-delay: 0s; }
        .feather-vanes path:nth-child(2) { animation-delay: 0.1s; }
        .feather-vanes path:nth-child(3) { animation-delay: 0.2s; }
        .feather-vanes path:nth-child(4) { animation-delay: 0.3s; }
        .feather-vanes path:nth-child(5) { animation-delay: 0.4s; }
        .feather-vanes path:nth-child(6) { animation-delay: 0s; }
        .feather-vanes path:nth-child(7) { animation-delay: 0.1s; }
        .feather-vanes path:nth-child(8) { animation-delay: 0.2s; }
        .feather-vanes path:nth-child(9) { animation-delay: 0.3s; }
        .feather-vanes path:nth-child(10) { animation-delay: 0.4s; }

        .logo-svg:hover {
          animation: ${
            animate && isHovered
              ? "glow-pulse 0.4s ease-in-out infinite"
              : "none"
          };
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="logo-svg"
        style={{
          filter: isHovered
            ? "drop-shadow(0 0 10px rgba(239, 132, 50, 0.6))"
            : "drop-shadow(0 0 4px rgba(239, 132, 50, 0.3))",
          transition: "filter 0.3s ease",
        }}
      >
        <defs>
          <linearGradient id="quillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#2c3e50", stopOpacity: 1 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: "#ef8432", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#2c3e50", stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>

        <g className="quill-pen">
          {/* Feather vanes */}
          <g className="feather-vanes">
            {/* Left side vanes - pointing backward/upward like real feathers */}
            <path
              d="M 45 35 Q 35 30, 38 25"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />
            <path
              d="M 46 40 Q 36 35, 39 30"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />
            <path
              d="M 47 45 Q 37 40, 40 35"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />
            <path
              d="M 48 50 Q 38 45, 41 40"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />
            <path
              d="M 48 55 Q 38 50, 41 45"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />

            {/* Right side vanes - pointing backward/upward like real feathers */}
            <path
              d="M 55 35 Q 65 30, 62 25"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />
            <path
              d="M 54 40 Q 64 35, 61 30"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />
            <path
              d="M 53 45 Q 63 40, 60 35"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />
            <path
              d="M 52 50 Q 62 45, 59 40"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />
            <path
              d="M 52 55 Q 62 50, 59 45"
              fill="none"
              stroke="url(#quillGradient)"
              strokeWidth="1.5"
            />
          </g>

          {/* Main quill shaft */}
          <line
            x1="50"
            y1="20"
            x2="50"
            y2="60"
            stroke="#2c3e50"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Nib */}
          <path d="M 50 60 L 48 75 L 50 78 L 52 75 Z" fill="#2c3e50" />

          {/* Nib split line */}
          <line
            x1="50"
            y1="60"
            x2="50"
            y2="75"
            stroke="#ef8432"
            strokeWidth="0.5"
          />

          {/* Ink dot */}
          <circle
            className="ink-dot"
            cx="50"
            cy="82"
            r="2"
            fill="#ef8432"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
}

export default AnimatedLogo;
