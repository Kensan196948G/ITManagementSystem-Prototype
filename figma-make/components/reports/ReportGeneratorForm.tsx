import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";

interface ReportGeneratorFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function ReportGeneratorForm({ onSave, onCancel }: ReportGeneratorFormProps) {
  const [reportType, setReportType] = useState<string>("incident");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [formMode, setFormMode] = useState<"onetime" | "scheduled">("onetime");
  
  // 日付フォーマット用ユーティリティ関数
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="onetime" onValueChange={(v) => setFormMode(v as "onetime" | "scheduled")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="onetime">一回のみ生成</TabsTrigger>
          <TabsTrigger value="scheduled">定期レポート設定</TabsTrigger>
        </TabsList>
        
        <TabsContent value="onetime" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">レポート名</Label>
              <Input id="report-name" placeholder="例：月次インシデントレポート - 2025年4月" />
            </div>
            
            <div className="space-y-2">
              <Label>レポートタイプ</Label>
              <RadioGroup value={reportType} onValueChange={setReportType}>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="incident" id="report-incident" />
                    <Label htmlFor="report-incident">インシデントレポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="problem" id="report-problem" />
                    <Label htmlFor="report-problem">問題管理レポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="change" id="report-change" />
                    <Label htmlFor="report-change">変更管理レポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sla" id="report-sla" />
                    <Label htmlFor="report-sla">SLAパフォーマンスレポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="security" id="report-security" />
                    <Label htmlFor="report-security">セキュリティレポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="trend" id="report-trend" />
                    <Label htmlFor="report-trend">傾向分析レポート</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>開始日</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? formatDate(startDate) : "日付を選択"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>終了日</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? formatDate(endDate) : "日付を選択"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-format">出力フォーマット</Label>
              <Select defaultValue="pdf">
                <SelectTrigger id="report-format">
                  <SelectValue placeholder="フォーマットを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="powerpoint">PowerPoint</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <ReportSections reportType={reportType} />
          </div>
        </TabsContent>
        
        <TabsContent value="scheduled" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled-report-name">レポート名</Label>
              <Input id="scheduled-report-name" placeholder="例：週次インシデントサマリーレポート" />
            </div>
            
            <div className="space-y-2">
              <Label>レポートタイプ</Label>
              <RadioGroup value={reportType} onValueChange={setReportType}>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="incident" id="scheduled-report-incident" />
                    <Label htmlFor="scheduled-report-incident">インシデントレポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="problem" id="scheduled-report-problem" />
                    <Label htmlFor="scheduled-report-problem">問題管理レポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="change" id="scheduled-report-change" />
                    <Label htmlFor="scheduled-report-change">変更管理レポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sla" id="scheduled-report-sla" />
                    <Label htmlFor="scheduled-report-sla">SLAパフォーマンスレポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="security" id="scheduled-report-security" />
                    <Label htmlFor="scheduled-report-security">セキュリティレポート</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="trend" id="scheduled-report-trend" />
                    <Label htmlFor="scheduled-report-trend">傾向分析レポート</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-frequency">実行頻度</Label>
              <Select defaultValue="weekly">
                <SelectTrigger id="report-frequency">
                  <SelectValue placeholder="頻度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">毎日</SelectItem>
                  <SelectItem value="weekly">毎週</SelectItem>
                  <SelectItem value="monthly">毎月</SelectItem>
                  <SelectItem value="quarterly">四半期ごと</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-day">実行日</Label>
              <Select defaultValue="1">
                <SelectTrigger id="report-day">
                  <SelectValue placeholder="実行日を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">月曜日</SelectItem>
                  <SelectItem value="2">火曜日</SelectItem>
                  <SelectItem value="3">水曜日</SelectItem>
                  <SelectItem value="4">木曜日</SelectItem>
                  <SelectItem value="5">金曜日</SelectItem>
                  <SelectItem value="6">土曜日</SelectItem>
                  <SelectItem value="0">日曜日</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-scheduled-format">出力フォーマット</Label>
              <Select defaultValue="pdf">
                <SelectTrigger id="report-scheduled-format">
                  <SelectValue placeholder="フォーマットを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="powerpoint">PowerPoint</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-recipients">受信者</Label>
              <Input id="report-recipients" placeholder="例：it-support@example.com, management@example.com" />
              <p className="text-xs text-muted-foreground">複数の受信者はカンマで区切ってください</p>
            </div>
            
            <Separator />
            
            <ReportSections reportType={reportType} />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button onClick={onSave}>{formMode === "onetime" ? "レポート生成" : "スケジュール設定"}</Button>
      </div>
    </div>
  );
}

interface ReportSectionsProps {
  reportType: string;
}

function ReportSections({ reportType }: ReportSectionsProps) {
  if (reportType === "incident") {
    return (
      <div className="space-y-4">
        <h4>レポートセクション</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="section-incident-summary" defaultChecked />
            <Label htmlFor="section-incident-summary">インシデント概要</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-incident-trend" defaultChecked />
            <Label htmlFor="section-incident-trend">インシデント傾向分析</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-resolution-time" defaultChecked />
            <Label htmlFor="section-resolution-time">解決時間分析</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-service-impact" defaultChecked />
            <Label htmlFor="section-service-impact">サービス影響分析</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-priority-distribution" defaultChecked />
            <Label htmlFor="section-priority-distribution">優先度分布</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-top-categories" defaultChecked />
            <Label htmlFor="section-top-categories">主要カテゴリ分析</Label>
          </div>
        </div>
      </div>
    );
  }
  
  if (reportType === "sla") {
    return (
      <div className="space-y-4">
        <h4>レポートセクション</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="section-sla-summary" defaultChecked />
            <Label htmlFor="section-sla-summary">SLA遵守概要</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-sla-by-service" defaultChecked />
            <Label htmlFor="section-sla-by-service">サービス別SLA遵守率</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-sla-by-priority" defaultChecked />
            <Label htmlFor="section-sla-by-priority">優先度別SLA遵守率</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-sla-trend" defaultChecked />
            <Label htmlFor="section-sla-trend">SLA遵守率の傾向</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-sla-violations" defaultChecked />
            <Label htmlFor="section-sla-violations">SLA違反の詳細</Label>
          </div>
        </div>
      </div>
    );
  }
  
  if (reportType === "problem") {
    return (
      <div className="space-y-4">
        <h4>レポートセクション</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="section-problem-summary" defaultChecked />
            <Label htmlFor="section-problem-summary">問題管理概要</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-problem-trend" defaultChecked />
            <Label htmlFor="section-problem-trend">問題傾向分析</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-root-cause" defaultChecked />
            <Label htmlFor="section-root-cause">根本原因分析</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-resolution-efficiency" defaultChecked />
            <Label htmlFor="section-resolution-efficiency">解決効率性分析</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="section-related-incidents" defaultChecked />
            <Label htmlFor="section-related-incidents">関連インシデント分析</Label>
          </div>
        </div>
      </div>
    );
  }
  
  // 他のレポートタイプのセクションも同様に実装
  
  return (
    <div className="space-y-4">
      <h4>レポートセクション</h4>
      <p className="text-muted-foreground">このレポートタイプの標準セクションが含まれます</p>
    </div>
  );
}