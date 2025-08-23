import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// メモの位置情報を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("位置情報更新API開始");

    // paramsをawait
    const { id: noteId } = await params;
    console.log("noteId:", noteId);

    // Supabaseクライアントを作成（認証用）
    const cookieStore = await cookies();
    console.log("Cookie store取得完了");

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          },
        },
      }
    );
    console.log("Supabaseクライアント作成完了");

    // 現在のユーザーを取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("ユーザー認証結果:", { user: user?.id, error: userError });

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { positionX, positionY, zIndex } = await request.json();

    console.log("位置情報更新リクエスト:", {
      noteId,
      positionX,
      positionY,
      zIndex,
      userId: user.id,
    });

    if (
      typeof positionX !== "number" ||
      typeof positionY !== "number" ||
      typeof zIndex !== "number"
    ) {
      console.error("型チェックエラー:", { positionX, positionY, zIndex });
      return NextResponse.json(
        { error: "位置情報は数値である必要があります" },
        { status: 400 }
      );
    }

    console.log("Prismaクエリ開始");

    // メモが存在し、自分のメモかチェック
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: user.id,
      },
    });
    console.log("既存メモ確認:", existingNote ? "存在" : "存在しない");

    if (!existingNote) {
      return NextResponse.json(
        { error: "メモが見つからないか、更新権限がありません" },
        { status: 404 }
      );
    }

    console.log("位置情報更新開始");

    // 位置情報を更新
    const updatedNote = await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        positionX,
        positionY,
        zIndex,
        updatedAt: new Date(),
      },
    });

    console.log("Note position updated successfully:", noteId, {
      positionX,
      positionY,
      zIndex,
    });

    return NextResponse.json({
      success: true,
      note: {
        ...updatedNote,
        createdAt: updatedNote.createdAt.toISOString(),
        updatedAt: updatedNote.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Note position update error:", error);
    console.error("エラーの詳細:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      name: error instanceof Error ? error.name : "Unknown error type",
    });
    return NextResponse.json(
      { error: "位置情報の更新に失敗しました" },
      { status: 500 }
    );
  }
}
