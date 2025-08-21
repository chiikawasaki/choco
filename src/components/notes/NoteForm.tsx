"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Button, Field, Heading, Input, Textarea } from "@chakra-ui/react";
import { createNote, CreateNoteData } from "@/lib/notes";
import { toaster } from "@/components/ui/toaster";

interface NoteFormProps {
  onNoteCreated?: () => void;
}

export default function NoteForm({ onNoteCreated }: NoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateNoteData>();

  const onSubmit = async (data: CreateNoteData) => {
    setIsLoading(true);

    try {
      await createNote(data);

      toaster.create({
        title: "メモを投稿しました！",
        type: "success",
      });

      // フォームをリセット
      reset();

      // 親コンポーネントに通知
      onNoteCreated?.();
    } catch (error) {
      toaster.create({
        title: `エラー: ${
          error instanceof Error ? error.message : "投稿に失敗しました"
        }`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md" maxW="600px" mx="auto">
      <Heading size="md" mb={6}>
        新しいメモを投稿
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Field.Root invalid={!!errors.title} mb={4}>
          <Field.Label>
            タイトル <span style={{ color: "red" }}>*</span>
          </Field.Label>
          <Input
            placeholder="メモのタイトルを入力"
            {...register("title", {
              required: "タイトルは必須です",
              maxLength: {
                value: 100,
                message: "タイトルは100文字以下で入力してください",
              },
            })}
          />
          {errors.title && (
            <Field.ErrorText color="red" fontSize="sm" mt="1">
              {errors.title.message}
            </Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.content} mb={6}>
          <Field.Label>
            内容 <span style={{ color: "red" }}>*</span>
          </Field.Label>
          <Textarea
            placeholder="メモの内容を入力"
            rows={5}
            {...register("content", {
              required: "内容は必須です",
              maxLength: {
                value: 1000,
                message: "内容は1000文字以下で入力してください",
              },
            })}
          />
          {errors.content && (
            <Field.ErrorText color="red" fontSize="sm" mt="1">
              {errors.content.message}
            </Field.ErrorText>
          )}
        </Field.Root>

        <Button
          type="submit"
          bg="#4338CA"
          color="white"
          size="lg"
          width="100%"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "投稿中..." : "メモを投稿"}
        </Button>
      </form>
    </Box>
  );
}
