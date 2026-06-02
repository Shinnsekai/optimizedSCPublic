import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

/**
 * Minimal SVG bar chart.
 *
 * Props:
 *   data          [{label: string, value: number, highlight?: boolean}]
 *   width         number
 *   height        number  (includes label row at the bottom)
 *   barColor      string  (hex / rgba)
 *   labelColor    string
 */
export default function BarChart({ data, width, height, barColor, labelColor }) {
  if (!data || data.length === 0) {
    return <View style={{ width, height }} />;
  }

  const LABEL_H = 18;
  const PAD_H = 6;
  const PAD_T = 4;

  const chartH = height - LABEL_H - PAD_T;
  const usableW = width - PAD_H * 2;
  const slotW = usableW / data.length;
  const barW = Math.max(slotW * 0.55, 4);
  const barPad = (slotW - barW) / 2;

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {data.map((item, i) => {
          const barH = Math.max((item.value / maxVal) * chartH, item.value > 0 ? 3 : 0);
          const x = PAD_H + i * slotW + barPad;
          const y = PAD_T + chartH - barH;
          const opacity = item.highlight ? 1 : 0.45;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={3}
                fill={barColor}
                opacity={opacity}
              />
              <SvgText
                x={x + barW / 2}
                y={height - 3}
                textAnchor="middle"
                fill={labelColor}
                fontSize={9}
                fontWeight="400"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
