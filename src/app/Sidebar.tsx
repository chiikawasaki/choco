"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Drawer,
  Portal,
  CloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { AlignJustify, Trash2 } from "lucide-react";
import { getUserNotes, deleteNote } from "@/lib/notes";
import { toaster } from "@/components/ui/toaster";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface SidebarRef {
  refreshNotes: () => void;
}

const Sidebar = forwardRef<SidebarRef>((props, ref) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

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

  // 外部から呼び出せる関数を定義
  useImperativeHandle(ref, () => ({
    refreshNotes: fetchNotes,
  }));

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
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
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

  return (
    <Drawer.Root placement={"start"}>
      <Drawer.Trigger asChild>
        <AlignJustify size={25} style={{ cursor: "pointer" }} />
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content css={{ backgroundColor: "#e0f7fa", width: "400px" }}>
            <Box p={4}>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="xl" fontWeight="bold" color="#4338CA">
                  メモ一覧
                </Text>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </HStack>

              <Box borderBottom="1px" borderColor="gray.300" mb={4} />

              {loading ? (
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
                <VStack gap={3} align="stretch" maxH="70vh" overflowY="auto">
                  {notes.map((note) => (
                    <Box
                      key={note.id}
                      p={3}
                      bg="white"
                      borderRadius="md"
                      shadow="sm"
                      border="1px"
                      borderColor={
                        selectedNote?.id === note.id ? "#4338CA" : "gray.200"
                      }
                      cursor="pointer"
                      _hover={{
                        borderColor: "#4338CA",
                        shadow: "md",
                      }}
                      onClick={() => setSelectedNote(note)}
                    >
                      <HStack justify="space-between" mb={2}>
                        <Badge size="sm" colorScheme="blue">
                          {new Date(note.createdAt).toLocaleDateString("ja-JP")}
                        </Badge>
                      </HStack>
                      <Box
                        display="flex"
                        colorScheme="blue"
                        alignItems="center"
                      >
                        <AlignJustify
                          style={{ marginRight: "8px" }}
                          size={15}
                        />
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {note.title}
                        </Text>
                      </Box>

                      <Text
                        fontSize="xs"
                        color="gray.600"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        mb={2}
                      >
                        {note.content}
                      </Text>

                      <HStack gap={2} justify="flex-end">
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(note.id);
                          }}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}

              {/* 選択されたメモの詳細表示 */}
              {selectedNote && (
                <Box mt={4} p={4} bg="white" borderRadius="md" shadow="md">
                  <Text fontSize="lg" fontWeight="bold" mb={2} color="#4338CA">
                    {selectedNote.title}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    mb={3}
                    whiteSpace="pre-wrap"
                  >
                    {selectedNote.content}
                  </Text>
                  <HStack
                    justify="space-between"
                    fontSize="xs"
                    color="gray.400"
                  >
                    <Text>
                      作成日:{" "}
                      {new Date(selectedNote.createdAt).toLocaleDateString(
                        "ja-JP"
                      )}
                    </Text>
                    <Text>
                      更新日:{" "}
                      {new Date(selectedNote.updatedAt).toLocaleDateString(
                        "ja-JP"
                      )}
                    </Text>
                  </HStack>
                </Box>
              )}
            </Box>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
