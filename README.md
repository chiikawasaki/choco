# Choco - メモ管理アプリケーション

## 概要

Choco は、メモ同士の関係を視覚的に把握でき、気軽にメモができる Web アプリケーションです。直感的なインターフェースで、アイデアやタスクを簡単に記録・管理できます。

## 主な機能

### メモ作成・管理

- シンプルで使いやすいメモ作成機能
- タイトルとコンテンツを含むメモの保存

### 検索・フィルタリング

- キーワードによるメモ検索

### ユーザー認証

- Supabase による安全な認証システム
- ユーザー別のメモ管理
- ログイン・サインアップ機能

## 技術スタック

### フロントエンド

- **Next.js 15** - React フレームワーク
- **React 19** - UI ライブラリ
- **TypeScript** - 型安全性
- **Chakra UI** - UI コンポーネントライブラリ
- **Tailwind CSS** - スタイリング

### バックエンド・データベース

- **Supabase** - 認証・データベース
- **PostgreSQL** - リレーショナルデータベース
- **Prisma** - ORM

### その他

- **Lucide React** - アイコン

## セットアップ

### 前提条件

- Node.js 18 以上
- npm

### インストール

1. リポジトリをクローン

```bash
git clone `https://github.com/chiikawasaki/choco.git`
cd choco
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定
   `.env.local`ファイルを作成し、以下の変数を設定してください：

```env
DATABASE_URL="your-supabase-database-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

4. データベースのセットアップ

```bash
npx prisma generate
npx prisma db push
```

5. 開発サーバーを起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 使用方法

### 新規ユーザー

1. `/sign-up` ページでアカウントを作成
2. 確認メールを確認
3. `/login` ページでログイン

### メモの作成

作成中

### メモの検索

作成中

## プロジェクト構造

```
choco/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── login/          # ログインページ
│   │   ├── sign-up/        # サインアップページ
│   │   ├── Sidebar.tsx     # サイドバーコンポーネント
│   │   ├── Searchbar.tsx   # 検索バーコンポーネント
│   │   └── page.tsx        # ホームページ
│   ├── components/          # UIコンポーネント
│   └── lib/                # ユーティリティ・設定
├── prisma/                 # データベーススキーマ
└── public/                 # 静的ファイル
```
