import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

interface SecurityIncidentFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function SecurityIncidentForm({ onSave, onCancel }: SecurityIncidentFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="incident-title">タイトル</Label>
            <Input id="incident-title" placeholder="インシデントの概要" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="incident-type">タイプ</Label>
            <Select>
              <SelectTrigger id="incident-type">
                <SelectValue placeholder="タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unauthorized_access">不正アクセス試行</SelectItem>
                <SelectItem value="data_leak">データ流出の可能性</SelectItem>
                <SelectItem value="phishing">フィッシング</SelectItem>
                <SelectItem value="malware">マルウェア</SelectItem>
                <SelectItem value="config_change">設定変更</SelectItem>
                <SelectItem value="privilege_abuse">権限悪用</SelectItem>
                <SelectItem value="dos">サービス妨害</SelectItem>
                <SelectItem value="web_attack">Webアプリケーション攻撃</SelectItem>
                <SelectItem value="policy_violation">ポリシー違反</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="incident-severity">重要度</Label>
            <Select>
              <SelectTrigger id="incident-severity">
                <SelectValue placeholder="重要度を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">重大</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="incident-status">ステータス</Label>
            <Select defaultValue="investigating">
              <SelectTrigger id="incident-status">
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investigating">調査中</SelectItem>
                <SelectItem value="in_progress">対応中</SelectItem>
                <SelectItem value="resolved">対応完了</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="incident-description">詳細説明</Label>
          <Textarea id="incident-description" placeholder="インシデントの詳細な説明を記入してください" rows={4} />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label>影響を受けたシステム</Label>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-microsoft365" />
                <label htmlFor="affected-microsoft365" className="text-sm">Microsoft 365</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-entra" />
                <label htmlFor="affected-entra" className="text-sm">Microsoft Entra ID</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-exchange" />
                <label htmlFor="affected-exchange" className="text-sm">Exchange Online</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-sharepoint" />
                <label htmlFor="affected-sharepoint" className="text-sm">SharePoint</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-teams" />
                <label htmlFor="affected-teams" className="text-sm">Microsoft Teams</label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-network" />
                <label htmlFor="affected-network" className="text-sm">社内ネットワーク</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-client" />
                <label htmlFor="affected-client" className="text-sm">クライアントPC</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-server" />
                <label htmlFor="affected-server" className="text-sm">サーバー</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-webapp" />
                <label htmlFor="affected-webapp" className="text-sm">Webアプリケーション</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="affected-other" />
                <label htmlFor="affected-other" className="text-sm">その他</label>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="incident-reporter">報告者</Label>
            <Select>
              <SelectTrigger id="incident-reporter">
                <SelectValue placeholder="報告者を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yamada">山田太郎</SelectItem>
                <SelectItem value="suzuki">鈴木花子</SelectItem>
                <SelectItem value="tanaka">田中次郎</SelectItem>
                <SelectItem value="ito">伊藤めぐみ</SelectItem>
                <SelectItem value="sato">佐藤三郎</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="incident-assignee">担当者</Label>
            <Select>
              <SelectTrigger id="incident-assignee">
                <SelectValue placeholder="担当者を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sato">佐藤三郎</SelectItem>
                <SelectItem value="tanaka">田中次郎</SelectItem>
                <SelectItem value="yamada">山田太郎</SelectItem>
                <SelectItem value="ito">伊藤めぐみ</SelectItem>
                <SelectItem value="watanabe">渡辺健太</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="incident-action">初期対応アクション</Label>
          <Textarea id="incident-action" placeholder="すでに実施した対応策や今後実施する予定のアクションを記入してください" rows={3} />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="notify-management" />
          <label htmlFor="notify-management" className="text-sm">管理者に通知する</label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button onClick={onSave}>保存</Button>
      </div>
    </div>
  );
}