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
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface SLAFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (slaData: any) => void;
}

export function SLAForm({ isOpen, onClose, onSubmit }: SLAFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    slaTarget: "",
    priority: "中",
    customer: "",
    provider: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    responseTime: "",
    resolutionTime: "",
    availabilityTarget: "",
    measurementPeriod: "月次",
    escalation: "",
    penalties: "",
    additionalTerms: "",
    status: "ドラフト"
  });

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.category || !formData.customer || !formData.provider) {
      toast.error("必須項目を入力してください");
      return;
    }
    
    // Generate a new SLA with ID (in a real app, this would come from backend)
    const newSLA = {
      ...formData,
      id: `SLA-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      compliance: 100.0, // Start with perfect compliance
    };
    
    onSubmit(newSLA);
    
    // Reset form
    setFormData({
      name: "",
      description: "",
      category: "",
      slaTarget: "",
      priority: "中",
      customer: "",
      provider: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      responseTime: "",
      resolutionTime: "",
      availabilityTarget: "",
      measurementPeriod: "月次",
      escalation: "",
      penalties: "",
      additionalTerms: "",
      status: "ドラフト"
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規SLA作成</DialogTitle>
          <DialogDescription>
            サービスレベル契約（SLA）の詳細を入力してください。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">SLA名 <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="SLA名"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
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
                  <SelectItem value="ヘルプデスク">ヘルプデスク</SelectItem>
                  <SelectItem value="インフラストラクチャ">インフラストラクチャ</SelectItem>
                  <SelectItem value="アプリケーション">アプリケーション</SelectItem>
                  <SelectItem value="クラウドサービス">クラウドサービス</SelectItem>
                  <SelectItem value="サポート">サポート</SelectItem>
                  <SelectItem value="ネットワーク">ネットワーク</SelectItem>
                  <SelectItem value="セキュリティ">セキュリティ</SelectItem>
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
                  <SelectItem value="ドラフト">ドラフト</SelectItem>
                  <SelectItem value="レビュー中">レビュー中</SelectItem>
                  <SelectItem value="承認待ち">承認待ち</SelectItem>
                  <SelectItem value="アクティブ">アクティブ</SelectItem>
                  <SelectItem value="更新中">更新中</SelectItem>
                  <SelectItem value="期限切れ">期限切れ</SelectItem>
                  <SelectItem value="終了">終了</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">顧客/サービス利用者 <span className="text-destructive">*</span></Label>
              <Input
                id="customer"
                placeholder="顧客名/部署名"
                value={formData.customer}
                onChange={(e) => handleChange("customer", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider">サービス提供者 <span className="text-destructive">*</span></Label>
              <Input
                id="provider"
                placeholder="提供者/チーム名"
                value={formData.provider}
                onChange={(e) => handleChange("provider", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              placeholder="SLAの詳細説明"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">開始日 <span className="text-destructive">*</span></Label>
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
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleChange("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">終了日 <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, 'yyyy年MM月dd日', { locale: ja }) : "日付を選択"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleChange("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="availabilityTarget">可用性目標（％）</Label>
              <Input
                id="availabilityTarget"
                placeholder="例: 99.9"
                value={formData.availabilityTarget}
                onChange={(e) => handleChange("availabilityTarget", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="measurementPeriod">測定期間</Label>
              <Select
                value={formData.measurementPeriod}
                onValueChange={(value) => handleChange("measurementPeriod", value)}
              >
                <SelectTrigger id="measurementPeriod">
                  <SelectValue placeholder="期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="日次">日次</SelectItem>
                  <SelectItem value="週次">週次</SelectItem>
                  <SelectItem value="月次">月次</SelectItem>
                  <SelectItem value="四半期">四半期</SelectItem>
                  <SelectItem value="年次">年次</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="responseTime">応答時間</Label>
              <Input
                id="responseTime"
                placeholder="例: 30分以内"
                value={formData.responseTime}
                onChange={(e) => handleChange("responseTime", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resolutionTime">解決時間</Label>
              <Input
                id="resolutionTime"
                placeholder="例: 4時間以内"
                value={formData.resolutionTime}
                onChange={(e) => handleChange("resolutionTime", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slaTarget">SLA目標</Label>
            <Textarea
              id="slaTarget"
              placeholder="SLA達成のための具体的な目標"
              rows={3}
              value={formData.slaTarget}
              onChange={(e) => handleChange("slaTarget", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="escalation">エスカレーション手順</Label>
            <Textarea
              id="escalation"
              placeholder="SLA違反時のエスカレーション手順"
              rows={3}
              value={formData.escalation}
              onChange={(e) => handleChange("escalation", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="penalties">ペナルティ</Label>
            <Textarea
              id="penalties"
              placeholder="SLA違反時のペナルティ"
              rows={3}
              value={formData.penalties}
              onChange={(e) => handleChange("penalties", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additionalTerms">追加条件</Label>
            <Textarea
              id="additionalTerms"
              placeholder="その他の条件や注意事項"
              rows={3}
              value={formData.additionalTerms}
              onChange={(e) => handleChange("additionalTerms", e.target.value)}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">
              作成
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}