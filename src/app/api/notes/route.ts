import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// メモを作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("認証チェック結果:", { user: !!user, authError });

    if (authError) {
      console.error("認証エラー詳細:", authError);
      return NextResponse.json(
        { error: `認証エラー: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!user) {
      console.log("ユーザーが見つかりません");
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リクエストボディを取得
    const { title, content } = await request.json();

    // バリデーション
    if (!title || !content) {
      return NextResponse.json(
        { error: "タイトルと内容は必須です" },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "タイトルは100文字以下で入力してください" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "内容は1000文字以下で入力してください" },
        { status: 400 }
      );
    }

    // メモを作成
    const { data: note, error: insertError } = await supabase
      .from("notes")
      .insert({
        title,
        content,
        userId: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("メモ作成エラー:", insertError);
      return NextResponse.json(
        { error: "メモの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("API エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// ユーザーのメモ一覧を取得
export async function GET() {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // メモ一覧を取得
    const { data: notes, error: selectError } = await supabase
      .from("notes")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (selectError) {
      console.error("メモ取得エラー:", selectError);
      return NextResponse.json(
        { error: "メモの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("API エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
