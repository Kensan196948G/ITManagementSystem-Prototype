import { useState, useEffect } from "react";
import { ArrowLeft, CalendarIcon, Check, CheckCircle, HelpCircle, Info, Loader2, UserRound } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// サービスデータのサンプル
const serviceData = {
  "SVC-001": {
    id: "SVC-001",
    name: "Microsoft 365 E3ライセンス",
    description: "Microsoft 365 E3ライセンスの割り当て",
    icon: "🖥️",
    category: "software",
    approvalRequired: true,
    cost: "¥2,100 / 月",
    requiredFields: [
      { id: "userName", label: "ユーザー名", type: "text", required: true },
      { id: "userEmail", label: "メールアドレス", type: "email", required: true },
      { id: "department", label: "部署", type: "select", required: true, options: ["営業部", "開発部", "管理部", "マーケティング部", "カスタマーサポート部"] },
      { id: "purpose", label: "利用目的", type: "textarea", required: true },
      { id: "requestDate", label: "希望開始日", type: "date", required: true },
      { id: "billingCode", label: "請求先コード", type: "text", required: true },
      { id: "additionalSoftware", label: "追加ソフトウェア", type: "checkbox", required: false, options: ["Visio", "Project", "Power BI"] },
      { id: "priority", label: "優先度", type: "radio", required: true, options: ["高", "中", "低"] }
    ]
  },
  "SVC-002": {
    id: "SVC-002",
    name: "リモートアクセスVPN",
    description: "社外からの社内ネットワークへのセキュアなアクセス",
    icon: "🔒",
    category: "network",
    approvalRequired: true,
    cost: "無料",
    requiredFields: [
      { id: "userName", label: "ユーザー名", type: "text", required: true },
      { id: "userEmail", label: "メールアドレス", type: "email", required: true },
      { id: "department", label: "部署", type: "select", required: true, options: ["営業部", "開発部", "管理部", "マーケティング部", "カスタマーサポート部"] },
      { id: "deviceType", label: "デバイスタイプ", type: "select", required: true, options: ["会社支給PC", "個人PC", "スマートフォン", "タブレット"] },
      { id: "requestReason", label: "申請理由", type: "textarea", required: true },
      { id: "accessDuration", label: "アクセス期間", type: "select", required: true, options: ["1週間", "1ヶ月", "3ヶ月", "6ヶ月", "1年"] },
      { id: "startDate", label: "開始日", type: "date", required: true }
    ]
  },
  "SVC-005": {
    id: "SVC-005",
    name: "ゲストWi-Fiアクセス",
    description: "来客用の一時的なWi-Fiアクセス権限の発行",
    icon: "📶",
    category: "network",
    approvalRequired: false,
    cost: "無料",
    requiredFields: [
      { id: "guestName", label: "ゲスト名", type: "text", required: true },
      { id: "guestCompany", label: "会社名", type: "text", required: true },
      { id: "visitPurpose", label: "訪問目的", type: "textarea", required: true },
      { id: "visitDate", label: "訪問日", type: "date", required: true },
      { id: "visitDuration", label: "利用期間", type: "select", required: true, options: ["1日", "2〜3日", "1週間", "2週間", "1ヶ月"] },
      { id: "hostName", label: "担当者名", type: "text", required: true },
      { id: "numberOfDevices", label: "デバイス数", type: "select", required: true, options: ["1", "2", "3", "4", "5以上"] }
    ]
  },
  "default": {
    id: "default",
    name: "新規サービスリクエスト",
    description: "ITサービスに関する新規リクエスト",
    icon: "🔧",
    category: "general",
    approvalRequired: true,
    cost: "要見積もり",
    requiredFields: [
      { id: "requestType", label: "リクエスト種別", type: "select", required: true, options: ["ソフトウェア", "ハードウェア", "アクセス権限", "アカウント管理", "その他"] },
      { id: "requestTitle", label: "リクエスト件名", type: "text", required: true },
      { id: "requestDescription", label: "詳細説明", type: "textarea", required: true },
      { id: "department", label: "部署", type: "select", required: true, options: ["営業部", "開発部", "管理部", "マーケティング部", "カスタマーサポート部"] },
      { id: "urgency", label: "緊急度", type: "radio", required: true, options: ["高", "中", "低"] },
      { id: "requiredDate", label: "希望完了日", type: "date", required: true },
      { id: "additionalInfo", label: "追加情報", type: "textarea", required: false }
    ]
  }
};

interface ServiceRequestFormProps {
  serviceId?: string;
  onBack: () => void;
}

