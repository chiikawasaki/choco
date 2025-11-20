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
} from "@chakra-ui/react";
import { AlignJustify, Ellipsis, Trash2 } from "lucide-react";
import { getUserNotes, deleteNote } from "@/lib/notes";
import { toaster } from "@/components/ui/toaster";
import Searchbar from "./Searchbar";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  // 検索でフィルタリング
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <Drawer.Root placement={"start"}>
      <Drawer.Trigger asChild>
        <AlignJustify size={25} style={{ cursor: "pointer" }} color="white" />
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content css={{ backgroundColor: "#FEFDF9", width: "400px" }}>
            <Box
              position="absolute"
              top="0"
              left="0"
              zIndex="1"
              bg="#7B544F"
              height="140px"
              width="106px"
              borderRadius="50px"
            />
            <Box
              position="absolute"
              top="0"
              left="106px"
              zIndex="1"
              bg="#7B544F"
              height="140px"
              width="106px"
              borderRadius="50px"
            />
            <Box
              position="absolute"
              top="0"
              left="212px"
              zIndex="1"
              bg="#7B544F"
              height="140px"
              width="108px"
              borderRadius="50px"
            />
            <Box
              bg="#7B544F"
              p={4}
              borderBottom="1px"
              borderColor="gray.300"
              zIndex="1000"
            >
              <HStack justify="space-between" mb={3}>
                <Drawer.CloseTrigger asChild>
                  <CloseButton
                    size="sm"
                    color="white"
                    _hover={{ bg: "transparent", color: "white" }}
                  />
                </Drawer.CloseTrigger>
              </HStack>

              {/* 検索バー */}
              <Box mt={8}>
                <Searchbar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="メモを検索..."
                  width="270px"
                />
              </Box>
            </Box>

            <Box p={4}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={8}>
                  <Spinner size="lg" color="#4338CA" />
                </Box>
              ) : filteredNotes.length === 0 ? (
                <Box textAlign="center" p={8}>
                  <Text color="gray.500" fontSize="lg">
                    {searchQuery
                      ? "検索結果がありません"
                      : "まだメモがありません"}
                  </Text>
                  <Text color="gray.400" fontSize="sm" mt={2}>
                    {searchQuery
                      ? "別のキーワードで検索してみてください"
                      : "新しいメモを作成してみましょう！"}
                  </Text>
                </Box>
              ) : (
                <VStack gap={3} align="stretch" maxH="70vh" overflowY="auto" mt={8}>
                  {filteredNotes.map((note) => (
                    <Box
                      key={note.id}
                      pb={3}
                      px={3}
                      bg="#FFDFE4"
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
                      <Box
                        position="relative"
                        mt={2}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        minHeight="80px"
                        pl={4}
                      >
                        <Box
                          position="absolute"
                          top="0"
                          right="0"
                          p={2}
                          zIndex={1}
                        >
                          <Ellipsis />
                        </Box>

                        <HStack
                          justify="flex-start"
                          alignItems="flex-start"
                          mb={2}
                          mt={10}
                          w="100%"
                        >
                          <Box mt={1} flexShrink={0}>
                            <AlignJustify
                              style={{ marginRight: "8px" }}
                              size={15}
                            />
                          </Box>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="normal"
                            wordBreak="break-word"
                            maxW="calc(100% - 30px)"
                          >
                            {note.title}
                          </Text>
                        </HStack>

                        <Text
                          fontSize="xs"
                          color="gray.600"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          textAlign="left"
                        >
                          {note.content}
                        </Text>
                      </Box>

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

              {selectedNote && (
                <Box mt={4} p={4} bg="#FFDFE4" borderRadius="md" shadow="md">
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
