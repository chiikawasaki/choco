"use client";

import { getSupabaseClient } from "@/lib/supabase-client";
import { Box, Button, Field, Heading, Input } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useForm } from "react-hook-form";
import { Notebook } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface FormValues {
  email: string;
  password: string;
}

const Login = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = getSupabaseClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const handleLogin = async (data: FormValues) => {
    setIsLoading(true);
    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toaster.create({
        title: `エラー: ${error.message}`,
        type: "error",
      });
      setIsLoading(false);
      return;
    } else {
      setIsLoading(false);
      console.log("User logged in:", loginData.user);
      toaster.create({
        title: "ログインしました",
        type: "success",
      });
      router.push("/");
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
      <Heading mb="20px">ログイン</Heading>
      <form
        onSubmit={handleSubmit(handleLogin)}
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
            })}
          />
          {errors.password && (
            <Field.ErrorText color="red" fontSize="sm" mt="1">
              {errors.password.message}
            </Field.ErrorText>
          )}
        </Field.Root>
        <Button
          type="submit"
          bg="#4338CA"
          loading={isLoading}
          disabled={isLoading}
          loadingText="ログイン中..."
        >
          ログイン
        </Button>
      </form>
      <Link
        href="/sign-up"
        style={{
          color: "#4338CA",
          fontSize: "14px",
          textDecoration: "underline",
          marginTop: "20px",
        }}
      >
        新規登録はこちら
      </Link>
    </Box>
  );
};

export default Login;
