"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
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
import { Plus } from "lucide-react";
import { createNote, CreateNoteData } from "@/lib/notes";
import { toaster } from "@/components/ui/toaster";

interface NoteFormProps {
  onNoteCreated?: () => void;
  isVisible?: boolean;
  onToggleVisibility?: (visible: boolean) => void;
}

export interface NoteFormRef {
  submitForm: () => Promise<boolean>;
  resetForm: () => void;
  getFormData: () => CreateNoteData | null;
  isValid: () => boolean;
  triggerValidation: () => Promise<boolean>;
}

const NoteForm = forwardRef<NoteFormRef, NoteFormProps>(
  (
    { onNoteCreated, isVisible: externalIsVisible, onToggleVisibility },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false);
    const [internalIsVisible, setInternalIsVisible] = useState(false);

    // 外部制御と内部制御の両方に対応
    const isVisible =
      externalIsVisible !== undefined ? externalIsVisible : internalIsVisible;
    const setIsVisible = (visible: boolean) => {
      if (externalIsVisible !== undefined) {
        onToggleVisibility?.(visible);
      } else {
        setInternalIsVisible(visible);
      }
    };

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isValid },
      getValues,
      trigger,
    } = useForm<CreateNoteData>();

    // 外部から呼び出せるメソッドを定義
    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        const isValid = await trigger();
        if (isValid) {
          return await onSubmit(getValues());
        }
        return false;
      },
      resetForm: () => {
        reset();
        setIsVisible(false);
      },
      getFormData: () => {
        return getValues();
      },
      isValid: () => {
        return isValid;
      },
      triggerValidation: async () => {
        return await trigger();
      },
    }));

    const onSubmit = async (data: CreateNoteData) => {
      setIsLoading(true);

      try {
        await createNote(data);

        // フォームをリセット
        reset();

        // フォームを非表示にする
        setIsVisible(false);

        // 親コンポーネントに通知
        onNoteCreated?.();

        return true;
      } catch (error) {
        toaster.create({
          title: `エラー: ${
            error instanceof Error ? error.message : "投稿に失敗しました"
          }`,
          type: "error",
        });
        return false;
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
                fontSize="lg"
                border="none"
                boxShadow="none"
                outline="none"
                _focus={{ boxShadow: "none" }}
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
                border="none"
                boxShadow="none"
                outline="none"
                _focus={{ boxShadow: "none" }}
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

    return (
      <Box textAlign="center" p={6}>
        <Button
          bg="#4338CA"
          color="white"
          size="lg"
          onClick={() => setIsVisible(true)}
        >
          <Plus size={20} style={{ marginRight: "8px" }} />
          新しいメモを作成
        </Button>
      </Box>
    );
  }
);

NoteForm.displayName = "NoteForm";

export default NoteForm;
