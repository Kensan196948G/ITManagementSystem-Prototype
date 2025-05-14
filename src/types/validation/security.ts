/**
 * セキュリティ検証ユーティリティ
 */
export const SecurityValidators = {
    /**
     * XSS攻撃を防ぐための検証
     */
    preventXSS: (text: string): void => {
        const xssPatterns = [
            /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
            /javascript:/gi,
            /on\w+="[^"]*"/gi,
            /on\w+='[^']*'/gi
        ];

        for (const pattern of xssPatterns) {
            if (pattern.test(text)) {
                throw new Error(`潜在的なXSS脆弱性が検出されました: ${text}`);
            }
        }
    },

    /**
     * SQLインジェクションを防ぐための検証
     */
    preventSQLInjection: (text: string): void => {
        const sqlPatterns = [
            /(['";]|\-\-).*?(?=[\s]|$)/gi,
            /(union|select|insert|delete|update|drop|alter|create|exec)\s+/gi
        ];

        for (const pattern of sqlPatterns) {
            if (pattern.test(text)) {
                throw new Error(`潜在的なSQLインジェクション脆弱性が検出されました: ${text}`);
            }
        }
    }
};