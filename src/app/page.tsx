"use client";

import { Button, Card, Box, Spinner, Text } from "@chakra-ui/react";
import { Plus, AlignJustify } from "lucide-react";
import Sidebar from "./Sidebar";
import Searchbar from "./Searchbar";
import { useAuth } from "@/hooks/useAuth";
import NoteForm from "@/components/notes/NoteForm";
import { useState, useRef, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import { getUserNotes, updateNotePosition } from "@/lib/notes";

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

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();

    // カードの現在位置を取得
    const currentNote = notes.find((note) => note.id === noteId);
    if (!currentNote) return;

    // マウス位置とカードの現在位置の差を計算
    const offsetX = e.clientX - currentNote.positionX;
    const offsetY = e.clientY - currentNote.positionY;

    console.log("ドラッグ開始:", {
      noteId,
      mouseX: e.clientX,
      mouseY: e.clientY,
      currentPositionX: currentNote.positionX,
      currentPositionY: currentNote.positionY,
      offsetX,
      offsetY,
    });

    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedNote(noteId);

    // ドラッグ中のメモを最前面に（位置は変更しない）
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? { ...note, zIndex: Math.max(...prev.map((n) => n.zIndex || 0)) + 1 }
          : note
      )
    );
  };

  // ドラッグ中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNote) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    console.log("ドラッグ中:", {
      draggedNote,
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: dragOffset.x,
      offsetY: dragOffset.y,
      newX,
      newY,
    });

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
      console.log("ドラッグ終了:", draggedNote);

      // 位置情報を永続化
      const finalNote = notes.find((note) => note.id === draggedNote);
      if (finalNote) {
        console.log("最終位置:", {
          id: finalNote.id,
          positionX: finalNote.positionX,
          positionY: finalNote.positionY,
          zIndex: finalNote.zIndex,
        });

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
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <AlignJustify
        size={25}
        style={{ position: "absolute", top: "6px", left: "10px" }}
      />
      <Sidebar ref={sidebarRef} />

      <Button
        size="sm"
        variant="outline"
        position="absolute"
        top="12px"
        right="20px"
        onClick={async () => {
          await supabase.auth.signOut();
        }}
      >
        ログアウト
      </Button>
      <Button
        size="sm"
        variant="subtle"
        bg="#4338CA"
        color="white"
        css={{ borderRadius: "30px", margin: "100px", padding: "15px 25px" }}
      >
        保存する
      </Button>
      <div
        style={{
          position: "relative",
          width: "300px",
          bottom: "225px",
          left: "70%",
        }}
      >
        <Searchbar />
      </div>
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
      <Box mt={8} mb={8}>
        <NoteForm onNoteCreated={handleNoteCreated} />
      </Box>

      {notesLoading ? (
        <Box display="flex" justifyContent="center" p={8}>
          <Spinner size="lg" color="#4338CA" />
        </Box>
      ) : notes.length === 0 ? (
        <Box textAlign="center" p={8}>
          <Text color="gray.500" fontSize="lg">
            まだメモがありません
          </Text>
          <Text color="gray.400" fontSize="sm" mt={2}>
            新しいメモを作成してみましょう！
          </Text>
        </Box>
      ) : (
        <Box position="relative" width="100%" height="calc(100vh - 200px)">
          {notes.map((note) => (
            <Box
              key={note.id}
              position="absolute"
              left={`${note.positionX}px`}
              top={`${note.positionY}px`}
              zIndex={note.zIndex}
              cursor={draggedNote === note.id ? "grabbing" : "grab"}
              onMouseDown={(e) => handleMouseDown(e, note.id)}
              style={{
                userSelect: "none",
                touchAction: "none",
              }}
            >
              <Card.Root width="320px" bg="pink">
                <Card.Body gap="2">
                  <Card.Title mt="2">{note.title}</Card.Title>
                  <Card.Description color="black">
                    {note.content}
                  </Card.Description>
                </Card.Body>
                <Card.Footer justifyContent="flex-end">
                  <Text fontSize="xs" color="gray.500">
                    {new Date(note.createdAt).toLocaleDateString("ja-JP")}
                  </Text>
                </Card.Footer>
              </Card.Root>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
