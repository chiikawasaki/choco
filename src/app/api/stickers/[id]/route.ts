import { NextResponse } from "next/server";

export async function DELETE() {
  return NextResponse.json(
    { error: "ステッカーの削除はサポートされていません" },
    { status: 405 }
  );
}
