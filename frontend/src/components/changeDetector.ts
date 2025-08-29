import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
// 修正ポイント: node-cronの型エラー回避のためany型でインポート
import * as cron from 'node-cron';

interface FileChangeInfo {
    filePath: string;       // ファイルの相対パス
    mtimeMs: number;        // 最終更新日時（ミリ秒）
    hash: string;           // SHA-256ハッシュ
    changeType: 'added' | 'modified' | 'deleted';  // 変更種別
}

interface FileState {
    mtimeMs: number;
    hash: string;
}

/**
 * 指定ディレクトリ以下の全ファイルを再帰的に取得する
 * @param dir ディレクトリパス
 * @returns ファイルパスの配列（絶対パス）
 */
async function getAllFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const subFiles = await getAllFiles(fullPath);
            files.push(...subFiles);
        } else if (entry.isFile()) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * ファイルのSHA-256ハッシュを計算する
 * @param filePath ファイルパス
 * @returns ハッシュ文字列（16進数）
 */
async function calculateFileHash(filePath: string): Promise<string> {
    const data = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

/**
 * 指定ディレクトリのファイル状態を取得する
 * @param baseDir ベースディレクトリ（相対パス）
 * @returns ファイルパス（baseDirからの相対パス）をキー、FileStateを値とするマップ
 */
async function getCurrentFileStates(baseDir: string): Promise<Map<string, FileState>> {
    const absBaseDir = path.resolve(baseDir);
    const allFiles = await getAllFiles(absBaseDir);
    const fileStates = new Map<string, FileState>();

    for (const absFilePath of allFiles) {
        const stat = await fs.stat(absFilePath);
        const hash = await calculateFileHash(absFilePath);
        const relativePath = path.relative(absBaseDir, absFilePath).replace(/\\/g, '/'); // Windows対応でパス区切りを統一
        fileStates.set(relativePath, {
            mtimeMs: stat.mtimeMs,
            hash,
        });
    }
    return fileStates;
}

/**
 * 変更履歴ログを保存する
 * @param historyFilePath 変更履歴ログファイルパス
 * @param changes 変更情報配列
 */
async function saveChangeHistory(historyFilePath: string, changes: FileChangeInfo[]): Promise<void> {
    let history: FileChangeInfo[][] = [];
    try {
        const data = await fs.readFile(historyFilePath, 'utf-8');
        history = JSON.parse(data);
        if (!Array.isArray(history)) {
            history = [];
        }
    } catch (e) {
        // ファイルが存在しない場合は新規作成扱い
        history = [];
    }
    // 変更履歴に今回の変更を追加
    history.push(changes);
    await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2), 'utf-8');
}

/**
 * 変更検出を行う
 * @param baseDir 対象ディレクトリ（相対パス）
 * @param prevStateFilePath 前回の状態を保存したJSONファイルパス（相対パス）
 * @param options 追加オプション
 *   - onChangeDetected: 変更情報連携用コールバック関数（変更情報配列を受け取る）
 *   - changeHistoryFilePath: 変更履歴ログ保存ファイルパス
 * @returns 変更情報の配列
 */
