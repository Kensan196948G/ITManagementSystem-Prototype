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
import { Calendar, CalendarIcon } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface CapacityPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planData: any) => void;
}

export function CapacityPlanForm({ isOpen, onClose, onSubmit }: CapacityPlanFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    description: "",
    status: "計画中",
    impact: "中",
    cost: "",
    startDate: new Date(),
    completionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    requiredApproval: true,
    justification: "",
    expectedBenefit: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.target || !formData.description) {
      toast.error("必須項目を入力してください");
      return;
    }
    
    // Generate a new plan ID (in a real app, this would come from the backend)
    const newPlan = {
      ...formData,
      id: `plan${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    
    onSubmit(newPlan);
    
    // Reset form
    setFormData({
      name: "",
      target: "",
      description: "",
      status: "計画中",
      impact: "中",
      cost: "",
      startDate: new Date(),
      completionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      requiredApproval: true,
      justification: "",
      expectedBenefit: "",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>キャパシティ計画の作成</DialogTitle>
          <DialogDescription>
            新しいキャパシティ増強計画の詳細を入力してください。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">計画名 <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="キャパシティ計画名"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target">対象リソース <span className="text-destructive">*</span></Label>
              <Select
                value={formData.target}
                onValueChange={(value) => handleChange("target", value)}
              >
                <SelectTrigger id="target">
                  <SelectValue placeholder="対象リソースを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="データベースクラスター">データベースクラスター</SelectItem>
                  <SelectItem value="ストレージアレイ">ストレージアレイ</SelectItem>
                  <SelectItem value="Webサーバー">Webサーバー</SelectItem>
                  <SelectItem value="ネットワーク機器">ネットワーク機器</SelectItem>
                  <SelectItem value="クラウドリソース">クラウドリソース</SelectItem>
                  <SelectItem value="コアスイッチ">コアスイッチ</SelectItem>
                  <SelectItem value="バックアップシステム">バックアップシステム</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="計画中">計画中</SelectItem>
                  <SelectItem value="承認待ち">承認待ち</SelectItem>
                  <SelectItem value="承認済">承認済</SelectItem>
                  <SelectItem value="進行中">進行中</SelectItem>
                  <SelectItem value="完了">完了</SelectItem>
                  <SelectItem value="延期">延期</SelectItem>
                  <SelectItem value="中止">中止</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">説明 <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              placeholder="キャパシティ計画の詳細説明"
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="impact">影響度</Label>
              <Select
                value={formData.impact}
                onValueChange={(value) => handleChange("impact", value)}
              >
                <SelectTrigger id="impact">
                  <SelectValue placeholder="影響度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost">予算 <span className="text-destructive">*</span></Label>
              <Input
                id="cost"
                placeholder="例: ¥1,500,000"
                value={formData.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">開始予定日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, 'yyyy年MM月dd日', { locale: ja }) : "日付を選択"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleChange("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="completionDate">完了予定日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.completionDate ? format(formData.completionDate, 'yyyy年MM月dd日', { locale: ja }) : "日付を選択"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.completionDate}
                    onSelect={(date) => handleChange("completionDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="justification">計画の正当性</Label>
            <Textarea
              id="justification"
              placeholder="このキャパシティ増強が必要な理由"
              rows={3}
              value={formData.justification}
              onChange={(e) => handleChange("justification", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expectedBenefit">期待される効果</Label>
            <Textarea
              id="expectedBenefit"
              placeholder="このキャパシティ増強により期待される効果"
              rows={3}
              value={formData.expectedBenefit}
              onChange={(e) => handleChange("expectedBenefit", e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="requiredApproval" 
              checked={formData.requiredApproval}
              onCheckedChange={(checked) => handleChange("requiredApproval", !!checked)}
            />
            <Label htmlFor="requiredApproval">
              承認が必要
            </Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">
              計画を登録
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}