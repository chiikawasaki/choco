import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 特定のメモを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // paramsをawait
    const { id: noteId } = await params;

    // Supabaseクライアントを作成（認証用）
    const cookieStore = await cookies();
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

    // 現在のユーザーを取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    console.log("Deleting note:", noteId, "for user:", user.id);

    // メモが存在し、自分のメモかチェック
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: user.id,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "メモが見つからないか、削除権限がありません" },
        { status: 404 }
      );
    }

    // メモを削除
    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    console.log("Note deleted successfully:", noteId);

    return NextResponse.json({
      success: true,
      message: "メモを削除しました",
    });
  } catch (error) {
    console.error("Note deletion error:", error);
    return NextResponse.json(
      { error: "メモの削除に失敗しました" },
      { status: 500 }
    );
  }
}

// 特定のメモを更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // paramsをawait
    const { id: noteId } = await params;

    // Supabaseクライアントを作成（認証用）
    const cookieStore = await cookies();
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

    // 現在のユーザーを取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title && !content) {
      return NextResponse.json(
        { error: "更新する内容がありません" },
        { status: 400 }
      );
    }

    // メモが存在し、自分のメモかチェック
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: user.id,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "メモが見つからないか、更新権限がありません" },
        { status: 404 }
      );
    }

    // メモを更新
    const updatedNote = await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        updatedAt: new Date(),
      },
    });

    console.log("Note updated successfully:", noteId);

    return NextResponse.json({
      success: true,
      note: {
        ...updatedNote,
        createdAt: updatedNote.createdAt.toISOString(),
        updatedAt: updatedNote.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Note update error:", error);
    return NextResponse.json(
      { error: "メモの更新に失敗しました" },
      { status: 500 }
    );
  }
}
