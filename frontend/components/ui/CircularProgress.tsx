import React from 'react';

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ score, size = 160, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let strokeColor = "var(--color-danger)"; // rose
  if (score >= 60) strokeColor = "#f59e0b"; // amber - keep hex for now or use var
  if (score >= 85) strokeColor = "var(--color-success)"; // emerald

  return (
    <div className="circular-progress-container" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          style={{ color: 'var(--color-bg-subtle)' }}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="circular-text">
        <span className="score-value">{score}</span>
        <span className="score-label">Score</span>
      </div>
    </div>
  );
};

export default CircularProgress;
