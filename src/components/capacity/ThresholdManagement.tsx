import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { PlusCircle, Save, Bell, BellOff, Edit, Trash } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// サンプルデータ - 実際のアプリケーションではAPIからデータを取得
const thresholds = [
  {
    id: "thresh1",
    name: "CPU使用率",
    resource: "すべてのサーバー",
    warning: 75,
    critical: 90,
    currentValue: 68,
    status: "normal",
    enabled: true,
    notification: "email",
  },
  {
    id: "thresh2",
    name: "メモリ使用率",
    resource: "アプリケーションサーバー",
    warning: 80,
    critical: 95,
    currentValue: 72,
    status: "normal",
    enabled: true,
    notification: "email",
  },
  {
    id: "thresh3",
    name: "ディスク使用率",
    resource: "データベースサーバー",
    warning: 70,
    critical: 85,
    currentValue: 78,
    status: "warning",
    enabled: true,
    notification: "all",
  },
  {
    id: "thresh4",
    name: "ネットワーク帯域",
    resource: "コアスイッチ",
    warning: 60,
    critical: 80,
    currentValue: 55,
    status: "normal",
    enabled: true,
    notification: "dashboard",
  },
  {
    id: "thresh5",
    name: "データベース接続数",
    resource: "メインDBクラスター",
    warning: 800,
    critical: 1000,
    currentValue: 920,
    status: "critical",
    enabled: true,
    notification: "all",
  },
  {
    id: "thresh6",
    name: "バックアップ保存領域",
    resource: "バックアップサーバー",
    warning: 85,
    critical: 95,
    currentValue: 82,
    status: "normal",
    enabled: false,
    notification: "email",
  },
];

export function ThresholdManagement() {
  const [thresholdItems, setThresholdItems] = useState(thresholds);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState({
    id: "",
    name: "",
    resource: "",
    warning: 75,
    critical: 90,
    notification: "email"
  });
  const [editMode, setEditMode] = useState(false);

  // しきい値の追加/編集ダイアログを開く
  const openThresholdDialog = (threshold = null) => {
    if (threshold) {
      setCurrentThreshold({
        id: threshold.id,
        name: threshold.name,
        resource: threshold.resource,
        warning: threshold.warning,
        critical: threshold.critical,
        notification: threshold.notification
      });
      setEditMode(true);
    } else {
      setCurrentThreshold({
        id: `thresh${thresholdItems.length + 1}`,
        name: "",
        resource: "",
        warning: 75,
        critical: 90,
        notification: "email"
      });
      setEditMode(false);
    }
    setIsDialogOpen(true);
  };

  // しきい値の保存処理
  const saveThreshold = () => {
    if (editMode) {
      // 既存のしきい値を更新
      setThresholdItems(thresholdItems.map(item => 
        item.id === currentThreshold.id ? {
          ...item,
          name: currentThreshold.name,
          resource: currentThreshold.resource,
          warning: currentThreshold.warning,
          critical: currentThreshold.critical,
          notification: currentThreshold.notification
        } : item
      ));
    } else {
      // 新しいしきい値を追加
      setThresholdItems([...thresholdItems, {
        ...currentThreshold,
        currentValue: 0,
        status: "normal",
        enabled: true
      }]);
    }
    setIsDialogOpen(false);
  };

  // しきい値の有効/無効切り替え
  const toggleThreshold = (id) => {
    setThresholdItems(thresholdItems.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  // しきい値の削除
  const deleteThreshold = (id) => {
    setThresholdItems(thresholdItems.filter(item => item.id !== id));
  };

  // ステータスに基づいたバッジの表示
  const getStatusBadge = (status) => {
    switch (status) {
      case "critical":
        return <Badge variant="destructive">緊急</Badge>;
      case "warning":
        return <Badge>警告</Badge>;
      case "normal":
        return <Badge variant="secondary">正常</Badge>;
      default:
        return <Badge variant="outline">不明</Badge>;
    }
  };

  // 通知方法のテキスト表示
  const getNotificationText = (method) => {
    switch (method) {
      case "email":
        return "メール";
      case "dashboard":
        return "ダッシュボード";
      case "all":
        return "すべて";
      default:
        return "なし";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3>リソースしきい値の管理</h3>
        <Button onClick={() => openThresholdDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新しいしきい値
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>リソース</TableHead>
                <TableHead>警告</TableHead>
                <TableHead>緊急</TableHead>
                <TableHead>現在値</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>通知</TableHead>
                <TableHead>有効</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {thresholdItems.map((threshold) => (
                <TableRow key={threshold.id}>
                  <TableCell className="font-medium">{threshold.name}</TableCell>
                  <TableCell>{threshold.resource}</TableCell>
                  <TableCell>{threshold.warning}%</TableCell>
                  <TableCell>{threshold.critical}%</TableCell>
                  <TableCell>{threshold.currentValue}%</TableCell>
                  <TableCell>{getStatusBadge(threshold.status)}</TableCell>
                  <TableCell>{getNotificationText(threshold.notification)}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={threshold.enabled} 
                      onCheckedChange={() => toggleThreshold(threshold.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openThresholdDialog(threshold)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteThreshold(threshold.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "しきい値の編集" : "新しいしきい値"}</DialogTitle>
            <DialogDescription>
              リソース使用率のしきい値を設定し、アラート通知を構成します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="threshold-name">しきい値名</Label>
                <Input 
                  id="threshold-name" 
                  value={currentThreshold.name} 
                  onChange={(e) => setCurrentThreshold({...currentThreshold, name: e.target.value})}
                  placeholder="CPU使用率など"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold-resource">リソース</Label>
                <Select 
                  value={currentThreshold.resource} 
                  onValueChange={(value) => setCurrentThreshold({...currentThreshold, resource: value})}
                >
                  <SelectTrigger id="threshold-resource">
                    <SelectValue placeholder="リソースを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="すべてのサーバー">すべてのサーバー</SelectItem>
                    <SelectItem value="アプリケーションサーバー">アプリケーションサーバー</SelectItem>
                    <SelectItem value="データベースサーバー">データベースサーバー</SelectItem>
                    <SelectItem value="バックアップサーバー">バックアップサーバー</SelectItem>
                    <SelectItem value="コアスイッチ">コアスイッチ</SelectItem>
                    <SelectItem value="メインDBクラスター">メインDBクラスター</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>警告しきい値 ({currentThreshold.warning}%)</Label>
                  <span className="text-amber-500 text-sm">警告</span>
                </div>
                <Slider 
                  min={0} 
                  max={100} 
                  step={1} 
                  value={[currentThreshold.warning]} 
                  onValueChange={(value) => setCurrentThreshold({...currentThreshold, warning: value[0]})}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>緊急しきい値 ({currentThreshold.critical}%)</Label>
                  <span className="text-destructive text-sm">緊急</span>
                </div>
                <Slider 
                  min={0} 
                  max={100} 
                  step={1} 
                  value={[currentThreshold.critical]} 
                  onValueChange={(value) => setCurrentThreshold({...currentThreshold, critical: value[0]})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>通知方法</Label>
              <RadioGroup 
                value={currentThreshold.notification} 
                onValueChange={(value) => setCurrentThreshold({...currentThreshold, notification: value})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="notification-email" />
                  <Label htmlFor="notification-email">メール</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dashboard" id="notification-dashboard" />
                  <Label htmlFor="notification-dashboard">ダッシュボード</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="notification-all" />
                  <Label htmlFor="notification-all">すべて</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={saveThreshold}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}