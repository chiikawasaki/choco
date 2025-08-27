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
      />

      {/* クリックしやすい太い線（透明） */}
      <path
        id={`${id}-clickable`}
        className="react-flow__edge-path"
        d={edgePath}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        style={{ cursor: "pointer" }}
      />
    </>
  );
}

export default memo(CustomEdge);
