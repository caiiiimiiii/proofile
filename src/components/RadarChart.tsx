"use client";

import { useEffect, useRef } from "react";
import type { RadarDimension } from "@/lib/radar";

type Props = {
  dimensions: RadarDimension[];
};

export function RadarChart({ dimensions }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !dimensions.length) return;

    let chart: import("echarts").ECharts | null = null;

    import("echarts").then((echarts) => {
      if (!ref.current) return;
      chart = echarts.init(ref.current);

      chart.setOption({
        radar: {
          indicator: dimensions.map((d) => ({ name: d.name, max: 100 })),
          radius: "65%",
          axisName: { color: "#52525b", fontSize: 12 },
          splitLine: { lineStyle: { color: "#e4e4e7" } },
          splitArea: { show: false },
          axisLine: { lineStyle: { color: "#e4e4e7" } },
        },
        series: [
          {
            type: "radar",
            data: [
              {
                value: dimensions.map((d) => d.value),
                name: "能力评分",
                areaStyle: { color: "rgba(24,24,27,0.08)" },
                lineStyle: { color: "#18181b", width: 2 },
                itemStyle: { color: "#18181b" },
              },
            ],
          },
        ],
        tooltip: {
          trigger: "item",
          formatter: (params: unknown) => {
            const p = params as { value: number[] };
            return dimensions
              .map((d, i) => `${d.name}：${p.value[i]}`)
              .join("<br/>");
          },
        },
      });
    });

    const observer = new ResizeObserver(() => chart?.resize());
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      chart?.dispose();
    };
  }, [dimensions]);

  return <div ref={ref} className="h-64 w-full" />;
}
