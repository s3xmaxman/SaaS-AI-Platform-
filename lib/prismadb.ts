// PrismaClientを@prisma/clientからインポートします。
import { PrismaClient } from "@prisma/client";

// TypeScriptのグローバルタイプスペースを拡張し、
// グローバルな変数prismaを定義しています。
// これにより、どこからでもprismaを参照できるようになります。
declare global {
    var prisma: PrismaClient | undefined
}

// グローバルにprisma変数が存在しない場合、新たにPrismaClientインスタンスを作成します。
// これによりアプリケーション全体で1つのインスタンスを再利用することができます。
export const prismadb = global.prisma || new PrismaClient();

// ノードの実行環境が「production」つまり本番環境でない場合に、
// この新しく作成したPrismaClientインスタンスをグローバル変数prismaに代入しています。
// これは開発時にホットリロード等の機能が多く使われるため、
// プロセスが再起動されるときに新しいPrismaClientインスタンスが生成されるのを防ぎ、
// コネクションの負担を減らすためです。
if (process.env.NODE_ENV !== "production") global.prisma = prismadb

// 最後に、このファイルからprismadbをデフォルトエクスポートしています。
// これにより他のファイルからimportしてprismaとして使用できるようになります。
export default prismadb;
