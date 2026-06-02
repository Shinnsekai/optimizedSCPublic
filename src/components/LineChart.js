import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Polyline, Text as SvgText } from 'react-native-svg';

/**
 * Minimal SVG line chart with area fill.
 *
 * Props:
 *   data        [{label: string, value: number}]
 *   width       number
 *   height      number
 *   lineColor   string
 *   labelColor  string
 */
export default function LineChart({ data, width, height, lineColor, labelColor }) {
  if (!data || data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const LABEL_H = 18;
  const PAD_L = 6;
  const PAD_R = 6;
  const PAD_T = 8;

  const chartW = width - PAD_L - PAD_R;
  const chartH = height - PAD_T - LABEL_H;

  const maxV = Math.max(...data.map((d) => d.value), 1);
  const minV = 0;
  const range = maxV - minV || 1;

  const getX = (i) => PAD_L + (i / (data.length - 1)) * chartW;
  const getY = (v) => PAD_T + chartH - ((v - minV) / range) * chartH;

  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPath = [
    `M ${getX(0)} ${getY(data[0].value)}`,
    ...data.map((d, i) => `L ${getX(i)} ${getY(d.value)}`),
    `L ${getX(data.length - 1)} ${PAD_T + chartH}`,
    `L ${getX(0)} ${PAD_T + chartH}`,
    'Z',
  ].join(' ');

  // Show a label roughly every n points so they don't overlap
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Gradient area under the line */}
        <Path d={areaPath} fill={lineColor} opacity={0.13} />

        {/* Main line */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {data.map((d, i) => (
          <Circle key={i} cx={getX(i)} cy={getY(d.value)} r={2.5} fill={lineColor} />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <SvgText
              key={i}
              x={getX(i)}
              y={height - 3}
              textAnchor="middle"
              fill={labelColor}
              fontSize={9}
              fontWeight="400"
            >
              {d.label}
            </SvgText>
          ) : null
        )}
      </Svg>
    </View>
  );
}
