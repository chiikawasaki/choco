export interface StickerResponse {
  id: string;
  name: string;
  imageUrl: string;
  storagePath: string;
  userId: string;
  createdAt: string | Date;
}

export interface CanvasStickerResponse {
  id: string;
  stickerId: string;
  userId: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  createdAt: string | Date;
  sticker: StickerResponse | null;
}

export interface Sticker {
  id: string;
  name: string;
  imageUrl: string;
  storagePath: string;
  userId: string;
  createdAt: Date;
}

export interface CanvasSticker {
  id: string;
  userId: string;
  stickerId: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  createdAt: Date;
  sticker: Sticker;
}

export interface CreateCanvasStickerPayload {
  stickerId: string;
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
}

export interface UpdateCanvasStickerPayload {
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
}

const dateReviver = (value: string | Date) =>
  typeof value === "string" ? new Date(value) : value;

export const parseSticker = (raw: StickerResponse): Sticker => ({
  id: raw.id,
  name: raw.name,
  imageUrl: raw.imageUrl,
  storagePath: raw.storagePath,
  userId: raw.userId,
  createdAt: dateReviver(raw.createdAt) as Date,
});

export const parseCanvasSticker = (
  raw: CanvasStickerResponse
): CanvasSticker => {
  const fallbackSticker: StickerResponse = {
    id: raw.stickerId,
    name: "",
    imageUrl: "",
    storagePath: "",
    userId: "",
    createdAt: raw.createdAt,
  };

  const stickerSource = raw.sticker ?? fallbackSticker;

  return {
    id: raw.id,
    userId: raw.userId,
    stickerId: raw.stickerId,
    positionX: raw.positionX,
    positionY: raw.positionY,
    width: raw.width,
    height: raw.height,
    rotation: raw.rotation,
    zIndex: raw.zIndex,
    createdAt: dateReviver(raw.createdAt) as Date,
    sticker: parseSticker(stickerSource),
  };
};

export async function getStickers(): Promise<Sticker[]> {
  const response = await fetch("/api/stickers", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "ステッカーの取得に失敗しました");
  }

  const result = (await response.json()) as {
    stickers: StickerResponse[];
  };
  return (result.stickers ?? []).map(parseSticker);
}

export async function getCanvasStickers(): Promise<CanvasSticker[]> {
  const response = await fetch("/api/canvas-stickers", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "キャンバスステッカーの取得に失敗しました");
  }

  const result = (await response.json()) as {
    stickers: CanvasStickerResponse[];
  };
  return (result.stickers ?? []).map(parseCanvasSticker);
}

export async function createCanvasSticker(
  data: CreateCanvasStickerPayload
): Promise<CanvasSticker> {
  const response = await fetch("/api/canvas-stickers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "ステッカーの追加に失敗しました");
  }

  const result = (await response.json()) as {
    sticker: CanvasStickerResponse;
  };
  return parseCanvasSticker(result.sticker);
}

export async function updateCanvasSticker(
  id: string,
  data: UpdateCanvasStickerPayload
): Promise<CanvasSticker> {
  const response = await fetch(`/api/canvas-stickers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "ステッカーの更新に失敗しました");
  }

  const result = (await response.json()) as {
    sticker: CanvasStickerResponse;
  };
  return parseCanvasSticker(result.sticker);
}

export async function deleteCanvasSticker(id: string): Promise<void> {
  const response = await fetch(`/api/canvas-stickers/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "ステッカーの削除に失敗しました");
  }
}
