import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 関係性を作成
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

    const { sourceNoteId, targetNoteId, relationshipType, label } =
      await request.json();

    if (!sourceNoteId || !targetNoteId) {
      return NextResponse.json(
        { error: "ソースとターゲットのメモIDは必須です" },
        { status: 400 }
      );
    }

    // 両方のメモが存在し、自分のメモかチェック（直列実行で接続問題を回避）
    const sourceNote = await prisma.note.findFirst({
      where: { id: sourceNoteId, userId: user.id },
    });

    const targetNote = await prisma.note.findFirst({
      where: { id: targetNoteId, userId: user.id },
    });

    if (!sourceNote || !targetNote) {
      return NextResponse.json(
        { error: "メモが見つからないか、権限がありません" },
        { status: 404 }
      );
    }

    // 関係性を作成
    const relationship = await prisma.noteRelationship.create({
      data: {
        sourceNoteId,
        targetNoteId,
        relationshipType: relationshipType || "connection",
        label,
      },
    });

    console.log("Note relationship created successfully:", relationship.id);

    return NextResponse.json({
      success: true,
      relationship,
    });
  } catch (error) {
    console.error("Note relationship creation error:", error);
    return NextResponse.json(
      { error: "関係性の作成に失敗しました" },
      { status: 500 }
    );
  }
}

// 関係性一覧を取得
export async function GET(request: NextRequest) {
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

    // ユーザーのメモに関連する関係性を取得
    const relationships = await prisma.noteRelationship.findMany({
      where: {
        OR: [
          { sourceNote: { userId: user.id } },
          { targetNote: { userId: user.id } },
        ],
      },
      include: {
        sourceNote: true,
        targetNote: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      "Note relationships fetched successfully:",
      relationships.length
    );

    return NextResponse.json({
      success: true,
      relationships,
    });
  } catch (error) {
    console.error("Note relationships fetch error:", error);
    return NextResponse.json(
      { error: "関係性の取得に失敗しました" },
      { status: 500 }
    );
  }
}
