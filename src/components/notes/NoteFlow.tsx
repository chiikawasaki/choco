"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { Box, Button, Text } from "@chakra-ui/react";

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
  onConnectionDelete,
}: NoteFlowProps) {
  // ノードとエッジの状態管理
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        connectable: true, // 接続可能であることを明示
        selectable: true,
        deletable: false,
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
          markerEnd: undefined,
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
      // パラメータの検証
      if (!params.source || !params.target) {
        console.error("接続パラメータが不完全です:", params);
        return;
      }

      // 同じノードへの自己接続を防ぐ
      if (params.source === params.target) {
        console.log("自己接続は許可されていません");
        return;
      }

      // 既存のエッジと重複していないかチェック（双方向も含む）
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
        markerEnd: undefined, // 矢印を非表示
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

  // エッジの選択状態変更を検知
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge.id);
    setShowDeleteConfirm(true);
  }, []);

  // エッジの削除を実行
  const handleDeleteEdge = useCallback(() => {
    if (selectedEdge) {
      // エッジを削除
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge));

      // データベースからも削除
      onConnectionDelete?.(selectedEdge);

      // 状態をリセット
      setSelectedEdge(null);
      setShowDeleteConfirm(false);
    }
  }, [selectedEdge, setEdges, onConnectionDelete]);

  // 削除確認をキャンセル
  const handleCancelDelete = useCallback(() => {
    setSelectedEdge(null);
    setShowDeleteConfirm(false);
  }, []);

  // キーボードイベントでエッジを削除
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" && selectedEdge) {
        handleDeleteEdge();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedEdge, handleDeleteEdge]);

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
    edges: edges.length,
    selectedEdge,
    showDeleteConfirm,
  });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        connectOnClick={true}
        deleteKeyCode="Delete"
        snapToGrid={false}
        snapGrid={[15, 15]}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        selectionOnDrag={false}
        selectNodesOnDrag={false}
        defaultEdgeOptions={{
          type: "custom",
          markerEnd: undefined,
        }}
      >
        <Controls />
        <Background />
        <Box css={{ position: "absolute", bottom: "20px", right: "100px" }}>
          <MiniMap />
        </Box>
      </ReactFlow>

      {/* 削除確認UI */}
      {showDeleteConfirm && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.200"
          zIndex="1000"
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            関係性を削除しますか？
          </Text>
          <Text color="gray.600" mb={6}>
            この操作は取り消せません。
          </Text>
          <Box display="flex" gap={3} justifyContent="flex-end">
            <Button variant="outline" onClick={handleCancelDelete}>
              キャンセル
            </Button>
            <Button colorScheme="red" onClick={handleDeleteEdge}>
              削除
            </Button>
          </Box>
        </Box>
      )}
    </div>
  );
}
