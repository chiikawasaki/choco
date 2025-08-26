"use client";

import { Button, Box, Spinner, Text, Heading } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import NoteForm from "@/components/notes/NoteForm";

const PostPage = () => {
  const { user, loading } = useAuth();

  // ローディング中はスピナーを表示
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Spinner size="xl" color="#4338CA" />
        <Text mt={4} color="gray.600">
          認証中...
        </Text>
      </Box>
    );
  }

  // ユーザーがログインしていない場合はリダイレクト中
  if (!user) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Spinner size="xl" color="#4338CA" />
        <Text mt={4} color="gray.600">
          ログインページにリダイレクト中...
        </Text>
      </Box>
    );
  }

  return (
    <Box p={8} position="relative" height="100vh" bg="#f0f0f0">
      <Box
        position="fixed"
        top="32px"
        right="16px"
        display="flex"
        gap="8px"
        zIndex="1000"
      >
        <Button
          bg="#4338CA"
          color="white"
          borderRadius="30px"
          padding="15px 25px"
        >
          保存
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
          }}
        >
          ログアウト
        </Button>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={8}
      >
        <Heading size="lg">投稿ページ</Heading>
      </Box>
      <NoteForm />
    </Box>
  );
};

export default PostPage;
