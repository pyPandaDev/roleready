import React from 'react';

interface RadarChartProps {
    data: { label: string; value: number; fullMark: number }[];
    size?: number;
    color?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({
    data,
    size = 300,
    color = "var(--color-success)"
}) => {
    const radius = size / 2;
    const center = size / 2;
    const numAxes = data.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Calculate coordinates
    const getCoordinates = (value: number, index: number, max: number) => {
        const angle = index * angleSlice - Math.PI / 2; // Start from top
        const r = (value / max) * (radius - 40); // Leave some padding
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    const points = data.map((d, i) => getCoordinates(d.value, i, d.fullMark));
    const pathData = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ') + " Z";

    // Grid levels (20%, 40%, 60%, 80%, 100%)
    const levels = [0.2, 0.4, 0.6, 0.8, 1];

    return (
        <div className="radar-chart-container" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ overflow: 'visible' }}>
                {/* Background Grid */}
                {levels.map((level, i) => {
                    const levelPoints = data.map((d, idx) => getCoordinates(d.fullMark * level, idx, d.fullMark));
                    const levelPath = levelPoints.map((p, idx) => (idx === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ') + " Z";
                    return (
                        <path
                            key={i}
                            d={levelPath}
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity={0.1}
                            style={{ color: 'var(--color-text-main)' }}
                        />
                    );
                })}

                {/* Axes */}
                {data.map((_, i) => {
                    const endPoint = getCoordinates(data[i].fullMark, i, data[i].fullMark);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={endPoint.x}
                            y2={endPoint.y}
                            stroke="currentColor"
                            strokeOpacity={0.1}
                            style={{ color: 'var(--color-text-main)' }}
                        />
                    );
                })}

                {/* Data Path */}
                <path
                    d={pathData}
                    fill={color}
                    fillOpacity={0.2}
                    stroke={color}
                    strokeWidth={2}
                    style={{ transition: 'all 1s ease-out' }}
                />

                {/* Labels */}
                {data.map((d, i) => {
                    const pos = getCoordinates(d.fullMark * 1.15, i, d.fullMark);
                    return (
                        <text
                            key={i}
                            x={pos.x}
                            y={pos.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="radar-label"
                        >
                            {d.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

export default RadarChart;
