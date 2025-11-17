import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Sticker as PrismaSticker } from "@prisma/client";

const DEFAULT_STICKERS = [
  {
    key: "sticker-01",
    name: "ステッカー1",
    imageUrl: "/stickers/sticker01.png",
    storagePath: "static/sticker01.png",
  },
  {
    key: "sticker-02",
    name: "ステッカー2",
    imageUrl: "/stickers/sticker02.png",
    storagePath: "static/sticker02.png",
  },
  {
    key: "sticker-03",
    name: "ステッカー3",
    imageUrl: "/stickers/sticker03.png",
    storagePath: "static/sticker03.png",
  },
  {
    key: "sticker-04",
    name: "ステッカー4",
    imageUrl: "/stickers/sticker04.png",
    storagePath: "static/sticker04.png",
  },
  {
    key: "sticker-05",
    name: "ステッカー5",
    imageUrl: "/stickers/sticker05.png",
    storagePath: "static/sticker05.png",
  },
  {
    key: "sticker-06",
    name: "ステッカー6",
    imageUrl: "/stickers/sticker06.png",
    storagePath: "static/sticker06.png",
  },
] as const;

const serializeSticker = (sticker: PrismaSticker) => ({
  ...sticker,
  createdAt: sticker.createdAt.toISOString(),
});

const ensureDefaultStickers = async (userId: string) => {
  await Promise.all(
    DEFAULT_STICKERS.map((sticker) =>
      prisma.sticker.upsert({
        where: { id: `${userId}-${sticker.key}` },
        create: {
          id: `${userId}-${sticker.key}`,
          name: sticker.name,
          imageUrl: sticker.imageUrl,
          storagePath: sticker.storagePath,
          userId,
        },
        update: {
          name: sticker.name,
          imageUrl: sticker.imageUrl,
          storagePath: sticker.storagePath,
        },
      })
    )
  );
};

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
      supabase: null,
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
    await ensureDefaultStickers(user.id);

    const stickers = await prisma.sticker.findMany({
      where: {
        userId: user.id,
      },
    });

    const orderMap = new Map(
      DEFAULT_STICKERS.map((sticker, index) => [sticker.storagePath, index])
    );

    const sortedStickers = stickers.sort((a, b) => {
      const orderA = orderMap.get(a.storagePath) ?? Number.MAX_SAFE_INTEGER;
      const orderB = orderMap.get(b.storagePath) ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    return NextResponse.json({
      success: true,
      stickers: sortedStickers.map(serializeSticker),
    });
  } catch (err) {
    console.error("Sticker fetch error:", err);
    return NextResponse.json(
      { error: "ステッカーの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "ステッカーのアップロードはサポートされていません" },
    { status: 405 }
  );
}
