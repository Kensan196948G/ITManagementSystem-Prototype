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
import { Checkbox } from "../ui/checkbox";

interface NewProblemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problemData: any) => void;
}

// カテゴリの選択肢
const categories = [
  { value: "performance", label: "パフォーマンス" },
  { value: "service-quality", label: "サービス品質" },
  { value: "application", label: "アプリケーション" },
  { value: "configuration", label: "構成" },
  { value: "integration", label: "インテグレーション" },
  { value: "software", label: "ソフトウェア" },
  { value: "infrastructure", label: "インフラストラクチャ" },
  { value: "security", label: "セキュリティ" },
  { value: "network", label: "ネットワーク" },
  { value: "other", label: "その他" },
];

// 影響を受けるシステムの選択肢
const systems = [
  { value: "exchange", label: "Exchange Online" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "onedrive", label: "OneDrive for Business" },
  { value: "sharepoint", label: "SharePoint Online" },
  { value: "active-directory", label: "Active Directory" },
  { value: "entra", label: "Microsoft Entra ID" },
  { value: "desknet", label: "DeskNet'sNeo（Appsuit含む）" },
  { value: "hengeoine", label: "HENGEOINE" },
  { value: "directcloud", label: "DirectCloud" },
  { value: "skysea", label: "SkySea Client View" },
  { value: "fileserver", label: "外部データセンター内ファイルサーバ" },
  { value: "other", label: "その他" },
];

export function NewProblemForm({ isOpen, onClose, onSubmit }: NewProblemFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    impactedSystems: [] as string[],
    priority: "",
    knownError: false,
    relatedIncidents: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSystemToggle = (system: string) => {
    setFormData(prev => {
      const systems = [...prev.impactedSystems];
      const index = systems.indexOf(system);
      
      if (index > -1) {
        systems.splice(index, 1);
      } else {
        systems.push(system);
      }
      
      return {
        ...prev,
        impactedSystems: systems
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.title || !formData.category || !formData.priority || formData.impactedSystems.length === 0) {
      toast.error("必須項目を入力してください");
      return;
    }
    
    // 関連インシデントの処理
    const relatedIncidents = formData.relatedIncidents
      ? formData.relatedIncidents.split(",").map(id => id.trim()).filter(id => id !== "")
      : [];
    
    // 新しい問題IDを生成（実際はバックエンドで生成される）
    const newProblem = {
      ...formData,
      id: `PRB-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: "調査中",
      assignee: { name: "未割り当て", initials: "--" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relatedIncidents: relatedIncidents,
      impactedSystems: formData.impactedSystems.map(value => {
        const system = systems.find(s => s.value === value);
        return system ? system.label : value;
      })
    };
    
    onSubmit(newProblem);
    
    // フォームをリセット
    setFormData({
      title: "",
      description: "",
      category: "",
      impactedSystems: [],
      priority: "",
      knownError: false,
      relatedIncidents: "",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>新規問題登録</DialogTitle>
          <DialogDescription>
            ITILガイドラインに基づいて、インシデントの根本原因となる問題を登録します。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="問題のタイトルを入力"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">詳細説明</Label>
            <Textarea
              id="description"
              placeholder="問題の詳細や観測された症状について説明してください"
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ <span className="text-destructive">*</span></Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
          </div>
          
          <div className="space-y-2">
            <Label>影響を受けるシステム <span className="text-destructive">*</span></Label>
            <div className="max-h-[200px] overflow-y-auto rounded-md border p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {systems.map((system) => (
                  <div key={system.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`system-${system.value}`} 
                      checked={formData.impactedSystems.includes(system.value)}
                      onCheckedChange={() => handleSystemToggle(system.value)}
                    />
                    <Label htmlFor={`system-${system.value}`} className="text-sm">
                      {system.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="relatedIncidents">関連するインシデントID</Label>
            <Input
              id="relatedIncidents"
              placeholder="例: INC-001, INC-002（カンマ区切り）"
              value={formData.relatedIncidents}
              onChange={(e) => handleChange("relatedIncidents", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              関連するインシデントIDをカンマ区切りで入力してください
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="knownError" 
              checked={formData.knownError}
              onCheckedChange={(checked) => handleChange("knownError", !!checked)}
            />
            <Label htmlFor="knownError">
              既知のエラーとして登録する
            </Label>
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