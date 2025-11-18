import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CanvasSticker, Sticker } from "@prisma/client";

type PrismaCanvasStickerWithRelation = CanvasSticker & {
  sticker: Sticker | null;
};

const serializeSticker = (sticker: Sticker | null) =>
  sticker
    ? {
        ...sticker,
        createdAt: sticker.createdAt.toISOString(),
      }
    : null;

const serializeCanvasSticker = (sticker: PrismaCanvasStickerWithRelation) => ({
  ...sticker,
  createdAt: sticker.createdAt.toISOString(),
  sticker: serializeSticker(sticker.sticker),
});

async function getAuthenticatedContext() {
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
      user: null,
    };
  }

  return { user, supabase, error: null };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await getAuthenticatedContext();
  if (!user) {
    return error!;
  }

  try {
    const existing = await prisma.canvasSticker.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "ステッカーが見つからないか、権限がありません" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      positionX,
      positionY,
      width,
      height,
      rotation,
      zIndex,
    }: {
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
      rotation?: number;
      zIndex?: number;
    } = body ?? {};

    const updateData: Record<string, number> = {};

    if (typeof positionX === "number") updateData.positionX = positionX;
    if (typeof positionY === "number") updateData.positionY = positionY;
    if (typeof width === "number") updateData.width = width;
    if (typeof height === "number") updateData.height = height;
    if (typeof rotation === "number") updateData.rotation = rotation;
    if (typeof zIndex === "number") updateData.zIndex = zIndex;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "更新する項目がありません" },
        { status: 400 }
      );
    }

    const updated = await prisma.canvasSticker.update({
      where: { id },
      data: updateData,
      include: {
        sticker: true,
      },
    });

    return NextResponse.json({
      success: true,
      sticker: serializeCanvasSticker(updated),
    });
  } catch (err) {
    console.error("Canvas sticker update error:", err);
    return NextResponse.json(
      { error: "ステッカーの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await getAuthenticatedContext();
  if (!user) {
    return error!;
  }

  try {
    const existing = await prisma.canvasSticker.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "ステッカーが見つからないか、権限がありません" },
        { status: 404 }
      );
    }

    await prisma.canvasSticker.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Canvas sticker delete error:", err);
    return NextResponse.json(
      { error: "ステッカーの削除に失敗しました" },
      { status: 500 }
    );
  }
}
