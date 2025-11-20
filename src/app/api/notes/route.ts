import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Note as PrismaNote } from "@prisma/client";

const serializeNote = (note: PrismaNote) => ({
  ...note,
  createdAt: note.createdAt.toISOString(),
  updatedAt: note.updatedAt.toISOString(),
});

// メモを作成
export async function POST(request: NextRequest) {
  try {
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

    console.log("Authenticated user:", user.id);

    // リクエストボディを取得
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "タイトルと内容は必須です" },
        { status: 400 }
      );
    }

    // Prisma経由でメモを作成
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: user.id,
      },
    });

    console.log("Note created successfully:", note.id);

    return NextResponse.json({
      success: true,
      note: serializeNote(note),
    });
  } catch (error) {
    console.error("Note creation error:", error);
    return NextResponse.json(
      { error: "メモの作成に失敗しました" },
      { status: 500 }
    );
  }
}

// ユーザーのメモ一覧を取得
export async function GET() {
  try {
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

    console.log("Fetching notes for user:", user.id);

    // Prisma経由でメモを取得
    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Notes fetched successfully:", notes.length);

    return NextResponse.json({
      success: true,
      notes: notes.map(serializeNote),
    });
  } catch (error) {
    console.error("Notes fetch error:", error);
    return NextResponse.json(
      { error: "メモの取得に失敗しました" },
      { status: 500 }
    );
  }
}
