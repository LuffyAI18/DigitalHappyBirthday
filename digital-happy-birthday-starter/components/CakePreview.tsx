'use client';

import React from 'react';

// ---------------------------------------------------------------------------
// CakePreview — SVG birthday cake component
// ---------------------------------------------------------------------------
// Four shape variants: round, heart, sheet, tiered
// Configurable icing color (solid or gradient), candle count, toppings, size
// ---------------------------------------------------------------------------

export type CakeShape = 'round' | 'heart' | 'sheet' | 'tiered';
export type Topping = 'sprinkles' | 'cherries' | 'macarons' | 'fruit';

interface CakePreviewProps {
    shape?: CakeShape;
    icingColor?: string;
    icingGradient?: string; // second color for gradient icing
    candleCount?: number;
    showCandles?: boolean;
    toppings?: Topping[];
    size?: 'sm' | 'md' | 'lg';
}

export default function CakePreview({
    shape = 'round',
    icingColor = '#FF9CCF',
    icingGradient,
    candleCount = 5,
    showCandles = true,
    toppings = [],
    size = 'md',
}: CakePreviewProps) {
    const sizeMap = { sm: 200, md: 280, lg: 380 };
    const svgSize = sizeMap[size];
    const gradientId = `icing-grad-${shape}`;

    const renderCandles = () => {
        if (!showCandles || candleCount <= 0) return null;
        const maxCandles = Math.min(candleCount, 10);
        const candles = [];
        const spacing = 160 / (maxCandles + 1);
        const baseY = shape === 'tiered' ? 55 : 75;

        for (let i = 0; i < maxCandles; i++) {
            const x = 70 + spacing * (i + 1);
            candles.push(
                <g key={i}>
                    {/* Candle body */}
                    <rect
                        x={x - 3}
                        y={baseY}
                        width={6}
                        height={25}
                        rx={2}
                        fill="#FFE5B4"
                        stroke="#E8C67A"
                        strokeWidth={0.5}
                    />
                    {/* Flame */}
                    <ellipse cx={x} cy={baseY - 3} rx={4} ry={6} fill="#FF8C00" opacity={0.9}>
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
                    <ellipse cx={x} cy={baseY - 3} rx={2} ry={3} fill="#FFD700">
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

    const icingFill = icingGradient ? `url(#${gradientId})` : icingColor;

    const renderToppings = () => {
        if (toppings.length === 0) return null;
        const elements: React.ReactElement[] = [];

        if (toppings.includes('sprinkles')) {
            const sprinkleData = [
                { x: 105, y: 128, r: 30 }, { x: 120, y: 135, r: 90 },
                { x: 140, y: 130, r: 150 }, { x: 158, y: 133, r: 210 },
                { x: 175, y: 128, r: 270 }, { x: 190, y: 136, r: 330 },
                { x: 112, y: 142, r: 60 }, { x: 148, y: 140, r: 180 },
                { x: 165, y: 145, r: 300 }, { x: 130, y: 148, r: 120 },
            ];
            sprinkleData.forEach((s, i) => {
                elements.push(
                    <rect
                        key={`sprinkle-${i}`}
                        x={s.x}
                        y={s.y - (shape === 'tiered' ? 20 : 0)}
                        width={4}
                        height={2}
                        rx={1}
                        fill={`hsl(${s.r}, 80%, 65%)`}
                        transform={`rotate(${s.r}, ${s.x + 2}, ${s.y + 1})`}
                    />
                );
            });
        }

        if (toppings.includes('cherries')) {
            const cherryPositions = [
                { x: 115, y: 118 }, { x: 145, y: 115 },
                { x: 175, y: 118 }, { x: 130, y: 112 }, { x: 160, y: 112 },
            ];
            cherryPositions.forEach((c, i) => {
                const yOffset = shape === 'tiered' ? -20 : 0;
                elements.push(
                    <g key={`cherry-${i}`}>
                        <circle cx={c.x} cy={c.y + yOffset} r={4} fill="#DC143C" />
                        <circle cx={c.x - 1} cy={c.y + yOffset - 1} r={1.5} fill="#FF6B6B" opacity={0.6} />
                        <path
                            d={`M${c.x},${c.y + yOffset - 4} Q${c.x + 3},${c.y + yOffset - 10} ${c.x + 5},${c.y + yOffset - 8}`}
                            fill="none"
                            stroke="#228B22"
                            strokeWidth={1}
                            strokeLinecap="round"
                        />
                    </g>
                );
            });
        }

        if (toppings.includes('macarons')) {
            const macaronColors = ['#FFB6C1', '#B0E0E6', '#FFDAB9', '#E6E6FA', '#98FB98'];
            const positions = [
                { x: 115, y: 112 }, { x: 135, y: 108 },
                { x: 155, y: 112 }, { x: 175, y: 108 }, { x: 145, y: 105 },
            ];
            positions.forEach((p, i) => {
                const yOffset = shape === 'tiered' ? -20 : 0;
                elements.push(
                    <g key={`macaron-${i}`}>
                        <ellipse cx={p.x} cy={p.y + yOffset} rx={6} ry={4} fill={macaronColors[i]} />
                        <rect x={p.x - 5} y={p.y + yOffset - 1} width={10} height={2} rx={1} fill="#FFFDD0" />
                        <ellipse cx={p.x} cy={p.y + yOffset} rx={6} ry={4} fill="none" stroke={macaronColors[i]} strokeWidth={0.5} opacity={0.5} />
                    </g>
                );
            });
        }

        if (toppings.includes('fruit')) {
            const fruitData = [
                { x: 110, y: 115, emoji: '🍓', size: 8 },
                { x: 130, y: 110, emoji: '🫐', size: 6 },
                { x: 150, y: 113, emoji: '🍊', size: 7 },
                { x: 170, y: 110, emoji: '🍓', size: 8 },
                { x: 190, y: 115, emoji: '🫐', size: 6 },
            ];
            fruitData.forEach((f, i) => {
                const yOffset = shape === 'tiered' ? -20 : 0;
                elements.push(
                    <text
                        key={`fruit-${i}`}
                        x={f.x}
                        y={f.y + yOffset}
                        fontSize={f.size}
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        {f.emoji}
                    </text>
                );
            });
        }

        return elements;
    };

    const renderCakeBody = () => {
        switch (shape) {
            case 'tiered':
                return (
                    <g>
                        {/* Plate / shadow */}
                        <ellipse cx={150} cy={185} rx={90} ry={12} fill="#E8E8E8" opacity={0.3} />

                        {/* Bottom tier */}
                        <rect x={70} y={145} width={160} height={40} rx={8} fill="#FFF5EE" stroke="#F0D0B0" strokeWidth={1} />
                        <ellipse cx={150} cy={145} rx={80} ry={10} fill={icingFill} opacity={0.8} />
                        <path
                            d="M75,155 Q85,162 95,155 Q105,162 115,155 Q125,162 135,155 Q145,162 155,155 Q165,162 175,155 Q185,162 195,155 Q205,162 215,155 Q225,162 225,155"
                            fill="none" stroke={icingFill} strokeWidth={2} strokeLinecap="round"
                        />

                        {/* Middle tier */}
                        <rect x={90} y={110} width={120} height={38} rx={6} fill="#FFFFFF" stroke={icingColor} strokeWidth={1} />
                        <ellipse cx={150} cy={110} rx={60} ry={8} fill={icingFill} opacity={0.85} />
                        <path
                            d="M95,118 Q102,125 110,118 Q118,125 126,118 Q134,125 142,118 Q150,125 158,118 Q166,125 174,118 Q182,125 190,118 Q198,125 205,118"
                            fill="none" stroke={icingFill} strokeWidth={2} strokeLinecap="round"
                        />

                        {/* Top tier */}
                        <rect x={112} y={80} width={76} height={33} rx={5} fill="#FFFFFF" stroke={icingColor} strokeWidth={1.5} />
                        <ellipse cx={150} cy={80} rx={38} ry={7} fill={icingFill} opacity={0.9} />
                        <path
                            d="M115,88 Q122,95 130,88 Q138,95 146,88 Q154,95 162,88 Q170,95 178,88 Q185,92 185,88"
                            fill="none" stroke={icingFill} strokeWidth={2.5} strokeLinecap="round"
                        />
                    </g>
                );
            case 'heart':
                return (
                    <g>
                        {/* Heart-shaped cake base */}
                        <path
                            d="M150,180 C150,180 80,140 80,115 C80,90 105,85 125,100 C135,108 145,120 150,130 C155,120 165,108 175,100 C195,85 220,90 220,115 C220,140 150,180 150,180Z"
                            fill="#FFF0F5"
                            stroke={icingFill}
                            strokeWidth={2}
                        />
                        {/* Icing drips */}
                        <path
                            d="M90,118 Q95,130 100,118 Q110,132 115,120 Q125,135 130,122 Q140,138 145,125 Q150,140 155,125 Q160,138 165,122 Q175,135 180,120 Q185,130 190,118 Q200,128 205,115"
                            fill="none"
                            stroke={icingFill}
                            strokeWidth={3}
                            strokeLinecap="round"
                        />
                        {/* Cake layers */}
                        <ellipse cx={150} cy={155} rx={55} ry={8} fill={icingFill} opacity={0.3} />
                    </g>
                );
            case 'sheet':
                return (
                    <g>
                        {/* Sheet cake top */}
                        <rect
                            x={70} y={100} width={160} height={70} rx={8}
                            fill="#FFF5EE" stroke={icingFill} strokeWidth={2}
                        />
                        {/* Icing layer */}
                        <rect
                            x={70} y={100} width={160} height={25} rx={8}
                            fill={icingFill} opacity={0.7}
                        />
                        {/* Decorative border */}
                        <path
                            d="M75,125 Q85,132 95,125 Q105,132 115,125 Q125,132 135,125 Q145,132 155,125 Q165,132 175,125 Q185,132 195,125 Q205,132 215,125 Q225,132 225,125"
                            fill="none" stroke={icingFill} strokeWidth={2} strokeLinecap="round"
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
                        <rect x={80} y={120} width={140} height={50} rx={10} fill="#FFF5EE" stroke="#F0D0B0" strokeWidth={1} />
                        <ellipse cx={150} cy={120} rx={70} ry={12} fill="#FFF5EE" stroke="#F0D0B0" strokeWidth={1} />

                        {/* Top layer */}
                        <rect x={95} y={95} width={110} height={30} rx={8} fill="#FFFFFF" stroke={icingColor} strokeWidth={1.5} />
                        <ellipse cx={150} cy={95} rx={55} ry={10} fill={icingFill} opacity={0.8} />

                        {/* Icing drips */}
                        <path
                            d="M95,105 Q100,115 105,105 Q112,118 118,105 Q125,120 132,105 Q140,118 148,105 Q155,120 162,105 Q168,118 175,105 Q182,115 188,105 Q195,118 200,105 Q205,112 205,105"
                            fill="none" stroke={icingFill} strokeWidth={2.5} strokeLinecap="round"
                        />
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
            {/* Gradient definition */}
            {icingGradient && (
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={icingColor} />
                        <stop offset="100%" stopColor={icingGradient} />
                    </linearGradient>
                </defs>
            )}
            {renderCakeBody()}
            {renderToppings()}
            {renderCandles()}
        </svg>
    );
}
