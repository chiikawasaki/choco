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
    <Box p={8}>
      {/* ヘッダー */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={8}
      >
        <Heading size="lg">投稿ページ</Heading>

        {/* ログアウトボタン */}
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
          }}
        >
          ログアウト
        </Button>
      </Box>
      <NoteForm />
    </Box>
  );
};

export default PostPage;
