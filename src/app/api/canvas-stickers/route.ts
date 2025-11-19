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

export async function GET() {
  const { user, error } = await getAuthenticatedContext();
  if (!user) {
    return error!;
  }

  try {
    const stickers = await prisma.canvasSticker.findMany({
      where: {
        userId: user.id,
      },
      include: {
        sticker: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      stickers: stickers.map(serializeCanvasSticker),
    });
  } catch (err) {
    console.error("Canvas sticker fetch error:", err);
    return NextResponse.json(
      { error: "キャンバスステッカーの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedContext();
  if (!user) {
    return error!;
  }

  try {
    const body = await request.json();
    const {
      stickerId,
      positionX,
      positionY,
      width = 90,
      height = 90,
      rotation = 0,
      zIndex = 0,
    } = body ?? {};

    if (
      !stickerId ||
      typeof positionX !== "number" ||
      typeof positionY !== "number"
    ) {
      return NextResponse.json(
        { error: "stickerId, positionX, positionY は必須です" },
        { status: 400 }
      );
    }

    const stickerExists = await prisma.sticker.findFirst({
      where: {
        id: stickerId,
      },
    });

    if (!stickerExists) {
      return NextResponse.json(
        { error: "指定されたステッカーが見つかりません" },
        { status: 404 }
      );
    }

    const canvasSticker = await prisma.canvasSticker.create({
      data: {
        userId: user.id,
        stickerId,
        positionX,
        positionY,
        width,
        height,
        rotation,
        zIndex,
      },
      include: {
        sticker: true,
      },
    });

    return NextResponse.json({
      success: true,
      sticker: serializeCanvasSticker(canvasSticker),
    });
  } catch (err) {
    console.error("Canvas sticker creation error:", err);
    return NextResponse.json(
      { error: "ステッカーの追加に失敗しました" },
      { status: 500 }
    );
  }
}
