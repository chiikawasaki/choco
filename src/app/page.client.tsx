"use client";

import { Button, Box, Spinner, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import Searchbar from "./Searchbar";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  getUserNotes,
  updateNotePosition,
  createNoteRelationship,
  deleteNoteRelationship,
} from "@/lib/notes";
import NoteFlow from "@/components/notes/NoteFlow";
import { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase-client";

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

type positionData = {
  positionX: number;
  positionY: number;
  zIndex: number;
};

interface HomeClientProps {
  user: User;
}

export default function HomeClient({ user }: HomeClientProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef<{ refreshNotes: () => void }>(null);
  const supabase = getSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleNoteUpdate = (noteId: string, data: positionData) => {
    if (Object.keys(data).length > 0) {
      updateNotePosition(noteId, {
        positionX: data.positionX || 0,
        positionY: data.positionY || 0,
        zIndex: data.zIndex || 0,
      })
        .then(() => {
          console.log("位置情報の保存が完了しました");
        })
        .catch((error) => {
          console.error("位置情報の保存に失敗:", error);
        });
    }
  };

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

  const handleMouseUp = () => {
    if (draggedNote) {
      const finalNote = notes.find((note) => note.id === draggedNote);
      if (finalNote) {
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

  const handleMouseLeave = () => {
    if (draggedNote) {
      console.log("マウスがウィンドウ外に出ました");
      setDraggedNote(null);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        setNotesLoading(true);
        const fetched = (await getUserNotes()) as Note[];

        setNotes((prev) =>
          fetched.map((note, i) => {
            const ex = prev.find((n) => n.id === note.id);
            return {
              ...note,
              positionX: ex?.positionX ?? note.positionX ?? i * 50,
              positionY: ex?.positionY ?? note.positionY ?? i * 50,
              zIndex: ex?.zIndex ?? note.zIndex ?? i,
            };
          })
        );
      } finally {
        if (!cancelled) setNotesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <Box
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ height: "100vh", overflow: "hidden", position: "relative" }}
    >
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex="1000"
        p={2}
        bg="#FFDFE4"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Sidebar ref={sidebarRef} />
          </Box>
          <Box display="flex" gap={4}>
            <Searchbar />
            <Button size="sm" variant="outline" onClick={handleSignOut}>
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
              handleNoteUpdate(noteId, data as positionData);
            }}
            onConnectionCreate={(sourceId, targetId) => {
              createNoteRelationship(sourceId, targetId);
            }}
            onConnectionDelete={(edgeId) => {
              deleteNoteRelationship(edgeId);
            }}
          />
        </Box>
      )}
    </Box>
  );
}
