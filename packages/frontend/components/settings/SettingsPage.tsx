import { useState } from "react";
import { Bell, Building2, Database, Globe, Key, Lock, Mail, Plus, Server, Settings, ShieldCheck, User, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import { UsersList } from "./UsersList";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("system");

  const handleSave = () => {
    toast.success("設定が保存されました");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1>設定</h1>
        <p className="text-muted-foreground">
          アプリケーションの設定を管理します
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-auto">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full sm:w-auto">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>システム全般</span>
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>ユーザー</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>権限</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>通知</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>バックアップ</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>セキュリティ</span>
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>インテグレーション</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* システム全般設定 */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>システム全般設定</CardTitle>
              <CardDescription>
                アプリケーションの基本設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">会社名</Label>
                  <Input id="company-name" defaultValue="株式会社サンプル" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-name">サイト名</Label>
                  <Input id="site-name" defaultValue="IT運用管理システム" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">言語</Label>
                  <Select defaultValue="ja">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="言語を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="en">英語</SelectItem>
                      <SelectItem value="zh">中国語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">タイムゾーン</Label>
                  <Select defaultValue="asia-tokyo">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="タイムゾーンを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-tokyo">アジア/東京 (GMT+9:00)</SelectItem>
                      <SelectItem value="america-los_angeles">アメリカ/ロサンゼルス (GMT-7:00)</SelectItem>
                      <SelectItem value="europe-london">ヨーロッパ/ロンドン (GMT+0:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date-format">日付形式</Label>
                  <Select defaultValue="yyyy-mm-dd">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="日付形式を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yyyy-mm-dd">YYYY/MM/DD</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-format">時間形式</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger id="time-format">
                      <SelectValue placeholder="時間形式を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24時間 (例: 14:30)</SelectItem>
                      <SelectItem value="12h">12時間 (例: 02:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics">匿名使用統計情報の収集</Label>
                  <Switch id="analytics" defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">
                  アプリケーションの改善のため、匿名の使用統計情報を収集します
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh">自動更新</Label>
                  <Switch id="auto-refresh" defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">
                  データの自動更新を有効にします
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refresh-rate">更新間隔</Label>
                <Select defaultValue="5min">
                  <SelectTrigger id="refresh-rate">
                    <SelectValue placeholder="更新間隔を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1min">1分</SelectItem>
                    <SelectItem value="5min">5分</SelectItem>
                    <SelectItem value="10min">10分</SelectItem>
                    <SelectItem value="30min">30分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">リセット</Button>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ユーザー設定 */}
        <TabsContent value="user" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>個人設定</CardTitle>
                <CardDescription>
                  個人プロフィール設定と表示方法を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">氏名</Label>
                  <Input id="full-name" defaultValue="山田 太郎" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" type="email" defaultValue="t.yamada@example.com" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="theme">テーマ</Label>
                  <RadioGroup defaultValue="system" className="grid gap-4 pt-2 md:grid-cols-3">
                    <div>
                      <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                      <Label
                        htmlFor="theme-light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="mb-3 h-6 w-6">
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 2v2" />
                          <path d="M12 20v2" />
                          <path d="m4.93 4.93 1.41 1.41" />
                          <path d="m17.66 17.66 1.41 1.41" />
                          <path d="M2 12h2" />
                          <path d="M20 12h2" />
                          <path d="m6.34 17.66-1.41 1.41" />
                          <path d="m19.07 4.93-1.41 1.41" />
                        </svg>
                        <span className="text-sm font-medium">ライト</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                      <Label
                        htmlFor="theme-dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="mb-3 h-6 w-6">
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                        <span className="text-sm font-medium">ダーク</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                      <Label
                        htmlFor="theme-system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="mb-3 h-6 w-6">
                          <rect width="20" height="14" x="2" y="3" rx="2" />
                          <line x1="8" x2="16" y1="21" y2="21" />
                          <line x1="12" x2="12" y1="17" y2="21" />
                        </svg>
                        <span className="text-sm font-medium">システム</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-change">パスワード変更</Label>
                    <Button variant="outline" size="sm">変更</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two-factor">二要素認証</Label>
                    <Switch id="two-factor" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    二要素認証を有効にしてアカウントのセキュリティを強化します
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline">リセット</Button>
                <Button onClick={handleSave}>保存</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>表示設定</CardTitle>
                <CardDescription>
                  ダッシュボードの表示項目をカスタマイズします
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ダッシュボード表示項目</Label>
                  <div className="grid gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dashboard-incidents" defaultChecked />
                      <label htmlFor="dashboard-incidents" className="text-sm">インシデント一覧を表示</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dashboard-problems" defaultChecked />
                      <label htmlFor="dashboard-problems" className="text-sm">問題一覧を表示</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dashboard-changes" defaultChecked />
                      <label htmlFor="dashboard-changes" className="text-sm">変更一覧を表示</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dashboard-sla" defaultChecked />
                      <label htmlFor="dashboard-sla" className="text-sm">SLA状況を表示</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dashboard-stats" defaultChecked />
                      <label htmlFor="dashboard-stats" className="text-sm">統計情報を表示</label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>テーブル表示設定</Label>
                  <div className="grid gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-id" defaultChecked />
                      <label htmlFor="show-id" className="text-sm">ID列を表示</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-timestamps" defaultChecked />
                      <label htmlFor="show-timestamps" className="text-sm">タイムスタンプを表示</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-assignee" defaultChecked />
                      <label htmlFor="show-assignee" className="text-sm">担当者を表示</label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline">リセット</Button>
                <Button onClick={handleSave}>保存</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>ユーザー管理</CardTitle>
              <CardDescription>
                システムユーザーの追加、編集、削除を管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 権限設定 */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>権限設定</CardTitle>
              <CardDescription>
                ユーザーとロールの権限を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">ロール管理</h3>
                  <Button size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    新規ロール作成
                  </Button>
                </div>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">ロール名</th>
                        <th className="p-3 text-left font-medium">説明</th>
                        <th className="p-3 text-left font-medium">ユーザー数</th>
                        <th className="p-3 text-left font-medium">アクション</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">管理者</td>
                        <td className="p-3">全ての機能に対する完全なアクセス権</td>
                        <td className="p-3">3</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">編集</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">オペレーター</td>
                        <td className="p-3">運用機能へのアクセス権</td>
                        <td className="p-3">12</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">編集</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">閲覧者</td>
                        <td className="p-3">読み取り専用のアクセス権</td>
                        <td className="p-3">25</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">編集</Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium">申請者</td>
                        <td className="p-3">サービスリクエスト機能のみへのアクセス権</td>
                        <td className="p-3">47</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">編集</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">機能別権限設定</h3>
                  <Select defaultValue="admin">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ロールを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">管理者</SelectItem>
                      <SelectItem value="operator">オペレーター</SelectItem>
                      <SelectItem value="viewer">閲覧者</SelectItem>
                      <SelectItem value="requester">申請者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <h4 className="font-medium">ダッシュボード</h4>
                      <p className="text-sm text-muted-foreground">ダッシュボードの表示と操作</p>
                    </div>
                    <Select defaultValue="read">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="権限" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        <SelectItem value="read">閲覧</SelectItem>
                        <SelectItem value="write">編集</SelectItem>
                        <SelectItem value="admin">管理</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <h4 className="font-medium">インシデント管理</h4>
                      <p className="text-sm text-muted-foreground">インシデントの表示と操作</p>
                    </div>
                    <Select defaultValue="write">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="権限" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        <SelectItem value="read">閲覧</SelectItem>
                        <SelectItem value="write">編集</SelectItem>
                        <SelectItem value="admin">管理</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <h4 className="font-medium">問題管理</h4>
                      <p className="text-sm text-muted-foreground">問題の表示と操作</p>
                    </div>
                    <Select defaultValue="write">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="権限" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        <SelectItem value="read">閲覧</SelectItem>
                        <SelectItem value="write">編集</SelectItem>
                        <SelectItem value="admin">管理</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <h4 className="font-medium">変更管理</h4>
                      <p className="text-sm text-muted-foreground">変更の表示と操作</p>
                    </div>
                    <Select defaultValue="admin">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="権限" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        <SelectItem value="read">閲覧</SelectItem>
                        <SelectItem value="write">編集</SelectItem>
                        <SelectItem value="admin">管理</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <h4 className="font-medium">SLA管理</h4>
                      <p className="text-sm text-muted-foreground">SLAの表示と操作</p>
                    </div>
                    <Select defaultValue="admin">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="権限" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        <SelectItem value="read">閲覧</SelectItem>
                        <SelectItem value="write">編集</SelectItem>
                        <SelectItem value="admin">管理</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">リセット</Button>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 通知設定 */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                通知の受信方法と頻度を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-base font-medium">通知チャネル</h3>
                <div className="grid gap-4 pt-2">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">メール通知</h4>
                        <p className="text-sm text-muted-foreground">
                          t.yamada@example.com
                        </p>
                      </div>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">ブラウザ通知</h4>
                        <p className="text-sm text-muted-foreground">
                          アプリケーション内のポップアップ通知
                        </p>
                      </div>
                    </div>
                    <Switch id="browser-notifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.5 14.5L5.5 17.5L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 20.5H18.5C19.0523 20.5 19.5 20.0523 19.5 19.5V13.5C19.5 12.9477 19.0523 12.5 18.5 12.5H14.5L12 15H8.5C7.94772 15 7.5 15.4477 7.5 16V19.5C7.5 20.0523 7.94772 20.5 8.5 20.5H12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 12.5V3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 12.5V3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.5 7.5H18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <h4 className="font-medium">Microsoft Teams通知</h4>
                        <p className="text-sm text-muted-foreground">
                          重要な通知をTeamsに送信
                        </p>
                      </div>
                    </div>
                    <Switch id="teams-notifications" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base font-medium">通知イベント</h3>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">インシデント</h4>
                  <div className="grid gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-incident-new" defaultChecked />
                      <label htmlFor="notify-incident-new" className="text-sm">新規インシデントが作成されたとき</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-incident-assigned" defaultChecked />
                      <label htmlFor="notify-incident-assigned" className="text-sm">インシデントが自分に割り当てられたとき</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-incident-status" defaultChecked />
                      <label htmlFor="notify-incident-status" className="text-sm">インシデントのステータスが変更されたとき</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-incident-sla" defaultChecked />
                      <label htmlFor="notify-incident-sla" className="text-sm">インシデントのSLA違反が近づいているとき</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">問題管理</h4>
                  <div className="grid gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-problem-new" defaultChecked />
                      <label htmlFor="notify-problem-new" className="text-sm">新規問題が登録されたとき</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-problem-assigned" defaultChecked />
                      <label htmlFor="notify-problem-assigned" className="text-sm">問題が自分に割り当てられたとき</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-problem-status" />
                      <label htmlFor="notify-problem-status" className="text-sm">問題のステータスが変更されたとき</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">変更管理</h4>
                  <div className="grid gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-change-new" defaultChecked />
                      <label htmlFor="notify-change-new" className="text-sm">新規変更リクエストが作成されたとき</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-change-approval" defaultChecked />
                      <label htmlFor="notify-change-approval" className="text-sm">変更の承認依頼があったとき</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-change-approved" defaultChecked />
                      <label htmlFor="notify-change-approved" className="text-sm">変更が承認されたとき</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-change-implemented" />
                      <label htmlFor="notify-change-implemented" className="text-sm">変更が実装されたとき</label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">リセット</Button>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* バックアップ設定 */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>バックアップ設定</CardTitle>
              <CardDescription>
                データバックアップのスケジュールと保存先を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">自動バックアップ</h3>
                  <Switch id="auto-backup" defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">
                  指定したスケジュールで自動的にシステムデータをバックアップします
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium">バックアップスケジュール</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">頻度</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder="バックアップ頻度を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">1時間ごと</SelectItem>
                        <SelectItem value="daily">毎日</SelectItem>
                        <SelectItem value="weekly">毎週</SelectItem>
                        <SelectItem value="monthly">毎月</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-time">時間</Label>
                    <Select defaultValue="0200">
                      <SelectTrigger id="backup-time">
                        <SelectValue placeholder="バックアップ時間を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0000">00:00</SelectItem>
                        <SelectItem value="0200">02:00</SelectItem>
                        <SelectItem value="0400">04:00</SelectItem>
                        <SelectItem value="2200">22:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-retention">保持期間</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="backup-retention">
                      <SelectValue placeholder="保持期間を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7日間</SelectItem>
                      <SelectItem value="14">14日間</SelectItem>
                      <SelectItem value="30">30日間</SelectItem>
                      <SelectItem value="90">90日間</SelectItem>
                      <SelectItem value="365">1年間</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base font-medium">バックアップ保存先</h3>
                <RadioGroup defaultValue="local" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="local" id="backup-local" />
                    <Label htmlFor="backup-local">ローカルストレージ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="network" id="backup-network" />
                    <Label htmlFor="backup-network">ネットワークドライブ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cloud" id="backup-cloud" />
                    <Label htmlFor="backup-cloud">クラウドストレージ</Label>
                  </div>
                </RadioGroup>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-path">保存パス</Label>
                    <Input id="backup-path" defaultValue="\\server\backups\itsm" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="backup-username">ユーザー名 (オプション)</Label>
                      <Input id="backup-username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-password">パスワード (オプション)</Label>
                      <Input id="backup-password" type="password" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium">最新のバックアップ</h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">ファイル名</th>
                        <th className="p-3 text-left font-medium">サイズ</th>
                        <th className="p-3 text-left font-medium">日時</th>
                        <th className="p-3 text-left font-medium">ステータス</th>
                        <th className="p-3 text-left font-medium">アクション</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">backup-20250509-0200.zip</td>
                        <td className="p-3">1.2 GB</td>
                        <td className="p-3">2025-05-09 02:00</td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            成功
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">ダウンロード</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">backup-20250508-0200.zip</td>
                        <td className="p-3">1.2 GB</td>
                        <td className="p-3">2025-05-08 02:00</td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            成功
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">ダウンロード</Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium">backup-20250507-0200.zip</td>
                        <td className="p-3">1.1 GB</td>
                        <td className="p-3">2025-05-07 02:00</td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            成功
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">ダウンロード</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center space-x-2">
                  <Button variant="outline">
                    今すぐバックアップ
                  </Button>
                  <Button variant="outline">
                    すべてのバックアップを表示
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">リセット</Button>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* セキュリティ設定 */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>セキュリティ設定</CardTitle>
              <CardDescription>
                アプリケーションのセキュリティ設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-medium">認証セキュリティ</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="mfa">多要素認証（MFA）</Label>
                      <p className="text-sm text-muted-foreground">
                        すべてのユーザーに多要素認証を強制する
                      </p>
                    </div>
                    <Switch id="mfa" defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-policy">パスワードポリシー</Label>
                  <Select defaultValue="strong">
                    <SelectTrigger id="password-policy">
                      <SelectValue placeholder="パスワードポリシーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">基本（最低8文字）</SelectItem>
                      <SelectItem value="standard">標準（最低8文字、英数字混在）</SelectItem>
                      <SelectItem value="strong">強（最低10文字、英数字記号混在）</SelectItem>
                      <SelectItem value="custom">カスタム</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-expiry">パスワード有効期限</Label>
                  <Select defaultValue="90">
                    <SelectTrigger id="password-expiry">
                      <SelectValue placeholder="パスワード有効期限を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">無期限</SelectItem>
                      <SelectItem value="30">30日</SelectItem>
                      <SelectItem value="60">60日</SelectItem>
                      <SelectItem value="90">90日</SelectItem>
                      <SelectItem value="180">180日</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="account-lockout">アカウントロックアウト</Label>
                      <p className="text-sm text-muted-foreground">
                        連続したログイン失敗後にアカウントをロックする
                      </p>
                    </div>
                    <Switch id="account-lockout" defaultChecked />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lockout-threshold">ロックアウトしきい値</Label>
                    <Select defaultValue="5">
                      <SelectTrigger id="lockout-threshold">
                        <SelectValue placeholder="しきい値を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3回失敗</SelectItem>
                        <SelectItem value="5">5回失敗</SelectItem>
                        <SelectItem value="10">10回失敗</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockout-duration">ロックアウト期間</Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="lockout-duration">
                        <SelectValue placeholder="期間を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15分</SelectItem>
                        <SelectItem value="30">30分</SelectItem>
                        <SelectItem value="60">1時間</SelectItem>
                        <SelectItem value="manual">手動解除まで</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base font-medium">セッションセキュリティ</h3>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">セッションタイムアウト</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="session-timeout">
                      <SelectValue placeholder="タイムアウト時間を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15分</SelectItem>
                      <SelectItem value="30">30分</SelectItem>
                      <SelectItem value="60">1時間</SelectItem>
                      <SelectItem value="120">2時間</SelectItem>
                      <SelectItem value="never">無期限</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="concurrent-sessions">同時セッション制限</Label>
                      <p className="text-sm text-muted-foreground">
                        1ユーザーあたりの同時セッション数を制限する
                      </p>
                    </div>
                    <Switch id="concurrent-sessions" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="ip-restriction">IP制限</Label>
                      <p className="text-sm text-muted-foreground">
                        特定のIPアドレス範囲からのアクセスのみを許可する
                      </p>
                    </div>
                    <Switch id="ip-restriction" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base font-medium">データセキュリティ</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="data-encryption">データ暗号化</Label>
                      <p className="text-sm text-muted-foreground">
                        保存データと通信データの暗号化を有効にする
                      </p>
                    </div>
                    <Switch id="data-encryption" defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="audit-logging">監査ログ</Label>
                      <p className="text-sm text-muted-foreground">
                        すべてのユーザーアクションをログに記録する
                      </p>
                    </div>
                    <Switch id="audit-logging" defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audit-retention">監査ログ保持期間</Label>
                  <Select defaultValue="365">
                    <SelectTrigger id="audit-retention">
                      <SelectValue placeholder="保持期間を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90日</SelectItem>
                      <SelectItem value="180">180日</SelectItem>
                      <SelectItem value="365">1年</SelectItem>
                      <SelectItem value="730">2年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    セキュリティ監査レポート
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">リセット</Button>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* インテグレーション設定 */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>インテグレーション設定</CardTitle>
              <CardDescription>
                外部システムとの連携設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-medium">Microsoft 365連携</h3>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#D83B01" />
                        <path d="M5 5H11.5V11.5H5V5Z" fill="white" />
                        <path d="M12.5 5H19V11.5H12.5V5Z" fill="white" />
                        <path d="M5 12.5H11.5V19H5V12.5Z" fill="white" />
                        <path d="M12.5 12.5H19V19H12.5V12.5Z" fill="white" />
                      </svg>
                      <div>
                        <h4 className="font-medium">Microsoft 365</h4>
                        <p className="text-sm text-muted-foreground">
                          Exchange Online、Teams、SharePoint、OneDriveとの連携
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      接続済み
                    </Badge>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="m365-tenant">テナントID</Label>
                        <Input id="m365-tenant" placeholder="00000000-0000-0000-0000-000000000000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="m365-client">クライアントID</Label>
                        <Input id="m365-client" placeholder="00000000-0000-0000-0000-000000000000" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="m365-secret">クライアントシークレット</Label>
                      <Input id="m365-secret" type="password" placeholder="************" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="m365-scopes">要求スコープ</Label>
                      <Textarea 
                        id="m365-scopes" 
                        defaultValue="Mail.Read Mail.Send Calendar.ReadWrite Directory.Read.All User.Read" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button variant="outline">接続テスト</Button>
                      <Button>保存</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Active Directory連携</h3>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Server className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Active Directory / Entra ID</h4>
                        <p className="text-sm text-muted-foreground">
                          IDプロバイダーとの認証・ユーザー同期連携
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      接続済み
                    </Badge>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ad-server">LDAPサーバー</Label>
                        <Input id="ad-server" defaultValue="ldap://ad.example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ad-domain">ドメイン</Label>
                        <Input id="ad-domain" defaultValue="example.com" />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ad-username">ユーザー名</Label>
                        <Input id="ad-username" defaultValue="ldap-sync" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ad-password">パスワード</Label>
                        <Input id="ad-password" type="password" placeholder="************" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ad-sync-schedule">同期スケジュール</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger id="ad-sync-schedule">
                          <SelectValue placeholder="同期頻度を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">1時間ごと</SelectItem>
                          <SelectItem value="daily">毎日</SelectItem>
                          <SelectItem value="weekly">毎週</SelectItem>
                          <SelectItem value="manual">手動のみ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button variant="outline">今すぐ同期</Button>
                      <Button>保存</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">その他の連携</h3>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" rx="4" fill="#4A154B" />
                          <path d="M10.0186 6.37598C10.0186 5.49988 10.7371 4.78125 11.6132 4.78125C12.4893 4.78125 13.2079 5.49981 13.2079 6.37598V11.8384H18.6697C19.5458 11.8384 20.2644 12.557 20.2644 13.4331C20.2644 14.3093 19.5458 15.0279 18.6697 15.0279H13.2079V20.4902C13.2079 21.3663 12.4893 22.0849 11.6132 22.0849C10.7371 22.0849 10.0186 21.3663 10.0186 20.4902V15.0279H4.55641C3.68031 15.0279 2.96168 14.3093 2.96168 13.4331C2.96168 12.557 3.68024 11.8384 4.55641 11.8384H10.0186V6.37598Z" fill="white" />
                        </svg>
                        <div>
                          <h4 className="font-medium">SkySea Client View</h4>
                          <p className="text-sm text-muted-foreground">
                            クライアント管理システムとの連携
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        未接続
                      </Badge>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">接続設定</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" rx="4" fill="#0078D7" />
                          <path d="M12 5.75L6.75 12L12 18.25L17.25 12L12 5.75ZM3.75 12L12 20.25L20.25 12L12 3.75L3.75 12Z" fill="white" />
                        </svg>
                        <div>
                          <h4 className="font-medium">DeskNet'sNeo / Appsuit</h4>
                          <p className="text-sm text-muted-foreground">
                            グループウェアとの連携
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        未接続
                      </Badge>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">接続設定</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" rx="4" fill="#FF6600" />
                          <path d="M6 7H18V17H6V7ZM8 9V15H16V9H8Z" fill="white" />
                        </svg>
                        <div>
                          <h4 className="font-medium">DirectCloud</h4>
                          <p className="text-sm text-muted-foreground">
                            クラウドストレージシステムとの連携
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        接続済み
                      </Badge>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">設定を編集</Button>
                    </div>
                  </div>
                </div>
                
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新規連携を追加
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline">リセット</Button>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}