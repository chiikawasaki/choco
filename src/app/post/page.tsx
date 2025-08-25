"use client";

import { Box, Button, HStack } from "@chakra-ui/react";
import { ArrowBigLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const Postpage = () => {
  const router = useRouter();

  return (
    <Box h="100vh" bg="#f0f0f0">
      {/* ← Lucide アイコン + 戻るテキスト */}
      <Button
        position="fixed"
        top="8px"
        left="16px"
        bg="#4338CA"
        color="white"
        borderRadius="30px"
        padding="15px 25px"
        onClick={() => router.back()}
        _hover={{ bg: "#372fa3" }}
      >
        <HStack spacing={2}>
          <ArrowBigLeft size={20} />
          <Box>戻る</Box>
        </HStack>
      </Button>

      {/* 保存ボタン */}
      <Button
        position="fixed"
        top="8px"
        right="16px"
        bg="#4338CA"
        color="white"
        borderRadius="30px"
        padding="15px 25px"
        _hover={{ bg: "#372fa3" }}
      >
        保存
      </Button>
    </Box>
  );
};

export default Postpage;
