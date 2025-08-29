import { useState } from "react";
import { Clock, FileCheck, FileText, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

// RCAカテゴリの選択肢
const rcaCategories = [
  { value: "hardware", label: "ハードウェア" },
  { value: "software", label: "ソフトウェア" },
  { value: "network", label: "ネットワーク" },
  { value: "configuration", label: "構成・設定" },
  { value: "procedure", label: "手順・プロセス" },
  { value: "human", label: "人的要因" },
  { value: "external", label: "外部要因" },
  { value: "security", label: "セキュリティ" },
  { value: "performance", label: "パフォーマンス" },
  { value: "compatibility", label: "互換性" },
];

// 影響レベルの選択肢
const impactLevels = [
  { value: "critical", label: "クリティカル" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
  { value: "minimal", label: "最小" },
];

export function RootCauseAnalysisForm({ problemId = "PRB-004", onSave, onCancel }: { problemId?: string; onSave?: () => void; onCancel?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 実際のアプリではここでAPI呼び出しなど
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSave) onSave();
    }, 1000);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>根本原因分析（RCA）レポート</CardTitle>
              <CardDescription>
                問題：{problemId} - Active DirectoryとEntra IDの同期不具合
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>ドラフト</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="rca-title">タイトル</Label>
              <Input
                id="rca-title"
                placeholder="RCAレポートのタイトルを入力"
                defaultValue="Active DirectoryとEntra ID同期問題に関する根本原因分析"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="rca-category">カテゴリ</Label>
                <Select defaultValue="configuration">
                  <SelectTrigger id="rca-category">
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {rcaCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rca-impact">影響レベル</Label>
                <Select defaultValue="high">
                  <SelectTrigger id="rca-impact">
                    <SelectValue placeholder="影響レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {impactLevels.map((impact) => (
                      <SelectItem key={impact.value} value={impact.value}>
                        {impact.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <Label htmlFor="incident-summary">インシデント概要</Label>
            <Textarea
              id="incident-summary"
              placeholder="発生したインシデントの概要を記述してください"
              rows={3}
              defaultValue="社内Active Directoryでユーザーアカウントが作成または変更された際に、Entra Connectを使用したMicrosoft Entra IDへの同期処理が断続的に失敗していました。この問題により、複数のユーザーがMicrosoft 365サービスにアクセスできない状況が発生しました。"
            />
            
            <Label htmlFor="symptoms">観測された症状</Label>
            <Textarea
              id="symptoms"
              placeholder="観測された症状を詳細に記述してください"
              rows={4}
              defaultValue="- ユーザーアカウント変更後、Microsoft 365サービスへのログインが失敗する\n- パスワードリセット後の同期遅延（最大12時間）\n- 新規追加ユーザーがEntra IDに反映されない\n- 同期ログにタイムアウトエラーが記録されている（Event ID 6329）\n- 同期処理中にEntra Connectサーバーのメモリ使用率が95%以上に上昇"
            />
            
            <Label htmlFor="investigation">調査プロセス</Label>
            <Textarea
              id="investigation"
              placeholder="実施した調査手順について詳細に記述してください"
              rows={5}
              defaultValue="1. Entra Connectの同期ログを確認し、エラーパターンを分析\n2. 同期処理中のサーバーリソース使用状況をモニタリング\n3. Microsoft 365管理センターからのエラーメッセージを収集\n4. ネットワークパケットキャプチャを実施し、接続状況を確認\n5. テスト環境でのユーザー同期テストを実施\n6. ベンダーマニュアルと比較し、最適な構成設定を検証"
            />
            
            <Label htmlFor="root-cause">特定された根本原因</Label>
            <Textarea
              id="root-cause"
              placeholder="特定された根本原因について詳細に記述してください"
              rows={5}
              defaultValue="以下の2つの要因が組み合わさって問題が発生していました：\n\n1. Entra Connectサーバーのメモリ不足：\n割り当てられたメモリ（16GB）が、大量のディレクトリ変更（特に組織改編後の一括変更）を処理するには不十分であり、同期プロセスがメモリ不足によりタイムアウトしていました。\n\n2. ネットワーク設定の制限：\nファイアウォールの設定により、一部の同期リクエストが間欠的にブロックされていました。具体的には、Entra ID接続用のポートに対するトラフィックのタイムアウト値が短すぎる設定となっていました。"
            />
            
            <div className="space-y-2">
              <Label>対応策</Label>
              <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-start space-x-2">
                  <Checkbox id="fix1" defaultChecked />
                  <div className="grid gap-1.5">
                    <Label htmlFor="fix1" className="text-base">Entra Connectサーバーのメモリ増設</Label>
                    <p className="text-sm text-muted-foreground">
                      サーバーのメモリを16GBから32GBに増設し、同期処理のパフォーマンスを向上させる
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox id="fix2" defaultChecked />
                  <div className="grid gap-1.5">
                    <Label htmlFor="fix2" className="text-base">同期スケジュールの最適化</Label>
                    <p className="text-sm text-muted-foreground">
                      同期スケジュールをピーク時間帯を避けて設定し、集中的なリソース使用を分散させる
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox id="fix3" defaultChecked />
                  <div className="grid gap-1.5">
                    <Label htmlFor="fix3" className="text-base">ネットワークファイアウォールルールの最適化</Label>
                    <p className="text-sm text-muted-foreground">
                      Microsoft Entra ID接続用のファイアウォールルールを見直し、タイムアウト値を適切に設定する
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox id="fix4" defaultChecked />
                  <div className="grid gap-1.5">
                    <Label htmlFor="fix4" className="text-base">Microsoft推奨設定への構成変更</Label>
                    <p className="text-sm text-muted-foreground">
                      Entra Connectの構成を最新のMicrosoft推奨設定に合わせて更新する
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Label htmlFor="lessons">学んだ教訓</Label>
            <Textarea
              id="lessons"
              placeholder="この問題から学んだ教訓や今後の予防策について記述してください"
              rows={4}
              defaultValue="1. ディレクトリ同期サービスのリソース要件を定期的に見直す必要がある\n2. 大規模な組織変更前には、同期処理の負荷テストを実施すべき\n3. Microsoft 365サービスのネットワーク要件は定期的に更新されるため、継続的な監視と更新が必要\n4. 同期問題の早期発見のために、監視システムにプロアクティブなアラートを追加すべき"
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>添付ファイル</Label>
            <div className="space-y-2 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Entra_Connect_Error_Logs.pdf</span>
                </div>
                <Button variant="ghost" size="sm">削除</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Server_Performance_Analysis.xlsx</span>
                </div>
                <Button variant="ghost" size="sm">削除</Button>
              </div>
              <div className="mt-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <FileCheck className="h-4 w-4" />
                  ファイルを追加
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={onCancel}>
            キャンセル
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">下書き保存</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>保存中...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  <span>保存して完了</span>
                </div>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}