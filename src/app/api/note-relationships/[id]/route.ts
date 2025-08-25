import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 特定の関係性を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // paramsをawait
    const { id: relationshipId } = await params;

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

    // 関係性が存在し、自分のメモに関連するかチェック
    const existingRelationship = await prisma.noteRelationship.findFirst({
      where: {
        id: relationshipId,
        OR: [
          { sourceNote: { userId: user.id } },
          { targetNote: { userId: user.id } },
        ],
      },
      include: {
        sourceNote: true,
        targetNote: true,
      },
    });

    if (!existingRelationship) {
      return NextResponse.json(
        { error: "関係性が見つからないか、削除権限がありません" },
        { status: 404 }
      );
    }

    // 関係性を削除
    await prisma.noteRelationship.delete({
      where: {
        id: relationshipId,
      },
    });

    console.log("Note relationship deleted successfully:", relationshipId);

    return NextResponse.json({
      success: true,
      message: "関係性を削除しました",
    });
  } catch (error) {
    console.error("Note relationship deletion error:", error);
    return NextResponse.json(
      { error: "関係性の削除に失敗しました" },
      { status: 500 }
    );
  }
}
