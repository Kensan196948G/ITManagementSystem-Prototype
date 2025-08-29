import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

interface ConfigurationItemFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function ConfigurationItemForm({ onSave, onCancel }: ConfigurationItemFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="attributes">属性</TabsTrigger>
          <TabsTrigger value="relationships">関連性</TabsTrigger>
          <TabsTrigger value="history">履歴</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ci-name">名前</Label>
              <Input id="ci-name" placeholder="構成アイテム名" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ci-type">種類</Label>
              <Select>
                <SelectTrigger id="ci-type">
                  <SelectValue placeholder="種類を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="server">サーバー</SelectItem>
                  <SelectItem value="network">ネットワーク</SelectItem>
                  <SelectItem value="storage">ストレージ</SelectItem>
                  <SelectItem value="application">アプリケーション</SelectItem>
                  <SelectItem value="service">サービス</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ci-category">カテゴリ</Label>
              <Select>
                <SelectTrigger id="ci-category">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="database">データベースサーバー</SelectItem>
                  <SelectItem value="webserver">Webサーバー</SelectItem>
                  <SelectItem value="appserver">アプリケーションサーバー</SelectItem>
                  <SelectItem value="switch">スイッチ</SelectItem>
                  <SelectItem value="router">ルーター</SelectItem>
                  <SelectItem value="firewall">ファイアウォール</SelectItem>
                  <SelectItem value="san">ストレージエリアネットワーク</SelectItem>
                  <SelectItem value="saas">SaaSサービス</SelectItem>
                  <SelectItem value="custom">カスタム...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ci-status">ステータス</Label>
              <Select>
                <SelectTrigger id="ci-status">
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">稼働中</SelectItem>
                  <SelectItem value="maintenance">メンテナンス中</SelectItem>
                  <SelectItem value="inactive">非アクティブ</SelectItem>
                  <SelectItem value="planned">計画中</SelectItem>
                  <SelectItem value="retired">廃止</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ci-owner">所有者</Label>
              <Input id="ci-owner" placeholder="所有者/管理チーム" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ci-location">場所</Label>
              <Input id="ci-location" placeholder="物理的な場所/データセンター" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ci-description">説明</Label>
            <Textarea id="ci-description" placeholder="この構成アイテムの詳細な説明" />
          </div>
        </TabsContent>
        
        <TabsContent value="attributes" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-base font-medium">技術的な仕様</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ci-manufacturer">製造元</Label>
                  <Input id="ci-manufacturer" placeholder="製造元/ベンダー" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ci-model">モデル</Label>
                  <Input id="ci-model" placeholder="モデル/バージョン" />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ci-serial">シリアル番号</Label>
                  <Input id="ci-serial" placeholder="シリアル番号" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ci-purchase-date">購入日</Label>
                  <Input id="ci-purchase-date" type="date" />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ci-warranty">保証期限</Label>
                  <Input id="ci-warranty" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ci-support-contract">サポート契約番号</Label>
                  <Input id="ci-support-contract" placeholder="サポート契約番号" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-base font-medium">ネットワーク情報</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ci-ip-address">IPアドレス</Label>
                  <Input id="ci-ip-address" placeholder="例: 192.168.1.100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ci-mac-address">MACアドレス</Label>
                  <Input id="ci-mac-address" placeholder="例: 00:1A:2B:3C:4D:5E" />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ci-hostname">ホスト名</Label>
                  <Input id="ci-hostname" placeholder="ホスト名" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ci-domain">ドメイン</Label>
                  <Input id="ci-domain" placeholder="例: example.com" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-base font-medium">カスタム属性</h3>
              
              <div className="space-y-2">
                <Label>カスタム属性を追加</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="属性名" />
                  <Input placeholder="属性値" />
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                属性を追加
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="relationships" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-base font-medium">関連する構成アイテム</h3>
              
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="rel-item">構成アイテム</Label>
                    <Select>
                      <SelectTrigger id="rel-item">
                        <SelectValue placeholder="アイテムを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ci-001">MS-SQL-01</SelectItem>
                        <SelectItem value="ci-002">WEB-01</SelectItem>
                        <SelectItem value="ci-003">APP-01</SelectItem>
                        <SelectItem value="ci-004">CORE-SW-01</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rel-type">関連タイプ</Label>
                    <Select>
                      <SelectTrigger id="rel-type">
                        <SelectValue placeholder="関連タイプを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="depends_on">依存関係</SelectItem>
                        <SelectItem value="hosts">ホスト関係</SelectItem>
                        <SelectItem value="connects_to">接続関係</SelectItem>
                        <SelectItem value="part_of">構成関係</SelectItem>
                        <SelectItem value="used_by">使用関係</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">追加</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">構成アイテム</th>
                        <th className="p-2 text-left font-medium">関連タイプ</th>
                        <th className="p-2 text-left font-medium">アクション</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">CORE-SW-01</td>
                        <td className="p-2">依存関係</td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm">削除</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-base font-medium">変更履歴</h3>
              <p className="text-muted-foreground text-sm">
                新規作成のため、まだ変更履歴はありません。
              </p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">メンテナンス記録</h3>
                <Button variant="outline" size="sm">追加</Button>
              </div>
              <p className="text-muted-foreground text-sm">
                まだメンテナンス記録はありません。
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button onClick={onSave}>保存</Button>
      </div>
    </div>
  );
}