export async function detectChanges(
    baseDir: string,
    prevStateFilePath: string,
    options?: {
        onChangeDetected?: (changes: FileChangeInfo[]) => void;
        changeHistoryFilePath?: string;
    }
): Promise<FileChangeInfo[]> {
    // 現在のファイル状態を取得
    const currentStates = await getCurrentFileStates(baseDir);

    // 前回の状態を読み込む
    let prevStates: Record<string, FileState> = {};
    try {
        const prevData = await fs.readFile(prevStateFilePath, 'utf-8');
        prevStates = JSON.parse(prevData);
    } catch (e) {
        // ファイルが存在しない場合は空の状態とする
        prevStates = {};
    }

    const changes: FileChangeInfo[] = [];

    // 変更・追加検出
    for (const [filePath, currentState] of currentStates.entries()) {
        const prevState = prevStates[filePath];
        if (!prevState) {
            // 新規追加
            changes.push({
                filePath,
                mtimeMs: currentState.mtimeMs,
                hash: currentState.hash,
                changeType: 'added',
            });
        } else if (
            prevState.mtimeMs !== currentState.mtimeMs ||
            prevState.hash !== currentState.hash
        ) {
            // 変更あり
            changes.push({
                filePath,
                mtimeMs: currentState.mtimeMs,
                hash: currentState.hash,
                changeType: 'modified',
            });
        }
    }

    // 削除検出
    for (const filePath of Object.keys(prevStates)) {
        if (!currentStates.has(filePath)) {
            changes.push({
                filePath,
                mtimeMs: 0,
                hash: '',
                changeType: 'deleted',
            });
        }
    }

    // 変更情報をJSONファイルに保存（上書き）
    const newStateObj: Record<string, FileState> = {};
    for (const [filePath, state] of currentStates.entries()) {
        newStateObj[filePath] = state;
    }
    await fs.writeFile(prevStateFilePath, JSON.stringify(newStateObj, null, 2), 'utf-8');

    // 変更履歴ログ保存（オプション）
    if (options?.changeHistoryFilePath) {
        await saveChangeHistory(options.changeHistoryFilePath, changes);
    }

    // Orchestrator管理コンポーネントへの変更情報連携（コールバック呼び出し）
    if (options?.onChangeDetected) {
        options.onChangeDetected(changes);
    }

    return changes;
}

/**
 * 変更情報をJSON文字列に変換するユーティリティ
 * @param changes 変更情報配列
 * @returns JSON文字列
 */
export function changesToJson(changes: FileChangeInfo[]): string {
    return JSON.stringify(changes, null, 2);
}

// 修正ポイント: ここからスケジューラ機能の実装

// 実行中ロックフラグ
let isRunning = false;

// ログファイルパス（適宜変更してください）
const logFilePath = path.resolve(__dirname, '../../logs/changeDetectorScheduler.log');

// ログ追記関数
async function appendLog(message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        await fs.appendFile(logFilePath, logMessage, 'utf-8');
    } catch (err) {
        console.error('ログファイル書き込みエラー:', err);
    }
}

/**
 * スケジューラで定期実行する変更検出処理
 */
async function scheduledDetectChanges() {
    if (isRunning) {
        await appendLog('前回の処理がまだ実行中のためスキップしました。');
        return;
    }
    isRunning = true;
    await appendLog('変更検出処理開始。');
    try {
        // ここでdetectChangesを呼び出す。パスは環境に合わせて適宜変更してください。
        const baseDir = path.resolve(__dirname, '../../target-directory'); // 対象ディレクトリ
        const prevStateFilePath = path.resolve(__dirname, '../../state/prevState.json'); // 前回状態保存ファイル
        const changeHistoryFilePath = path.resolve(__dirname, '../../state/changeHistory.json'); // 変更履歴ログファイル

        const changes = await detectChanges(baseDir, prevStateFilePath, {
            changeHistoryFilePath,
            onChangeDetected: (changes) => {
                // 変更情報連携処理（必要に応じて実装）
                appendLog(`変更検出: ${changes.length} 件`);
            },
        });

        await appendLog(`変更検出処理完了。変更件数: ${changes.length}`);
    } catch (error) {
        await appendLog(`エラー発生: ${(error as Error).message}`);
    } finally {
        isRunning = false;
        await appendLog('変更検出処理終了。');
    }
}

// cronスケジュール設定（例: 10分毎）
// 5〜15分間隔の要件に合わせて適宜変更可能
cron.schedule('*/10 * * * *', () => {
    scheduledDetectChanges();
});

// 修正ポイント: スケジューラ機能のエクスポート（必要に応じて）
export { scheduledDetectChanges };