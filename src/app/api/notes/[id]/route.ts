import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// メモを更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // リクエストボディを取得
    const { title, content } = await request.json();

    // バリデーション
    if (title && title.length > 100) {
      return NextResponse.json(
        { error: "タイトルは100文字以下で入力してください" },
        { status: 400 }
      );
    }

    if (content && content.length > 1000) {
      return NextResponse.json(
        { error: "内容は1000文字以下で入力してください" },
        { status: 400 }
      );
    }

    // 更新データを準備
    const updateData: { title?: string; content?: string } = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    // メモを更新
    const { data: note, error: updateError } = await supabase
      .from("notes")
      .update(updateData)
      .eq("id", params.id)
      .eq("userId", user.id) // 自分のメモのみ更新可能
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { error: "メモが見つからないか、更新権限がありません" },
          { status: 404 }
        );
      }
      console.error("メモ更新エラー:", updateError);
      return NextResponse.json(
        { error: "メモの更新に失敗しました" },
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

// メモを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // メモを削除
    const { error: deleteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", params.id)
      .eq("userId", user.id); // 自分のメモのみ削除可能

    if (deleteError) {
      if (deleteError.code === "PGRST116") {
        return NextResponse.json(
          { error: "メモが見つからないか、削除権限がありません" },
          { status: 404 }
        );
      }
      console.error("メモ削除エラー:", deleteError);
      return NextResponse.json(
        { error: "メモの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "メモを削除しました",
    });
  } catch (error) {
    console.error("API エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
