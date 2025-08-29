import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";

interface NewIncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incidentData: any) => void;
}

export function NewIncidentForm({ isOpen, onClose, onSubmit }: NewIncidentFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    category: "",
    impact: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.title || !formData.priority || !formData.impact) {
      toast.error("必須項目を入力してください");
      return;
    }
    
    // 新しいインシデントIDを生成（実際はバックエンドで生成される）
    const newIncident = {
      ...formData,
      id: `INC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: "未対応",
      assignee: { name: "未割り当て", initials: "--" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sla: formData.priority === "緊急" ? "残り2時間" : 
           formData.priority === "高" ? "残り4時間" : 
           formData.priority === "中" ? "残り8時間" : "残り16時間"
    };
    
    onSubmit(newIncident);
    
    // フォームをリセット
    setFormData({
      title: "",
      description: "",
      priority: "",
      category: "",
      impact: "",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>新規インシデント登録</DialogTitle>
          <DialogDescription>
            サービスの障害や問題を報告するには、以下のフォームに必要事項を入力してください。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="インシデントのタイトルを入力"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">詳細説明</Label>
            <Textarea
              id="description"
              placeholder="発生した問題について詳しく説明してください"
              rows={5}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">優先度 <span className="text-destructive">*</span></Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="優先度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="緊急">緊急</SelectItem>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ネットワーク">ネットワーク</SelectItem>
                  <SelectItem value="サーバー">サーバー</SelectItem>
                  <SelectItem value="アプリケーション">アプリケーション</SelectItem>
                  <SelectItem value="セキュリティ">セキュリティ</SelectItem>
                  <SelectItem value="ハードウェア">ハードウェア</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="impact">影響度 <span className="text-destructive">*</span></Label>
              <Select
                value={formData.impact}
                onValueChange={(value) => handleChange("impact", value)}
              >
                <SelectTrigger id="impact">
                  <SelectValue placeholder="影響度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="広範囲">広範囲（全ユーザー影響）</SelectItem>
                  <SelectItem value="大">大（多数のユーザー影響）</SelectItem>
                  <SelectItem value="中">中（一部ユーザー影響）</SelectItem>
                  <SelectItem value="小">小（少数ユーザー影響）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">
              登録
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}