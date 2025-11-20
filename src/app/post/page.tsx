"use client";

import { Button, Box, Spinner, Text } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import NoteForm, { NoteFormRef } from "@/components/notes/NoteForm";
import { useRef, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// 選択可能な背景色
const BACKGROUND_COLORS = ["#F1DDFF", "#FEBFC8", "#FEE9A6", "#C5FFEE"];

const PostPage = () => {
  const { user, loading } = useAuth();
  const noteFormRef = useRef<NoteFormRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#FEBFC8");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
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
    <Box
      p={8}
      position="relative"
      height="100vh"
      bg={backgroundColor}
      overflow="hidden"
    >
      {/* 装飾的なピンクのボックス（左上） */}
      <Box
        position="fixed"
        top="0"
        left="0"
        zIndex="1"
        bg="#FFDFE4"
        width="50px"
        height="125px"
        borderRadius="30px"
      />
      <Box
        position="fixed"
        top="0"
        left="50px"
        zIndex="1"
        bg="#FFDFE4"
        width="50px"
        height="75px"
        borderRadius="30px"
      />

      {/* 装飾的なピンクのボックス（右上） */}
      <Box
        position="fixed"
        top="0"
        right="0px"
        zIndex="1"
        bg="#FFDFE4"
        width="100px"
        height="175px"
        borderRadius="50px"
      />
      <Box
        position="fixed"
        top="0"
        right="100px"
        zIndex="1"
        bg="#FFDFE4"
        width="70px"
        height="100px"
        borderRadius="50px"
      />

      {/* ヘッダーバー */}
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
          <Box cursor="pointer" ml={2}>
            <Link href="/">
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                p={2}
                borderRadius="20px"
                transition="all 0.2s"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.5)",
                  transform: "translateX(-2px)",
                }}
              >
                <ArrowLeft size={24} color="#8B6F47" />
                <Text color="#8B6F47" fontWeight="bold">
                  戻る
                </Text>
              </Box>
            </Link>
          </Box>
          <Box display="flex" gap={3} alignItems="center">
            {/* カラーパレット */}
            <Box position="relative" mr={2}>
              {/* 選択中の色を表示 */}
              <Box
                width="40px"
                height="40px"
                bg={backgroundColor}
                borderRadius="50%"
                cursor="pointer"
                border="3px solid #8B6F47"
                transition="all 0.2s"
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                _hover={{
                  transform: "scale(1.1)",
                  shadow: "md",
                }}
              />

              {/* ドロップダウンの色選択肢 */}
              {isColorPickerOpen && (
                <Box
                  position="absolute"
                  top="50px"
                  left="-5px"
                  bg="white"
                  borderRadius="15px"
                  padding="10px"
                  shadow="lg"
                  zIndex="2000"
                  display="flex"
                  flexDirection="column"
                  gap={2}
                >
                  {BACKGROUND_COLORS.map((color) => (
                    <Box
                      key={color}
                      width="32px"
                      height="32px"
                      bg={color}
                      borderRadius="50%"
                      cursor="pointer"
                      border={
                        backgroundColor === color
                          ? "3px solid #8B6F47"
                          : "2px solid #e0e0e0"
                      }
                      transition="all 0.2s"
                      onClick={() => {
                        setBackgroundColor(color);
                        setIsColorPickerOpen(false);
                      }}
                      _hover={{
                        transform: "scale(1.1)",
                        shadow: "md",
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
            <Button
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
              onClick={handleSave}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* メインコンテンツエリア */}
      <Box mt={20} position="relative" zIndex="10">
        <NoteForm ref={noteFormRef} backgroundColor={backgroundColor} />
      </Box>
    </Box>
  );
};

export default PostPage;
