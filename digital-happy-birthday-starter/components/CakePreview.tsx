'use client';

import React from 'react';

// ---------------------------------------------------------------------------
// CakePreview — SVG birthday cake component
// ---------------------------------------------------------------------------
// Three shape variants: round, heart, sheet
// Configurable icing color, candle count, and size
// ---------------------------------------------------------------------------

interface CakePreviewProps {
    shape?: 'round' | 'heart' | 'sheet';
    icingColor?: string;
    candleCount?: number;
    showCandles?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function CakePreview({
    shape = 'round',
    icingColor = '#FF9CCF',
    candleCount = 5,
    showCandles = true,
    size = 'md',
}: CakePreviewProps) {
    const sizeMap = { sm: 200, md: 280, lg: 380 };
    const svgSize = sizeMap[size];

    const renderCandles = () => {
        if (!showCandles || candleCount <= 0) return null;
        const maxCandles = Math.min(candleCount, 10);
        const candles = [];
        const spacing = 160 / (maxCandles + 1);

        for (let i = 0; i < maxCandles; i++) {
            const x = 70 + spacing * (i + 1);
            candles.push(
                <g key={i}>
                    {/* Candle body */}
                    <rect
                        x={x - 3}
                        y={75}
                        width={6}
                        height={25}
                        rx={2}
                        fill="#FFE5B4"
                        stroke="#E8C67A"
                        strokeWidth={0.5}
                    />
                    {/* Flame */}
                    <ellipse cx={x} cy={72} rx={4} ry={6} fill="#FF8C00" opacity={0.9}>
                        <animate
                            attributeName="ry"
                            values="6;7;5;6"
                            dur="0.8s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="opacity"
                            values="0.9;1;0.7;0.9"
                            dur="0.6s"
                            repeatCount="indefinite"
                        />
                    </ellipse>
                    <ellipse cx={x} cy={72} rx={2} ry={3} fill="#FFD700">
                        <animate
                            attributeName="ry"
                            values="3;4;2;3"
                            dur="0.7s"
                            repeatCount="indefinite"
                        />
                    </ellipse>
                </g>
            );
        }
        return candles;
    };

    const renderCakeBody = () => {
        switch (shape) {
            case 'heart':
                return (
                    <g>
                        {/* Heart-shaped cake base */}
                        <path
                            d="M150,180 C150,180 80,140 80,115 C80,90 105,85 125,100 C135,108 145,120 150,130 C155,120 165,108 175,100 C195,85 220,90 220,115 C220,140 150,180 150,180Z"
                            fill="#FFF0F5"
                            stroke={icingColor}
                            strokeWidth={2}
                        />
                        {/* Icing drips */}
                        <path
                            d="M90,118 Q95,130 100,118 Q110,132 115,120 Q125,135 130,122 Q140,138 145,125 Q150,140 155,125 Q160,138 165,122 Q175,135 180,120 Q185,130 190,118 Q200,128 205,115"
                            fill="none"
                            stroke={icingColor}
                            strokeWidth={3}
                            strokeLinecap="round"
                        />
                        {/* Cake layers */}
                        <ellipse cx={150} cy={155} rx={55} ry={8} fill={icingColor} opacity={0.3} />
                    </g>
                );
            case 'sheet':
                return (
                    <g>
                        {/* Sheet cake top */}
                        <rect
                            x={70}
                            y={100}
                            width={160}
                            height={70}
                            rx={8}
                            fill="#FFF5EE"
                            stroke={icingColor}
                            strokeWidth={2}
                        />
                        {/* Icing layer */}
                        <rect
                            x={70}
                            y={100}
                            width={160}
                            height={25}
                            rx={8}
                            fill={icingColor}
                            opacity={0.7}
                        />
                        {/* Decorative border */}
                        <path
                            d="M75,125 Q85,132 95,125 Q105,132 115,125 Q125,132 135,125 Q145,132 155,125 Q165,132 175,125 Q185,132 195,125 Q205,132 215,125 Q225,132 225,125"
                            fill="none"
                            stroke={icingColor}
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                        {/* Plate */}
                        <ellipse cx={150} cy={175} rx={90} ry={10} fill="#E8E8E8" opacity={0.5} />
                    </g>
                );
            default: // round
                return (
                    <g>
                        {/* Bottom layer */}
                        <ellipse cx={150} cy={170} rx={80} ry={15} fill="#E8E8E8" opacity={0.3} />
                        <rect
                            x={80}
                            y={120}
                            width={140}
                            height={50}
                            rx={10}
                            fill="#FFF5EE"
                            stroke="#F0D0B0"
                            strokeWidth={1}
                        />
                        <ellipse cx={150} cy={120} rx={70} ry={12} fill="#FFF5EE" stroke="#F0D0B0" strokeWidth={1} />

                        {/* Top layer */}
                        <rect
                            x={95}
                            y={95}
                            width={110}
                            height={30}
                            rx={8}
                            fill="#FFFFFF"
                            stroke={icingColor}
                            strokeWidth={1.5}
                        />
                        <ellipse cx={150} cy={95} rx={55} ry={10} fill={icingColor} opacity={0.8} />

                        {/* Icing drips */}
                        <path
                            d="M95,105 Q100,115 105,105 Q112,118 118,105 Q125,120 132,105 Q140,118 148,105 Q155,120 162,105 Q168,118 175,105 Q182,115 188,105 Q195,118 200,105 Q205,112 205,105"
                            fill="none"
                            stroke={icingColor}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                        />

                        {/* Sprinkles */}
                        {[
                            { x: 110, y: 135, r: 40 },
                            { x: 130, y: 140, r: 120 },
                            { x: 155, y: 138, r: 200 },
                            { x: 175, y: 132, r: 300 },
                            { x: 190, y: 142, r: 60 },
                        ].map((s, i) => (
                            <rect
                                key={i}
                                x={s.x}
                                y={s.y}
                                width={4}
                                height={2}
                                rx={1}
                                fill={`hsl(${s.r}, 80%, 65%)`}
                                transform={`rotate(${s.r}, ${s.x + 2}, ${s.y + 1})`}
                            />
                        ))}
                    </g>
                );
        }
    };

    return (
        <svg
            viewBox="0 0 300 220"
            width={svgSize}
            height={svgSize * 0.73}
            className="drop-shadow-xl"
            aria-label={`Birthday cake - ${shape} shape with ${icingColor} icing`}
        >
            {renderCakeBody()}
            {renderCandles()}
        </svg>
    );
}
