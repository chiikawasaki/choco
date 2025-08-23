"use client";

import { memo } from "react";
import { EdgeProps, getBezierPath } from "reactflow";

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  // ベジェ曲線のパスを計算
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* メインの線 */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke="#4338CA"
        strokeWidth={2}
        fill="none"
        markerEnd="url(#arrowhead)"
      />

      {/* 矢印マーカー */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#4338CA" />
        </marker>
      </defs>

      {/* ラベル */}
      {data?.label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="react-flow__edge-text"
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            fill: "#4338CA",
            backgroundColor: "white",
            padding: "2px 6px",
            borderRadius: "4px",
            border: "1px solid #4338CA",
          }}
        >
          {data.label}
        </text>
      )}
    </>
  );
}

export default memo(CustomEdge);
