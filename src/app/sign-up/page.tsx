"use client";

import { supabase } from "@/lib/supabase";
import { Box, Button, Field, Heading, Input } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useForm } from "react-hook-form";
import { Notebook } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormValues {
  email: string;
  password: string;
}

const SignUp = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const handleSignUp = async (data: FormValues) => {
    setIsLoading(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toaster.create({
        title: `エラー: ${error.message}`,
        type: "error",
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
      console.log("User signed up:", signUpData.user);
      toaster.create({
        title: "確認のメールを送信しました。メールをご確認ください。",
        type: "success",
      });
      router.push("/login");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Notebook
        size={100}
        color="rgb(165, 165, 165)"
        style={{ marginBottom: "20px" }}
      />
      <Heading mb="20px">サインアップ</Heading>
      <form
        onSubmit={handleSubmit(handleSignUp)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "300px",
        }}
      >
        <Field.Root invalid={!!errors.email}>
          <Field.Label>
            Email <span style={{ color: "red" }}>*</span>
          </Field.Label>
          <Input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "メールアドレスは必須です",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "有効なメールアドレスを入力してください",
              },
            })}
          />
          {errors.email && (
            <Field.ErrorText color="red" fontSize="sm" mt="1">
              {errors.email.message}
            </Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.password}>
          <Field.Label>
            Password <span style={{ color: "red" }}>*</span>
          </Field.Label>
          <Input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "パスワードは必須です",
              minLength: {
                value: 6,
                message: "パスワードは6文字以上で入力してください",
              },
            })}
          />
          {errors.password && (
            <Field.ErrorText color="red.500" fontSize="sm" mt="1">
              {errors.password.message}
            </Field.ErrorText>
          )}
        </Field.Root>
        <Button
          type="submit"
          bg="#4338CA"
          loading={isLoading}
          disabled={isLoading}
          loadingText="登録中..."
        >
          登録
        </Button>
      </form>
    </Box>
  );
};

export default SignUp;
