"use client";

import { Box, Button } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const Postpage = () => {
  return (
    <Box h="100vh" bg="#f0f0f0">
      {/* ← 左上の戻る矢印アイコン（Linkで囲む） */}
      <Link href="/" passHref>
        <Box
          as="span"
          position="fixed"
          top="16px"
          left="16px"
          cursor="pointer"
          _hover={{ color: "#555" }}
        >
          <ArrowLeft size={28} />
        </Box>
      </Link>

      {/* 右上の保存ボタン */}
      <Button
        position="fixed"
        top="16px"
        right="16px"
        bg="#4338CA"
        color="white"
        borderRadius="30px"
        px="20px"
        height="40px"
        fontSize="14px"
        _hover={{ bg: "#372fa3" }}
      >
        保存
      </Button>
    </Box>
  );
};

export default Postpage;
