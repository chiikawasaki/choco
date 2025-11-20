"use client";

import { Box, Image, HStack } from "@chakra-ui/react";
import { Sticker } from "@/lib/stickers";
import { useState } from "react";

interface StickerPanelProps {
  stickers: Sticker[];
  selectedStickerId: string | null;
  onSelect: (stickerId: string) => void;
}

export function StickerPanel({
  stickers,
  selectedStickerId,
  onSelect,
}: StickerPanelProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const selectedSticker = selectedStickerId
    ? stickers.find((s) => s.id === selectedStickerId)
    : stickers[0];

  const handleDragStart = (e: React.DragEvent, stickerId: string) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("stickerId", stickerId);
  };

  if (stickers.length === 0) {
    return null;
  }

  return (
    <Box position="fixed" bottom="20px" left="20px" zIndex={1100}>
      <Box position="relative">
        {/* 選択中のステッカーを表示 */}
        <Box
          draggable
          onDragStart={(e) => {
            if (selectedSticker) {
              handleDragStart(e, selectedSticker.id);
            }
          }}
          width="60px"
          height="60px"
          bg="#FFDFE4"
          borderRadius="50%"
          overflow="visible"
          cursor="pointer"
          transition="all 0.2s"
          boxShadow="md"
          border="3px solid"
          borderColor={selectedStickerId ? "#8B6F47" : "#FFDFE4"}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          _hover={{
            transform: "scale(1.1)",
            boxShadow: "lg",
          }}
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {selectedSticker && (
            <Image
              src={selectedSticker.imageUrl}
              alt={selectedSticker.name}
              objectFit="cover"
              width="120%"
              height="120%"
              pointerEvents="none"
            />
          )}
        </Box>

        {/* ドロップダウンのステッカー選択肢 */}
        {isPickerOpen && (
          <Box
            position="absolute"
            top="-8px"
            left="70px"
            bg="white"
            borderRadius="15px"
            padding="10px"
            shadow="lg"
            zIndex="2000"
          >
            <HStack gap={2}>
              {stickers.map((sticker) => {
                const isSelected = selectedSticker?.id === sticker.id;
                return (
                  <Box
                    key={sticker.id}
                    draggable
                    onDragStart={(e) => {
                      handleDragStart(e, sticker.id);
                    }}
                    width="60px"
                    height="60px"
                    bg="#FFDFE4"
                    borderRadius="50%"
                    overflow="visible"
                    cursor="pointer"
                    transition="all 0.2s"
                    boxShadow="sm"
                    border="3px solid"
                    borderColor={isSelected ? "#8B6F47" : "transparent"}
                    onClick={() => {
                      onSelect(sticker.id);
                      setIsPickerOpen(false);
                    }}
                    _hover={{
                      transform: "scale(1.1)",
                      boxShadow: "md",
                      borderColor: isSelected ? "#8B6F47" : "#e0e0e0",
                    }}
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={sticker.imageUrl}
                      alt={sticker.name}
                      width="100%"
                      height="100%"
                      pointerEvents="none"
                    />
                  </Box>
                );
              })}
            </HStack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
