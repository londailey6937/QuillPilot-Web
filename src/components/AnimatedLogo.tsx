import React, { useState } from "react";

interface AnimatedLogoProps {
  size?: number;
  animate?: boolean;
}

/**
 * AnimatedLogo - Tech-forward line-drawn AI/neural network icon for TomeIQ
 *
 * Features:
 * - Neural network node connections
 * - Pulsing energy flow through connections
 * - Geometric line art design
 * - Rotating hexagon frame
 * - Glowing effects on hover
 * - Purple/cyan tech gradient
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
      }}
    >
      <style>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-node {
          0%, 100% {
            r: 3;
            opacity: 1;
          }
          50% {
            r: 4;
            opacity: 0.7;
          }
        }

        @keyframes flow-1 {
          0% {
            stroke-dashoffset: 100;
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.3;
          }
        }

        @keyframes flow-2 {
          0% {
            stroke-dashoffset: 100;
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.3;
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.8));
          }
        }

        .hexagon-outer {
          animation: ${animate ? "rotate 5s linear infinite" : "none"};
          transform-origin: 50px 50px;
        }

        .hexagon-inner {
          animation: ${animate ? "rotate 4s linear infinite reverse" : "none"};
          transform-origin: 50px 50px;
        }

        .node {
          animation: ${
            animate ? "pulse-node 0.8s ease-in-out infinite" : "none"
          };
        }

        .node-1 { animation-delay: 0s; }
        .node-2 { animation-delay: 0.2s; }
        .node-3 { animation-delay: 0.4s; }
        .node-4 { animation-delay: 0.6s; }
        .node-5 { animation-delay: 0.8s; }

        .connection-flow {
          stroke-dasharray: 5 5;
          animation: ${animate ? "flow-1 1s linear infinite" : "none"};
        }

        .connection-flow-alt {
          stroke-dasharray: 5 5;
          animation: ${animate ? "flow-2 1s linear infinite" : "none"};
          animation-delay: 0.5s;
        }

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
          <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#f7e6d0", stopOpacity: 0.95 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: "#ef8432", stopOpacity: 0.9 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#2c3e50", stopOpacity: 0.95 }}
            />
          </linearGradient>

          <linearGradient
            id="connectionGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "#f7e6d0", stopOpacity: 0.7 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#ef8432", stopOpacity: 0.7 }}
            />
          </linearGradient>
        </defs>

        {/* Outer hexagon frame */}
        <g className="hexagon-outer">
          <path
            d="M 50 15 L 73 28 L 73 54 L 50 67 L 27 54 L 27 28 Z"
            fill="none"
            stroke="#ef8432"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </g>

        {/* Inner hexagon frame */}
        <g className="hexagon-inner">
          <path
            d="M 50 25 L 65 33 L 65 49 L 50 57 L 35 49 L 35 33 Z"
            fill="none"
            stroke="#2c3e50"
            strokeWidth="1"
            opacity="0.6"
          />
        </g>

        {/* Neural network connections */}
        <g opacity="0.7">
          {/* Horizontal connections */}
          <line
            className="connection-flow"
            x1="35"
            y1="50"
            x2="65"
            y2="50"
            stroke="#ef8432"
            strokeWidth="1.2"
          />

          {/* Diagonal connections */}
          <line
            className="connection-flow-alt"
            x1="42"
            y1="38"
            x2="58"
            y2="62"
            stroke="#2c3e50"
            strokeWidth="1"
          />
          <line
            className="connection-flow"
            x1="58"
            y1="38"
            x2="42"
            y2="62"
            stroke="#2c3e50"
            strokeWidth="1"
          />

          {/* Radial connections from center */}
          <line
            className="connection-flow"
            x1="50"
            y1="50"
            x2="35"
            y2="35"
            stroke="#ef8432"
            strokeWidth="1"
          />
          <line
            className="connection-flow-alt"
            x1="50"
            y1="50"
            x2="65"
            y2="35"
            stroke="#ef8432"
            strokeWidth="1"
          />
          <line
            className="connection-flow"
            x1="50"
            y1="50"
            x2="65"
            y2="65"
            stroke="#ef8432"
            strokeWidth="1"
          />
          <line
            className="connection-flow-alt"
            x1="50"
            y1="50"
            x2="35"
            y2="65"
            stroke="#ef8432"
            strokeWidth="1"
          />
        </g>

        {/* Neural nodes */}
        <circle className="node node-1" cx="50" cy="50" r="3" fill="#ef8432" />
        <circle
          className="node node-2"
          cx="35"
          cy="35"
          r="2.5"
          fill="#2c3e50"
        />
        <circle
          className="node node-3"
          cx="65"
          cy="35"
          r="2.5"
          fill="#2c3e50"
        />
        <circle
          className="node node-4"
          cx="65"
          cy="65"
          r="2.5"
          fill="#2c3e50"
        />
        <circle
          className="node node-5"
          cx="35"
          cy="65"
          r="2.5"
          fill="#2c3e50"
        />

        {/* Central intelligence core */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="none"
          stroke="#ef8432"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Inner core glow */}
        {isHovered && (
          <circle cx="50" cy="50" r="6" fill="rgba(239, 132, 50, 0.3)">
            <animate
              attributeName="r"
              values="6;8;6"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.6;0.3"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>
    </div>
  );
}
