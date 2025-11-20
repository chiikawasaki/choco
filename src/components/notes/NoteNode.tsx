"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Box, Text, VStack } from "@chakra-ui/react";
import { Note } from "@/lib/notes";

interface NoteNodeData {
  note: Note;
  onUpdate?: (noteId: string, data: Partial<Note>) => void;
}

function NoteNode({ data }: NodeProps<NoteNodeData>) {
  const { note } = data;

  return (
    <Box
      p={3}
      bg={note.color || "#F1DDFF"}
      borderRadius="lg"
      shadow="md"
      border="2px"
      borderColor="pink.300"
      minW="200px"
      maxW="300px"
      position="relative"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#4338CA", width: "12px", height: "12px" }}
      />

      <VStack align="stretch" gap={2}>
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="gray.800"
          textAlign="center"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {note.title}
        </Text>

        <Text
          fontSize="sm"
          color="gray.700"
          overflow="hidden"
          textOverflow="ellipsis"
          display="box"
          lineClamp={3}
          lineHeight="1.4"
        >
          {note.content}
        </Text>

        <Text fontSize="xs" color="gray.500" textAlign="right">
          {new Date(note.createdAt).toLocaleDateString("ja-JP")}
        </Text>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#4338CA", width: "12px", height: "12px" }}
      />
    </Box>
  );
}

export default memo(NoteNode);
