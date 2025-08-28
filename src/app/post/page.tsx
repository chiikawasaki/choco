"use client";

import { Button, Box, Spinner, Text, Heading } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import NoteForm, { NoteFormRef } from "@/components/notes/NoteForm";
import { useRef, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PostPage = () => {
  const { user, loading } = useAuth();
  const noteFormRef = useRef<NoteFormRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 保存ボタンで投稿を実行
  const handleSave = async () => {
    if (!noteFormRef.current) {
      toaster.create({
        title: "エラー",
        description: "フォームが見つかりません",
        type: "error",
      });
      return;
    }

    const isValid = await noteFormRef.current.triggerValidation();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await noteFormRef.current.submitForm();
      if (success) {
        toaster.create({
          title: "投稿完了",
          description: "メモが正常に投稿されました",
          type: "success",
        });
      }
    } catch {
      toaster.create({
        title: "投稿エラー",
        description: "投稿に失敗しました",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
    router.push("/");
  };

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
      <Box position="fixed" top="16px" left="16px" cursor="pointer">
        <Link href="/">
          <ArrowLeft size={28} />
        </Link>
      </Box>
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
          zIndex="1000"
          onClick={handleSave}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? "保存中..." : "保存"}
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
        <Heading size="lg"></Heading>
      </Box>
      <NoteForm ref={noteFormRef} />
    </Box>
  );
};

export default PostPage;
