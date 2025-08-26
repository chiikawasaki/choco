"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Text,
  Button,
  Spinner,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { Note, getUserNotes, deleteNote } from "@/lib/notes";
import { toaster } from "@/components/ui/toaster";

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // メモ一覧を取得
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await getUserNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      toaster.create({
        title: `エラー: ${
          error instanceof Error ? error.message : "メモの取得に失敗しました"
        }`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // メモを削除
  const handleDelete = async (id: string) => {
    if (!confirm("このメモを削除しますか？")) return;

    try {
      await deleteNote(id);
      toaster.create({
        title: "メモを削除しました",
        type: "success",
      });
      // 一覧を再取得
      fetchNotes();
    } catch (error) {
      toaster.create({
        title: `エラー: ${
          error instanceof Error ? error.message : "削除に失敗しました"
        }`,
        type: "error",
      });
    }
  };

  // コンポーネントマウント時にメモを取得
  useEffect(() => {
    fetchNotes();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <Spinner size="xl" color="#4338CA" />
      </Box>
    );
  }

  if (notes.length === 0) {
    return (
      <Box textAlign="center" p={8}>
        <Text color="gray.500" fontSize="lg">
          まだメモがありません。新しいメモを作成してみましょう！
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap={4} align="stretch" p={4}>
      <Text fontSize="xl" fontWeight="bold" textAlign="center" mb={4}>
        あなたのメモ一覧
      </Text>

      {notes.map((note) => (
        <Card.Root key={note.id} bg="white" shadow="md">
          <Card.Body>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              {note.title}
            </Text>
            <Text color="gray.600" mb={3} whiteSpace="pre-wrap">
              {note.content}
            </Text>
            <Text fontSize="sm" color="gray.400">
              作成日: {new Date(note.createdAt).toLocaleDateString("ja-JP")}
            </Text>
          </Card.Body>
          <Card.Footer>
            <HStack gap={2} ml="auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // TODO: 編集機能を実装
                  toaster.create({
                    title: "編集機能は準備中です",
                    type: "info",
                  });
                }}
              >
                編集
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={() => handleDelete(note.id)}
              >
                削除
              </Button>
            </HStack>
          </Card.Footer>
        </Card.Root>
      ))}
    </VStack>
  );
}
