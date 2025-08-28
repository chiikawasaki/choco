"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Textarea,
  HStack,
} from "@chakra-ui/react";
import { createNote, CreateNoteData } from "@/lib/notes";
import { toaster } from "@/components/ui/toaster";

interface NoteFormProps {
  onNoteCreated?: () => void;
}

export default function NoteForm({ onNoteCreated }: NoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

      // フォームを非表示にする
      setIsVisible(false);

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

  if (!isVisible) {
    return (
      <>
        <HStack justify="space-between" mb={6}>
          <Heading size="md">新しいメモを投稿</Heading>
        </HStack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Field.Root invalid={!!errors.title} mb={4}>
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
        </form>
      </>
    );
  }
}
