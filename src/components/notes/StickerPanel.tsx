"use client";

import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Sticker } from "@/lib/stickers";

interface StickerPanelProps {
  stickers: Sticker[];
  selectedStickerId: string | null;
  onSelect: (stickerId: string) => void;
  onClearSelection: () => void;
}

export function StickerPanel({
  stickers,
  selectedStickerId,
  onSelect,
  onClearSelection,
}: StickerPanelProps) {
  const panelBg = "white";
  const borderColor = "gray.200";
  const selectedBorder = "#4338CA";

  return (
    <Box
      position="fixed"
      bottom="20px"
      left="20px"
      width="260px"
      bg={panelBg}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="lg"
      p={4}
      zIndex={1100}
    >
      <VStack align="stretch" gap={3}>
        <Text fontSize="md" fontWeight="bold" color="#4338CA">
          ステッカー
        </Text>

        <HStack justify="space-between">
          <Text fontSize="xs" color="gray.500">
            選択してキャンバスに貼り付け
          </Text>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="gray"
            onClick={onClearSelection}
            isDisabled={!selectedStickerId}
          >
            選択解除
          </Button>
        </HStack>

        {stickers.length === 0 ? (
          <Box
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="md"
            p={4}
            textAlign="center"
          >
            <Text fontSize="sm" color="gray.500">
              まだステッカーがありません
            </Text>
            <Text fontSize="xs" color="gray.400" mt={2}>
              public/stickers/ に画像を追加してください
            </Text>
          </Box>
        ) : (
          <Grid templateColumns="repeat(3, 1fr)" gap={2}>
            {stickers.map((sticker) => {
              const isSelected = selectedStickerId === sticker.id;
              return (
                <GridItem key={sticker.id} position="relative">
                  <Box
                    borderRadius="md"
                    border="2px solid"
                    borderColor={isSelected ? selectedBorder : "transparent"}
                    overflow="hidden"
                    cursor="pointer"
                    onClick={() => onSelect(sticker.id)}
                    transition="transform 0.15s ease"
                    _hover={{ transform: "scale(1.02)" }}
                  >
                    <Image
                      src={sticker.imageUrl}
                      alt={sticker.name}
                      objectFit="cover"
                      width="100%"
                      height="70px"
                    />
                  </Box>
                </GridItem>
              );
            })}
          </Grid>
        )}
      </VStack>
    </Box>
  );
}
