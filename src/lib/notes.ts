interface NoteResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  positionX?: number;
  positionY?: number;
  zIndex?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  positionX: number;
  positionY: number;
  zIndex: number;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNotePositionData {
  positionX: number;
  positionY: number;
  zIndex: number;
}

const mapNote = (raw: NoteResponse): Note => ({
  id: raw.id,
  title: raw.title,
  content: raw.content,
  createdAt: new Date(raw.createdAt),
  updatedAt: new Date(raw.updatedAt),
  userId: raw.userId,
  positionX: raw.positionX ?? 0,
  positionY: raw.positionY ?? 0,
  zIndex: raw.zIndex ?? 0,
});

// メモを作成
export async function createNote(data: CreateNoteData): Promise<Note> {
  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "メモの作成に失敗しました");
    }

    const result = (await response.json()) as { note: NoteResponse };
    return mapNote(result.note);
  } catch (error) {
    console.error("createNote error:", error);
    throw error;
  }
}

// ユーザーのメモ一覧を取得
export async function getUserNotes(): Promise<Note[]> {
  try {
    const response = await fetch("/api/notes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "メモの取得に失敗しました");
    }

    const result = (await response.json()) as { notes: NoteResponse[] };
    return (result.notes ?? []).map(mapNote);
  } catch (error) {
    console.error("getUserNotes error:", error);
    throw error;
  }
}

// メモを更新
export async function updateNote(
  id: string,
  data: Partial<CreateNoteData>
): Promise<Note> {
  try {
    const response = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "メモの更新に失敗しました");
    }

    const result = (await response.json()) as { note: NoteResponse };
    return mapNote(result.note);
  } catch (error) {
    console.error("updateNote error:", error);
    throw error;
  }
}

// メモの位置情報を更新
export async function updateNotePosition(
  id: string,
  data: UpdateNotePositionData
): Promise<void> {
  try {
    const response = await fetch(`/api/notes/${id}/position`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "位置情報の更新に失敗しました");
    }
  } catch (error) {
    console.error("updateNotePosition error:", error);
    throw error;
  }
}

// メモ間の関係性を作成
export async function createNoteRelationship(
  sourceNoteId: string,
  targetNoteId: string,
  relationshipType: string = "connection",
  label?: string
): Promise<void> {
  try {
    console.log("関係性作成API呼び出し:", {
      sourceNoteId,
      targetNoteId,
      relationshipType,
      label,
    });

    const response = await fetch("/api/note-relationships", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceNoteId,
        targetNoteId,
        relationshipType,
        label,
      }),
    });

    console.log("APIレスポンス:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("APIエラーレスポンス:", errorData);
      throw new Error(
        errorData.error || `関係性の作成に失敗しました (${response.status})`
      );
    }

    const result = await response.json();
    console.log("関係性作成成功:", result);
  } catch (error) {
    console.error("createNoteRelationship error:", error);
    throw error;
  }
}

// メモ間の関係性を削除
export async function deleteNoteRelationship(edgeId: string): Promise<void> {
  try {
    console.log("関係性削除API呼び出し:", edgeId);

    const response = await fetch(`/api/note-relationships/${edgeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("削除APIレスポンス:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("削除APIエラーレスポンス:", errorData);
      throw new Error(
        errorData.error || `関係性の削除に失敗しました (${response.status})`
      );
    }

    const result = await response.json();
    console.log("関係性削除成功:", result);
  } catch (error) {
    console.error("deleteNoteRelationship error:", error);
    throw error;
  }
}

// メモ間の関係性一覧を取得
export async function getNoteRelationships(): Promise<NoteRelationship[]> {
  try {
    const response = await fetch("/api/note-relationships", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "関係性の取得に失敗しました");
    }

    const result = await response.json();
    return result.relationships;
  } catch (error) {
    console.error("getNoteRelationships error:", error);
    throw error;
  }
}

// 関係性の型定義
export interface NoteRelationship {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
  relationshipType: string;
  label?: string;
  createdAt: Date;
}

// メモを削除
export async function deleteNote(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "メモの削除に失敗しました");
    }
  } catch (error) {
    console.error("deleteNote error:", error);
    throw error;
  }
}
