"use client";

import { Button, Box, Spinner, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import Searchbar from "./Searchbar";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import Link from "next/link";
import {
  getUserNotes,
  updateNotePosition,
  createNoteRelationship,
  deleteNoteRelationship,
} from "@/lib/notes";
import NoteFlow from "@/components/notes/NoteFlow";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  positionX: number;
  positionY: number;
  zIndex: number;
};

export default function Home() {
  const { user, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef<{ refreshNotes: () => void }>(null);

  const supabase = getSupabaseClient();

  // メモ一覧を取得
  const fetchNotes = async () => {
    try {
      setNotesLoading(true);
      const fetchedNotes = (await getUserNotes()) as Note[];
      // 位置情報がない場合のみデフォルト値を設定
      const notesWithPosition = fetchedNotes.map((note, index) => {
        // 既存の位置情報がある場合は保持、ない場合のみデフォルト値を設定
        const existingPosition = notes.find((n) => n.id === note.id);
        return {
          ...note,
          positionX:
            note.positionX || existingPosition?.positionX || index * 50,
          positionY:
            note.positionY || existingPosition?.positionY || index * 50,
          zIndex: note.zIndex || existingPosition?.zIndex || index,
        };
      });
      setNotes(notesWithPosition);
    } catch (error) {
      console.error("メモの取得に失敗しました:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  // メモ作成後に一覧を更新
  const handleNoteCreated = () => {
    setRefreshKey((prev) => prev + 1);
    // サイドバーも更新
    if (sidebarRef.current) {
      sidebarRef.current.refreshNotes();
    }
    // メモ一覧も更新
    fetchNotes();
  };

  // ドラッグ中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNote) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === draggedNote
          ? {
              ...note,
              positionX: newX,
              positionY: newY,
            }
          : note
      )
    );
  };

  // ドラッグ終了
  const handleMouseUp = () => {
    if (draggedNote) {
      // 位置情報を永続化
      const finalNote = notes.find((note) => note.id === draggedNote);
      if (finalNote) {
        // データベースに位置情報を保存
        updateNotePosition(finalNote.id, {
          positionX: finalNote.positionX,
          positionY: finalNote.positionY,
          zIndex: finalNote.zIndex,
        }).catch((error) => {
          console.error("位置情報の保存に失敗:", error);
        });
      }

      setDraggedNote(null);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // マウスがウィンドウ外に出た場合の処理
  const handleMouseLeave = () => {
    if (draggedNote) {
      console.log("マウスがウィンドウ外に出ました");
      setDraggedNote(null);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // コンポーネントマウント時にメモを取得
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, refreshKey]);

  // ローディング中はスピナーを表示
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Spinner size="xl" color="#4338CA" />
        <Text mt={4} color="gray.600">
          認証中...
        </Text>
      </Box>
    );
  }

  // ユーザーがログインしていない場合はリダイレクト中
  if (!user) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Spinner size="xl" color="#4338CA" />
        <Text mt={4} color="gray.600">
          ログインページにリダイレクト中...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ height: "100vh", overflow: "hidden", position: "relative" }}
    >
      <Box position="fixed" top="0" left="0" right="0" zIndex="1000" p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Sidebar ref={sidebarRef} />
          </Box>
          <Box display="flex" gap={4}>
            <Searchbar />
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              ログアウト
            </Button>
            <Link href="/post">
              <Button
                size="sm"
                bg="#4338CA"
                color="white"
                borderRadius="30px"
                padding="15px 25px"
              >
                新規作成
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
      <Box position="fixed" bottom="20px" right="20px" zIndex="999">
        <Link href="/post">
          <Button
            bg="#4338CA"
            css={{
              position: "fixed",
              bottom: "5%",
              right: "2%",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
            }}
          >
            <Plus color="white" />
          </Button>
        </Link>
      </Box>

      {notesLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Spinner size="xl" color="#4338CA" />
        </Box>
      ) : notes.length === 0 ? (
        <Box
          textAlign="center"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Text color="gray.500" fontSize="lg">
            まだメモがありません
          </Text>
          <Text color="gray.400" fontSize="sm" mt={2}>
            新しいメモを作成してみましょう！
          </Text>
        </Box>
      ) : (
        <Box
          css={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
          }}
        >
          <NoteFlow
            notes={notes}
            onNoteUpdate={(noteId, data) => {
              // 位置情報をDBに保存
              const positionData: {
                positionX?: number;
                positionY?: number;
                zIndex?: number;
              } = {};
              if ("positionX" in data && data.positionX !== undefined)
                positionData.positionX = data.positionX as number;
              if ("positionY" in data && data.positionY !== undefined)
                positionData.positionY = data.positionY as number;
              if ("zIndex" in data && data.zIndex !== undefined)
                positionData.zIndex = data.zIndex as number;

              if (Object.keys(positionData).length > 0) {
                updateNotePosition(noteId, {
                  positionX: positionData.positionX || 0,
                  positionY: positionData.positionY || 0,
                  zIndex: positionData.zIndex || 0,
                })
                  .then(() => {
                    console.log("位置情報の保存が完了しました");
                  })
                  .catch((error) => {
                    console.error("位置情報の保存に失敗:", error);
                  });
              }
            }}
            onConnectionCreate={(sourceId, targetId) => {
              // 関係性をDBに保存
              createNoteRelationship(sourceId, targetId);
            }}
            onConnectionDelete={(edgeId) => {
              // 関係性をDBから削除
              deleteNoteRelationship(edgeId);
            }}
          />
        </Box>
      )}
    </Box>
  );
}
