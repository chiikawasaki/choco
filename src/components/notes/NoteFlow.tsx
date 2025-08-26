"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { Note, getNoteRelationships } from "@/lib/notes";
import NoteNode from "./NoteNode";
import CustomEdge from "./CustomEdge";
import { createNoteRelationship } from "@/lib/notes";
import { Box } from "@chakra-ui/react";

// カスタムノードタイプ
const nodeTypes = {
  noteNode: NoteNode,
};

// カスタムエッジタイプ
const edgeTypes = {
  custom: CustomEdge,
};

interface NoteFlowProps {
  notes: Note[];
  onNoteUpdate?: (noteId: string, data: Partial<Note>) => void;
  onConnectionCreate?: (sourceId: string, targetId: string) => void;
  onConnectionDelete?: (edgeId: string) => void;
}

export default function NoteFlow({
  notes,
  onNoteUpdate,
  onConnectionCreate,
  onConnectionDelete,
}: NoteFlowProps) {
  // ノードとエッジの状態管理
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // メモをノードに変換
  const noteNodes: Node[] = useMemo(() => {
    console.log("noteNodes作成開始:", notes);
    const nodes = notes.map((note) => {
      const node = {
        id: note.id,
        type: "noteNode",
        position: { x: note.positionX, y: note.positionY },
        data: {
          note,
          onUpdate: onNoteUpdate,
        },
        draggable: true,
        zIndex: note.zIndex,
      };
      console.log("ノード作成:", node);
      return node;
    });
    console.log("作成されたノード:", nodes);
    return nodes;
  }, [notes, onNoteUpdate]);

  // 初期化時にノードを設定
  useEffect(() => {
    setNodes(noteNodes);
  }, [noteNodes, setNodes, notes]);

  // 既存の関係性を読み込む
  useEffect(() => {
    const loadRelationships = async () => {
      try {
        const relationships = await getNoteRelationships();
        console.log("既存の関係性を読み込み:", relationships);

        const existingEdges: Edge[] = relationships.map((rel) => ({
          id: rel.id,
          source: rel.sourceNoteId,
          target: rel.targetNoteId,
          type: "custom",
          data: { label: rel.relationshipType },
        }));

        setEdges(existingEdges);
      } catch (error) {
        console.error("関係性の読み込みに失敗:", error);
      }
    };

    loadRelationships();
  }, [setEdges]);

  // エッジの接続処理
  const onConnect = useCallback(
    (params: Connection) => {
      console.log("新しい接続作成:", params);

      // 既存のエッジと重複していないかチェック
      const isDuplicate = edges.some(
        (edge) =>
          (edge.source === params.source && edge.target === params.target) ||
          (edge.source === params.target && edge.target === params.source)
      );

      if (isDuplicate) {
        console.log("重複する関係性が既に存在します");
        return;
      }

      // 新しいエッジを追加
      const newEdge: Edge = {
        id: `e${Date.now()}`,
        source: params.source!,
        target: params.target!,
        type: "custom",
        data: { label: "connection" },
      };

      setEdges((eds) => addEdge(newEdge, eds));

      // データベースに保存
      createNoteRelationship(params.source!, params.target!)
        .then(() => {
          console.log("関係性がデータベースに保存されました");
        })
        .catch((error) => {
          console.error("関係性の保存に失敗:", error);
          // エラーが発生した場合はエッジを削除
          setEdges((eds) => eds.filter((edge) => edge.id !== newEdge.id));
        });
    },
    [edges, createNoteRelationship]
  );

  // エッジの削除処理
  const onEdgeDelete = useCallback(
    (edgeId: string) => {
      onConnectionDelete?.(edgeId);
    },
    [onConnectionDelete]
  );

  // ノードの位置変更を検知
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log("ノード位置変更:", node.id, node.position);

      // 親コンポーネントに位置情報を通知
      onNoteUpdate?.(node.id, {
        positionX: node.position.x,
        positionY: node.position.y,
        zIndex: node.zIndex || 0,
      } as Partial<Note>);
    },
    [onNoteUpdate]
  );

  // ノードの選択状態変更を検知
  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    if (nodes.length > 0) {
      const selectedNode = nodes[0];
      console.log("ノード選択:", selectedNode.id, selectedNode.position);
    }
  }, []);

  console.log("NoteFlow render:", {
    notes: notes.length,
    nodes: nodes.length,
    noteNodes: noteNodes.length,
  });

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background />
        <Box css={{ position: "absolute", bottom: "20px", right: "100px" }}>
          <MiniMap />
        </Box>
      </ReactFlow>
    </div>
  );
}
