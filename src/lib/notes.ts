export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

// メモを作成
export async function createNote(data: CreateNoteData): Promise<Note> {
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

  const result = await response.json();
  return result.note;
}

// ユーザーのメモ一覧を取得
export async function getUserNotes(): Promise<Note[]> {
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

  const result = await response.json();
  return result.notes;
}

// メモを更新
export async function updateNote(
  id: string,
  data: Partial<CreateNoteData>
): Promise<Note> {
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

  const result = await response.json();
  return result.note;
}

// メモを削除
export async function deleteNote(id: string): Promise<void> {
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
}
