"use client";
import { Button, Card, Box, Spinner, Text } from "@chakra-ui/react";
import { Plus, AlignJustify } from "lucide-react";
import Sidebar from "./Sidebar";
import Searchbar from "./Searchbar";
import { useAuth } from "@/hooks/useAuth";
import NoteForm from "@/components/notes/NoteForm";
import { useState, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const sidebarRef = useRef<{ refreshNotes: () => void }>(null);

  const supabase = getSupabaseClient();

  // メモ作成後に一覧を更新
  const handleNoteCreated = () => {
    setRefreshKey((prev) => prev + 1);
    // サイドバーも更新
    if (sidebarRef.current) {
      sidebarRef.current.refreshNotes();
    }
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
    <div>
      <AlignJustify
        size={25}
        style={{ position: "absolute", top: "6px", left: "10px" }}
      />
      <Sidebar ref={sidebarRef} />

      {/* ログアウトボタン */}
      <Button
        size="sm"
        variant="outline"
        position="absolute"
        top="12px"
        right="20px"
        onClick={async () => {
          await supabase.auth.signOut();
        }}
      >
        ログアウト
      </Button>
      <Button
        size="sm"
        variant="subtle"
        bg="#4338CA"
        color="white"
        css={{ borderRadius: "30px", margin: "100px", padding: "15px 25px" }}
      >
        保存する
      </Button>
      <div
        style={{
          position: "relative",
          width: "300px",
          bottom: "225px",
          left: "70%",
        }}
      >
        <Searchbar />
      </div>
      <Link href="/post">
        <Button
          bg="#4338CA"
          css={{
            position: "fixed",
            bottom: "5%",
            right: "2%",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
          }}
        >
          <Plus color="white" />
        </Button>
      </Link>
      {/* メモ投稿フォーム */}
      <Box mt={8} mb={8}>
        <NoteForm onNoteCreated={handleNoteCreated} />
      </Box>

      <Card.Root width="320px" bg="pink">
        <Card.Body gap="2">
          <Card.Title mt="2">メモタイトル</Card.Title>
          <Card.Description color="black">
            ここにメモの内容を入力してください。
          </Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-end"></Card.Footer>
      </Card.Root>
    </div>
  );
}