export function ServiceRequestForm({ 
  serviceId = "default", 
  onBack 
}: ServiceRequestFormProps) {
  const [formStep, setFormStep] = useState(1);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(serviceId);

  // サービスIDが変更されたときに状態を更新
  useEffect(() => {
    setSelectedServiceId(serviceId || "default");
    setFormValues({});
    setFormStep(1);
  }, [serviceId]);
  
  // サービス情報の取得
  const service = serviceData[selectedServiceId as keyof typeof serviceData] || serviceData["default"];
  
  // フォームの値変更処理
  const handleFormChange = (fieldId: string, value: any) => {
    setFormValues({
      ...formValues,
      [fieldId]: value
    });
  };
  
  // 次のステップに進む処理
  const handleNextStep = () => {
    // 必須フィールドの検証
    const requiredFields = service.requiredFields.filter(field => field.required).map(field => field.id);
    const missingFields = requiredFields.filter(fieldId => !formValues[fieldId]);
    
    if (missingFields.length > 0) {
      toast.error("必須項目を入力してください");
      return;
    }
    
    setFormStep(formStep + 1);
  };
  
  // 前のステップに戻る処理
  const handlePrevStep = () => {
    setFormStep(formStep - 1);
  };
  
  // フォーム送信処理
  const handleSubmitRequest = () => {
    setSubmitting(true);
    
    // 実際のアプリではAPIを呼び出してリクエストを送信
    setTimeout(() => {
      setSubmitting(false);
      toast.success("サービスリクエストが送信されました");
      // 成功後にフォームステップを完了に設定
      setFormStep(3);
    }, 1500);
  };
  
  // 必須フィールドが入力されているかチェック
  const isFormValid = () => {
    if (!service) return false;
    
    const requiredFields = service.requiredFields.filter(field => field.required).map(field => field.id);
    return requiredFields.every(fieldId => !!formValues[fieldId]);
  };
  
  // サービスデータが存在しない場合
  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold">サービスが見つかりません</h2>
        <p className="text-muted-foreground">指定されたサービスIDが見つかりません。</p>
        <Button onClick={onBack}>サービスカタログに戻る</Button>
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">サービスカタログ</span>
          <span className="text-muted-foreground">/</span>
          <h2>{service.name} リクエスト</h2>
        </div>
      </div>
      
      <div className="relative mb-8">
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted"></div>
        <ol className="relative flex w-full justify-between">
          <StepIndicator step={1} currentStep={formStep} label="情報入力" />
          <StepIndicator step={2} currentStep={formStep} label="確認" />
          <StepIndicator step={3} currentStep={formStep} label="完了" />
        </ol>
      </div>
      
      {formStep === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
                {service.icon}
              </div>
              <div>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </div>
            </div>
            {selectedServiceId === "default" && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="service-type">サービスタイプ</Label>
                <Select
                  value={selectedServiceId}
                  onValueChange={(value) => {
                    setSelectedServiceId(value);
                    setFormValues({}); // フォーム値をリセット
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="サービスタイプを選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">新規リクエスト（一般）</SelectItem>
                    <SelectItem value="SVC-001">Microsoft 365 E3ライセンス</SelectItem>
                    <SelectItem value="SVC-002">リモートアクセスVPN</SelectItem>
                    <SelectItem value="SVC-005">ゲストWi-Fiアクセス</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  特定のサービスを選択すると、そのサービスに最適化されたフォームが表示されます
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {service.requiredFields.map(field => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  {field.required && <span className="text-red-500">*</span>}
                  {field.type === "checkbox" && (
                    <InfoTooltip content="複数選択可能です" />
                  )}
                </div>
                
                {field.type === "text" && (
                  <Input 
                    id={field.id} 
                    value={formValues[field.id] || ""}
                    onChange={(e) => handleFormChange(field.id, e.target.value)}
                  />
                )}
                
                {field.type === "email" && (
                  <Input 
                    id={field.id} 
                    type="email"
                    value={formValues[field.id] || ""}
                    onChange={(e) => handleFormChange(field.id, e.target.value)}
                  />
                )}
                
                {field.type === "textarea" && (
                  <Textarea 
                    id={field.id} 
                    rows={3}
                    value={formValues[field.id] || ""}
                    onChange={(e) => handleFormChange(field.id, e.target.value)}
                  />
                )}
                
                {field.type === "select" && (
                  <Select
                    value={formValues[field.id] || ""}
                    onValueChange={(value) => handleFormChange(field.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {field.type === "date" && (
                  <div className="flex flex-col space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                        >
                          {formValues[field.id] ? (
                            format(new Date(formValues[field.id]), "yyyy年MM月dd日", { locale: ja })
                          ) : (
                            <span className="text-muted-foreground">日付を選択してください</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formValues[field.id] ? new Date(formValues[field.id]) : undefined}
                          onSelect={(date) => handleFormChange(field.id, date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                
                {field.type === "checkbox" && field.options && (
                  <div className="space-y-2">
                    {field.options.map(option => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${field.id}-${option}`} 
                          checked={(formValues[field.id] || []).includes(option)}
                          onCheckedChange={(checked) => {
                            const currentValues = formValues[field.id] || [];
                            if (checked) {
                              handleFormChange(field.id, [...currentValues, option]);
                            } else {
                              handleFormChange(field.id, currentValues.filter((v: string) => v !== option));
                            }
                          }}
                        />
                        <label
                          htmlFor={`${field.id}-${option}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                
                {field.type === "radio" && field.options && (
                  <RadioGroup
                    value={formValues[field.id] || ""}
                    onValueChange={(value) => handleFormChange(field.id, value)}
                  >
                    {field.options.map(option => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                        <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}
            
            {service.approvalRequired && (
              <Alert className="bg-amber-50 dark:bg-amber-950">
                <Info className="h-4 w-4" />
                <AlertTitle>承認が必要です</AlertTitle>
                <AlertDescription>
                  このサービスリクエストには承認者の承認が必要です。申請後、承認プロセスが開始されます。
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" onClick={onBack}>
              キャンセル
            </Button>
            <Button onClick={handleNextStep} disabled={!isFormValid()}>
              確認画面へ進む
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {formStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>リクエスト内容の確認</CardTitle>
            <CardDescription>内容を確認して送信してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border">
              <div className="bg-muted/50 px-4 py-2 font-medium">
                サービス情報
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">サービス名</div>
                    <div className="font-medium">{service.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">カテゴリ</div>
                    <div className="font-medium">{service.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">コスト</div>
                    <div className="font-medium">{service.cost}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">承認</div>
                    <div className="font-medium">{service.approvalRequired ? "必要" : "不要"}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border">
              <div className="bg-muted/50 px-4 py-2 font-medium">
                リクエスト情報
              </div>
              <div className="divide-y">
                {service.requiredFields.map(field => (
                  <div key={field.id} className="grid grid-cols-3 p-4">
                    <div className="text-sm text-muted-foreground">{field.label}</div>
                    <div className="col-span-2 break-words">
                      {field.type === "checkbox" && Array.isArray(formValues[field.id]) ? (
                        formValues[field.id].join(", ")
                      ) : field.type === "date" && formValues[field.id] ? (
                        format(new Date(formValues[field.id]), "yyyy年MM月dd日", { locale: ja })
                      ) : (
                        formValues[field.id] || "未入力"
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-md border p-4">
              <Checkbox
                id="confirm"
                checked={formValues.confirmed}
                onCheckedChange={(checked) => handleFormChange("confirmed", checked)}
              />
              <label
                htmlFor="confirm"
                className="ml-2 text-sm"
              >
                上記の内容でサービスをリクエストすることを確認します
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" onClick={handlePrevStep}>
              戻る
            </Button>
            <Button 
              onClick={handleSubmitRequest} 
              disabled={!formValues.confirmed || submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              リクエストを送信
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {formStep === 3 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>リクエストが送信されました</CardTitle>
            <CardDescription>リクエスト番号: REQ-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-medium">次のステップ</h3>
              <ol className="space-y-2 pl-5">
                <li className="list-decimal">
                  {service.approvalRequired ? 
                    "承認者にリクエストが送信されました。承認プロセスが完了すると通知されます。" : 
                    "リクエストは自動的に処理されます。"}
                </li>
                <li className="list-decimal">
                  リクエストの状態はリクエスト履歴ページで確認できます。
                </li>
                <li className="list-decimal">
                  質問がある場合は、リクエスト番号を記載の上、IT部門にお問い合わせください。
                </li>
              </ol>
            </div>
            
            <div className="flex items-center gap-2 rounded-md bg-muted p-4 text-sm">
              <Info className="h-5 w-5 text-muted-foreground" />
              <span>
                リクエストの処理状況の更新があればメールで通知されます。
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <Button onClick={onBack}>
              サービスカタログに戻る
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

// ステップインジケーターコンポーネント
function StepIndicator({ 
  step, 
  currentStep, 
  label 
}: { 
  step: number;
  currentStep: number;
  label: string;
}) {
  let status: "complete" | "current" | "upcoming";
  
  if (step < currentStep) {
    status = "complete";
  } else if (step === currentStep) {
    status = "current";
  } else {
    status = "upcoming";
  }
  
  return (
    <li className="flex flex-col items-center">
      <div 
        className={`
          flex h-8 w-8 items-center justify-center rounded-full text-sm
          ${status === "complete" ? "bg-primary text-primary-foreground" : 
            status === "current" ? "border-2 border-primary bg-background" : 
            "border bg-muted text-muted-foreground"}
        `}
      >
        {status === "complete" ? <Check className="h-4 w-4" /> : step}
      </div>
      <span 
        className={`
          mt-2 text-sm
          ${status === "complete" || status === "current" ? "font-medium" : "text-muted-foreground"}
        `}
      >
        {label}
      </span>
    </li>
  );
}

// 情報アイコンのツールチップコンポーネント
function InfoTooltip({ content }: { content: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm">
        {content}
      </PopoverContent>
    </Popover>
  );
}

// AlertCircle アイコン
function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}