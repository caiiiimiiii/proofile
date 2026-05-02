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
    let disposed = false;

    void import("echarts").then((echarts) => {
      if (!ref.current || disposed) return;

      chart = echarts.init(ref.current);
      chart.setOption({
        radar: {
          indicator: dimensions.map((dimension) => ({
            name: dimension.name,
            max: 100,
          })),
          radius: "65%",
          axisName: {
            color: "#6f6256",
            fontSize: 12,
            fontFamily: "Trebuchet MS, Aptos, Segoe UI, sans-serif",
          },
          splitLine: { lineStyle: { color: "rgba(36, 29, 24, 0.12)" } },
          splitArea: {
            areaStyle: {
              color: [
                "rgba(145, 87, 66, 0.02)",
                "rgba(70, 87, 75, 0.02)",
              ],
            },
          },
          axisLine: { lineStyle: { color: "rgba(36, 29, 24, 0.12)" } },
        },
        series: [
          {
            type: "radar",
            data: [
              {
                value: dimensions.map((dimension) => dimension.value),
                name: "能力评分",
                areaStyle: { color: "rgba(145, 87, 66, 0.16)" },
                lineStyle: { color: "#915742", width: 2 },
                itemStyle: { color: "#46574b" },
              },
            ],
          },
        ],
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(255, 250, 244, 0.96)",
          borderColor: "rgba(36, 29, 24, 0.12)",
          textStyle: {
            color: "#241d18",
            fontFamily: "Trebuchet MS, Aptos, Segoe UI, sans-serif",
          },
          formatter: (params: unknown) => {
            const current = params as { value: number[] };
            return dimensions
              .map((dimension, index) => `${dimension.name}：${current.value[index]}`)
              .join("<br/>");
          },
        },
      });
    });

    const observer = new ResizeObserver(() => chart?.resize());
    observer.observe(ref.current);

    return () => {
      disposed = true;
      observer.disconnect();
      chart?.dispose();
    };
  }, [dimensions]);

  return <div ref={ref} className="h-72 w-full" />;
}
