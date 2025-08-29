import { useState } from "react";
import { Calendar as CalendarIcon, Check, Clock, Info, Plus, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "../ui/utils";

// 変更リクエストフォームの初期状態データ
const initialFormData = {
  title: "",
  description: "",
  category: "",
  type: "standard",
  priority: "medium",
  impact: "medium",
  likelihood: "low",
  systems: [],
  justification: "",
  startDate: null as Date | null,
  endDate: null as Date | null,
  implementationSteps: [] as { description: string; duration: string; responsible: string }[],
  backoutPlan: "",
  testPlan: "",
  communicationPlan: "",
};

// システムの選択肢
const availableSystems = [
  { value: "microsoft365", label: "Microsoft 365（E3ライセンス）" },
  { value: "onedrive", label: "OneDrive for Business" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "ad", label: "Active Directory（AD）" },
  { value: "entra", label: "Microsoft Entra ID（旧Azure AD）" },
  { value: "entraconnect", label: "Entra Connect" },
  { value: "hengeoine", label: "HENGEOINE" },
  { value: "exchange", label: "Exchange Online" },
  { value: "desknet", label: "DeskNet'sNeo（Appsuit含む）" },
  { value: "directcloud", label: "DirectCloud" },
  { value: "skysea", label: "SkySea Client View" },
  { value: "fileserver", label: "外部データセンター内ファイルサーバ" },
];

// カテゴリの選択肢
const categories = [
  { value: "hardware", label: "ハードウェア" },
  { value: "software", label: "ソフトウェア" },
  { value: "network", label: "ネットワーク" },
  { value: "configuration", label: "構成" },
  { value: "policy", label: "ポリシー" },
  { value: "license", label: "ライセンス" },
  { value: "performance", label: "パフォーマンス" },
  { value: "security", label: "セキュリティ" },
  { value: "upgrade", label: "アップグレード" },
  { value: "update", label: "アップデート" },
  { value: "other", label: "その他" },
];

export function ChangeRequestForm({ onSave, onCancel }: { onSave?: () => void; onCancel?: () => void }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [newStep, setNewStep] = useState({ description: "", duration: "", responsible: "" });
  
  // 実装手順の追加
  const addImplementationStep = () => {
    if (newStep.description && newStep.duration) {
      setFormData({
        ...formData,
        implementationSteps: [...formData.implementationSteps, { ...newStep }],
      });
      setNewStep({ description: "", duration: "", responsible: "" });
    }
  };
  
  // 実装手順の削除
  const removeImplementationStep = (index: number) => {
    const updatedSteps = [...formData.implementationSteps];
    updatedSteps.splice(index, 1);
    setFormData({
      ...formData,
      implementationSteps: updatedSteps,
    });
  };
  
  // システムの選択処理
  const toggleSystem = (systemValue: string) => {
    if (selectedSystems.includes(systemValue)) {
      setSelectedSystems(selectedSystems.filter(value => value !== systemValue));
    } else {
      setSelectedSystems([...selectedSystems, systemValue]);
    }
  };
  
  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 実際のアプリではここでAPI呼び出しなど
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSave) onSave();
    }, 1000);
  };
  
  // 日付のフォーマット
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };
  
  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>変更リクエスト作成</CardTitle>
            <CardDescription>
              システム変更の詳細情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="変更リクエストのタイトルを入力"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">説明 <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                placeholder="変更内容の詳細を記述してください"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">カテゴリ <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                <Label>変更タイプ <span className="text-destructive">*</span></Label>
                <RadioGroup
                  defaultValue={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="type-standard" />
                    <Label htmlFor="type-standard" className="cursor-pointer">標準変更</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="type-normal" />
                    <Label htmlFor="type-normal" className="cursor-pointer">通常変更</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="emergency" id="type-emergency" />
                    <Label htmlFor="type-emergency" className="cursor-pointer">緊急変更</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priority">優先度 <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="優先度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">緊急</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="impact">影響度 <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.impact} 
                  onValueChange={(value) => setFormData({ ...formData, impact: value })}
                >
                  <SelectTrigger id="impact">
                    <SelectValue placeholder="影響度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="likelihood">発生確率 <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.likelihood} 
                  onValueChange={(value) => setFormData({ ...formData, likelihood: value })}
                >
                  <SelectTrigger id="likelihood">
                    <SelectValue placeholder="発生確率を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>影響を受けるシステム <span className="text-destructive">*</span></Label>
                <span className="text-xs text-muted-foreground">1つ以上選択してください</span>
              </div>
              <div className="rounded-md border p-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableSystems.map((system) => {
                    const isSelected = selectedSystems.includes(system.value);
                    return (
                      <div
                        key={system.value}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-md border p-2",
                          isSelected && "border-primary bg-primary/5"
                        )}
                        onClick={() => toggleSystem(system.value)}
                      >
                        <span className="text-sm">{system.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="justification">変更の理由・正当性 <span className="text-destructive">*</span></Label>
              <Textarea
                id="justification"
                placeholder="なぜこの変更が必要なのかを説明してください"
                rows={3}
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>開始予定日時 <span className="text-destructive">*</span></Label>
                <div className="flex">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? formatDate(formData.startDate) : "日付を選択"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate || undefined}
                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="ml-2 w-24"
                    placeholder="時間"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>終了予定日時 <span className="text-destructive">*</span></Label>
                <div className="flex">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {formData.endDate ? formatDate(formData.endDate) : "日付を選択"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate || undefined}
                        onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="ml-2 w-24"
                    placeholder="時間"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>計画詳細</CardTitle>
            <CardDescription>
              変更実装に関する詳細な計画を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="implementation">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="implementation">実装手順</TabsTrigger>
                <TabsTrigger value="testing">テスト計画</TabsTrigger>
                <TabsTrigger value="communication">コミュニケーション</TabsTrigger>
              </TabsList>
              
              <TabsContent value="implementation" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    {formData.implementationSteps.length > 0 ? (
                      <ol className="space-y-2">
                        {formData.implementationSteps.map((step, index) => (
                          <li key={index} className="flex items-start justify-between rounded-md border p-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{index + 1}</span>
                                <span className="font-medium">{step.description}</span>
                              </div>
                              <div className="ml-7 mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span>所要時間: {step.duration}</span>
                                <span>担当: {step.responsible}</span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeImplementationStep(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="flex h-24 items-center justify-center text-muted-foreground">
                        実装手順を追加してください
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 rounded-md border p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="step-description">手順内容</Label>
                        <Input
                          id="step-description"
                          placeholder="実装手順を入力"
                          value={newStep.description}
                          onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="step-duration">所要時間</Label>
                        <Input
                          id="step-duration"
                          placeholder="例: 30分"
                          value={newStep.duration}
                          onChange={(e) => setNewStep({ ...newStep, duration: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="step-responsible">担当者</Label>
                        <Input
                          id="step-responsible"
                          placeholder="担当者名"
                          value={newStep.responsible}
                          onChange={(e) => setNewStep({ ...newStep, responsible: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button type="button" size="sm" onClick={addImplementationStep}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        手順を追加
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backout-plan">バックアウト計画</Label>
                    <Textarea
                      id="backout-plan"
                      placeholder="問題発生時の対応方法を記述してください"
                      rows={3}
                      value={formData.backoutPlan}
                      onChange={(e) => setFormData({ ...formData, backoutPlan: e.target.value })}
                    />
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Info className="mr-1 h-3.5 w-3.5" />
                      変更が失敗した場合のロールバック手順を記述してください
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="testing" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="test-plan">テスト計画</Label>
                  <Textarea
                    id="test-plan"
                    placeholder="変更後の確認方法を詳細に記述してください"
                    rows={5}
                    value={formData.testPlan}
                    onChange={(e) => setFormData({ ...formData, testPlan: e.target.value })}
                  />
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Info className="mr-1 h-3.5 w-3.5" />
                    変更が正しく適用されたことを確認するためのテスト手順を記述してください
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="communication" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="communication-plan">コミュニケーション計画</Label>
                  <Textarea
                    id="communication-plan"
                    placeholder="ステークホルダーへの通知計画を記述してください"
                    rows={5}
                    value={formData.communicationPlan}
                    onChange={(e) => setFormData({ ...formData, communicationPlan: e.target.value })}
                  />
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Info className="mr-1 h-3.5 w-3.5" />
                    変更前・変更中・変更後に誰に何を通知するかを記述してください
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={onCancel}>
              キャンセル
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={(e) => handleSubmit(e, true)}
              >
                下書き保存
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>保存中...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Save className="h-4 w-4" />
                    <span>保存</span>
                  </div>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}