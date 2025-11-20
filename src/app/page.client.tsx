"use client";

import {
  Button,
  Box,
  Spinner,
  Text,
  CloseButton,
  Image,
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Note,
  getUserNotes,
  updateNotePosition,
  deleteNoteRelationship,
} from "@/lib/notes";
import NoteFlow from "@/components/notes/NoteFlow";
import { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase-client";
import {
  Sticker,
  CanvasSticker,
  getStickers,
  getCanvasStickers,
  createCanvasSticker,
  updateCanvasSticker,
  deleteCanvasSticker,
} from "@/lib/stickers";
import { StickerPanel } from "@/components/notes/StickerPanel";
import { toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";
import type { Viewport } from "reactflow";

const MotionDiv = motion.div;

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
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [canvasStickers, setCanvasStickers] = useState<CanvasSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null
  );
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const sidebarRef = useRef<{ refreshNotes: () => void }>(null);
  const canvasLayerRef = useRef<HTMLDivElement | null>(null);
  const supabase = getSupabaseClient();
  const DEFAULT_STICKER_SIZE = 90;

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

  const handleStickerSelect = (stickerId: string) => {
    setSelectedStickerId((prev) => (prev === stickerId ? null : stickerId));
  };

  const handleStickerClear = () => {
    setSelectedStickerId(null);
  };

  const handleCanvasStickerAdd = useCallback(
    async (position: { x: number; y: number }) => {
      if (!selectedStickerId) {
        setActiveStickerId(null);
        return;
      }

      const positionX = position.x - DEFAULT_STICKER_SIZE / 2;
      const positionY = position.y - DEFAULT_STICKER_SIZE / 2;
      const nextZIndex =
        canvasStickers.reduce(
          (max, sticker) => Math.max(max, sticker.zIndex ?? 0),
          0
        ) + 1;

      try {
        const created = await createCanvasSticker({
          stickerId: selectedStickerId,
          positionX,
          positionY,
          width: DEFAULT_STICKER_SIZE,
          height: DEFAULT_STICKER_SIZE,
          rotation: 0,
          zIndex: nextZIndex,
        });

        setCanvasStickers((prev) => [...prev, created]);
        setSelectedStickerId(null);
        setActiveStickerId(null);
        toaster.create({
          title: "ステッカーを貼り付けました",
          type: "success",
        });
      } catch (error) {
        console.error("キャンバスステッカー追加エラー:", error);
        toaster.create({
          title: `ステッカーの貼り付けに失敗しました: ${
            error instanceof Error ? error.message : "不明なエラー"
          }`,
          type: "error",
        });
      }
    },
    [canvasStickers, selectedStickerId]
  );

  const handleCanvasStickerPositionUpdate = useCallback(
    async (
      stickerId: string,
      event: MouseEvent | TouchEvent | PointerEvent
    ) => {
      const element = event.currentTarget as HTMLElement | null;
      if (!element) return;

      const stickerRect = element.getBoundingClientRect();
      const containerRect = canvasLayerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const screenX = stickerRect.left - containerRect.left;
      const screenY = stickerRect.top - containerRect.top;
      const positionX = (screenX - viewport.x) / viewport.zoom;
      const positionY = (screenY - viewport.y) / viewport.zoom;

      const previous = canvasStickers.find(
        (sticker) => sticker.id === stickerId
      );
      setCanvasStickers((prev) =>
        prev.map((sticker) =>
          sticker.id === stickerId
            ? { ...sticker, positionX, positionY }
            : sticker
        )
      );

      try {
        await updateCanvasSticker(stickerId, { positionX, positionY });
      } catch (error) {
        console.error("キャンバスステッカー位置更新エラー:", error);
        if (previous) {
          setCanvasStickers((prev) =>
            prev.map((sticker) =>
              sticker.id === stickerId ? previous : sticker
            )
          );
        }
        toaster.create({
          title: `ステッカーの位置更新に失敗しました: ${
            error instanceof Error ? error.message : "不明なエラー"
          }`,
          type: "error",
        });
      }
    },
    [canvasLayerRef, canvasStickers, viewport]
  );

  const handleCanvasStickerDelete = useCallback(
    async (stickerId: string) => {
      let removedSticker: CanvasSticker | undefined;
      setCanvasStickers((prev) => {
        removedSticker = prev.find((sticker) => sticker.id === stickerId);
        return prev.filter((sticker) => sticker.id !== stickerId);
      });

      try {
        await deleteCanvasSticker(stickerId);
        if (activeStickerId === stickerId) {
          setActiveStickerId(null);
        }
      } catch (error) {
        console.error("キャンバスステッカー削除エラー:", error);
        toaster.create({
          title: `ステッカーの削除に失敗しました: ${
            error instanceof Error ? error.message : "不明なエラー"
          }`,
          type: "error",
        });
        if (removedSticker) {
          setCanvasStickers((prev) => [...prev, removedSticker!]);
        }
      }
    },
    [activeStickerId]
  );

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

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const fetched = await getStickers();
        if (!cancelled) {
          setStickers(fetched);
        }
      } catch (error) {
        console.error("ステッカーの取得に失敗:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const fetched = await getCanvasStickers();
        if (!cancelled) {
          setCanvasStickers(fetched);
        }
      } catch (error) {
        console.error("キャンバスステッカーの取得に失敗:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <Box
      style={{ height: "100vh", overflow: "hidden", position: "relative" }}
      bg="#FEFDF9"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        zIndex="1"
        p={2}
        bg="#FFDFE4"
        width="50px"
        height="125px"
        borderRadius="30px"
      />
      <Box
        position="absolute"
        top="0"
        left="50px"
        zIndex="1"
        p={2}
        bg="#FFDFE4"
        width="50px"
        height="75px"
        borderRadius="30px"
      />
      <Box
        position="absolute"
        top="0"
        right="0px"
        zIndex="1"
        p={2}
        bg="#FFDFE4"
        width="100px"
        height="175px"
        borderRadius="50px"
      />
      <Box
        position="absolute"
        top="0"
        right="100px"
        zIndex="1"
        p={2}
        bg="#FFDFE4"
        width="70px"
        height="100px"
        borderRadius="50px"
      />
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
          <Box display="flex" gap={3} alignItems="center">
            <Button
              size="sm"
              bg="white"
              color="#8B6F47"
              fontWeight="bold"
              borderRadius="20px"
              padding="12px 20px"
              border="2px solid"
              borderColor="#A67B5B"
              _hover={{
                bg: "#FFF8DC",
                borderColor: "#8B6F47",
                transform: "translateY(-2px)",
                shadow: "md",
              }}
              transition="all 0.2s"
              onClick={handleSignOut}
            >
              ログアウト
            </Button>
            <Link href="/post">
              <Button
                size="sm"
                bg="#A67B5B"
                color="white"
                fontWeight="bold"
                borderRadius="30px"
                padding="15px 25px"
                shadow="md"
                _hover={{
                  bg: "#8B6F47",
                  transform: "translateY(-2px)",
                  shadow: "lg",
                }}
                transition="all 0.2s"
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
            bg="#FFBBC6"
            shadow="md"
            css={{
              position: "absolute",
              bottom: "20px",
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
          ref={canvasLayerRef}
          css={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            overflow: "hidden",
          }}
        >
          <NoteFlow
            notes={notes}
            onNoteUpdate={(noteId, data) => {
              handleNoteUpdate(noteId, data as positionData);
            }}
            onConnectionCreate={(sourceId, targetId) => {
              console.log("接続作成通知:", sourceId, targetId);
            }}
            onConnectionDelete={(edgeId) => {
              deleteNoteRelationship(edgeId);
            }}
            onPaneClick={handleCanvasStickerAdd}
            onViewportChange={setViewport}
          />
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            pointerEvents="none"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
              transformOrigin: "0 0",
            }}
          >
            {canvasStickers.map((sticker) => {
              return (
                <MotionDiv
                  key={sticker.id}
                  data-canvas-sticker="true"
                  drag
                  dragMomentum={false}
                  dragConstraints={canvasLayerRef}
                  style={{
                    position: "absolute",
                    top: sticker.positionY,
                    left: sticker.positionX,
                    width: sticker.width ?? DEFAULT_STICKER_SIZE,
                    height: sticker.height ?? DEFAULT_STICKER_SIZE,
                    pointerEvents: "auto",
                    zIndex: (sticker.zIndex ?? 0) + 200,
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setActiveStickerId(sticker.id);
                  }}
                  onDragStart={(event) => {
                    event.stopPropagation();
                    setActiveStickerId(sticker.id);
                  }}
                  onDragEnd={(event) => {
                    event.stopPropagation();
                    handleCanvasStickerPositionUpdate(sticker.id, event);
                  }}
                >
                  <Image
                    src={sticker.sticker.imageUrl}
                    alt={sticker.sticker.name}
                    width="100%"
                    height="100%"
                    objectFit="contain"
                    borderRadius="md"
                    pointerEvents="none"
                    style={{
                      transform: `rotate(${sticker.rotation ?? 0}deg)`,
                    }}
                  />
                  {activeStickerId === sticker.id && (
                    <CloseButton
                      size="sm"
                      color="white"
                      bg="red.400"
                      _hover={{ bg: "red.500" }}
                      position="absolute"
                      top="-8px"
                      right="-8px"
                      borderRadius="full"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCanvasStickerDelete(sticker.id);
                      }}
                    />
                  )}
                </MotionDiv>
              );
            })}
          </Box>
        </Box>
      )}
      <StickerPanel
        stickers={stickers}
        selectedStickerId={selectedStickerId}
        onSelect={handleStickerSelect}
        onClearSelection={handleStickerClear}
      />
    </Box>
  );
}
