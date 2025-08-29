import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// カレンダーに表示する変更リクエストのサンプルデータ
const calendarEvents = [
  {
    id: "CHG-001",
    title: "Microsoft 365 E3ライセンスの更新",
    startDate: "2025-05-15T22:00:00",
    endDate: "2025-05-15T23:30:00",
    type: "標準変更",
    status: "承認済",
    risk: "低",
    assignee: "田中次郎",
    systems: ["Microsoft 365"],
  },
  {
    id: "CHG-002",
    title: "Active DirectoryとEntra IDの同期設定変更",
    startDate: "2025-05-20T21:00:00",
    endDate: "2025-05-20T23:00:00",
    type: "通常変更",
    status: "審査中",
    risk: "中",
    assignee: "高橋一郎",
    systems: ["Active Directory", "Microsoft Entra ID", "Entra Connect"],
  },
  {
    id: "CHG-003",
    title: "Microsoft Teamsの通話品質改善設定",
    startDate: "2025-05-18T09:00:00",
    endDate: "2025-05-18T10:30:00",
    type: "標準変更",
    status: "計画中",
    risk: "低",
    assignee: "佐藤三郎",
    systems: ["Microsoft Teams"],
  },
  {
    id: "CHG-004",
    title: "OneDrive for Business同期クライアントアップデート",
    startDate: "2025-05-10T10:00:00",
    endDate: "2025-05-10T16:00:00",
    type: "標準変更",
    status: "実装中",
    risk: "低",
    assignee: "山田太郎",
    systems: ["OneDrive for Business"],
  },
  {
    id: "CHG-005",
    title: "Exchange Onlineのメール保持ポリシー変更",
    startDate: "2025-05-11T20:00:00",
    endDate: "2025-05-11T21:30:00",
    type: "緊急変更",
    status: "審査中",
    risk: "高",
    assignee: "佐藤三郎",
    systems: ["Exchange Online"],
  },
  {
    id: "CHG-008",
    title: "外部データセンター内ファイルサーバーストレージ増設",
    startDate: "2025-05-17T21:00:00",
    endDate: "2025-05-18T05:00:00",
    type: "通常変更",
    status: "承認済",
    risk: "中",
    assignee: "渡辺健太",
    systems: ["外部データセンター内ファイルサーバ"],
  },
  {
    id: "CHG-009",
    title: "DeskNet'sNeo（Appsuit含む）バージョンアップグレード",
    startDate: "2025-05-25T22:00:00",
    endDate: "2025-05-26T02:00:00",
    type: "通常変更",
    status: "ドラフト",
    risk: "中",
    assignee: "未割当",
    systems: ["DeskNet'sNeo（Appsuit含む）"],
  },
  {
    id: "CHG-010",
    title: "DirectCloudバックアップポリシー設定変更",
    startDate: "2025-05-13T19:00:00",
    endDate: "2025-05-13T20:30:00",
    type: "標準変更",
    status: "完了",
    risk: "低",
    assignee: "鈴木花子",
    systems: ["DirectCloud"],
  }
];

// 週の日付を生成する関数
function getWeekDates(date: Date, weekOffset = 0) {
  const result = [];
  const first = new Date(date);
  first.setDate(first.getDate() - first.getDay() + (weekOffset * 7));
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(first);
    day.setDate(first.getDate() + i);
    result.push(day);
  }
  
  return result;
}

// 日本語の曜日配列
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

// 日付を2桁の数字にフォーマット
function padZero(num: number) {
  return num.toString().padStart(2, '0');
}

// 変更リクエストの色を決定する関数
function getEventColor(risk: string, status: string) {
  // ステータスに基づく色設定
  if (status === "完了") return "bg-green-100 dark:bg-green-900";
  if (status === "実装中") return "bg-purple-100 dark:bg-purple-900";
  if (status === "ドラフト") return "bg-gray-100 dark:bg-gray-800";
  
  // リスクに基づく色設定
  switch (risk) {
    case "高":
      return "bg-red-100 dark:bg-red-900";
    case "中":
      return "bg-orange-100 dark:bg-orange-900";
    case "低":
      return "bg-blue-100 dark:bg-blue-900";
    default:
      return "bg-secondary";
  }
}

export function ChangeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // 現在の年と月を取得
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScriptの月は0から始まるので+1
  
  // 週の表示用の日付配列
  const weekDates = getWeekDates(currentDate);
  
  // 次の週/月に移動
  const moveNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  // 前の週/月に移動
  const movePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };
  
  // 今日の日付に移動
  const moveToday = () => {
    setCurrentDate(new Date());
  };
  
  // 日付の文字列を解析してDateオブジェクトに変換
  const parseDate = (dateString: string) => {
    return new Date(dateString);
  };
  
  // 指定した日付にスケジュールされた変更リクエストを取得
  const getEventsForDay = (day: Date) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    return calendarEvents.filter(event => {
      const eventStart = parseDate(event.startDate);
      return eventStart >= dayStart && eventStart <= dayEnd;
    });
  };
  
  // 時間をフォーマット
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
  };
  
  return (
    <div>
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle>変更カレンダー</CardTitle>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>スケジュールされた変更リクエストのカレンダー表示です</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select value={viewMode} onValueChange={(value: "week" | "month") => setViewMode(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="表示切替" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">週表示</SelectItem>
                  <SelectItem value="month">月表示</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            IT変更管理カレンダー - 予定されているシステム変更の時系列表示
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={movePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={moveNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={moveToday}>今日</Button>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  {viewMode === "week" 
                    ? `${currentYear}年${currentMonth}月 第${Math.ceil(currentDate.getDate() / 7)}週`
                    : `${currentYear}年${currentMonth}月`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-200"></div>
                  <span className="text-xs">高リスク</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-orange-200"></div>
                  <span className="text-xs">中リスク</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-blue-200"></div>
                  <span className="text-xs">低リスク</span>
                </div>
              </div>
            </div>
            
            {viewMode === "week" && (
              <div className="rounded-md border">
                <div className="grid grid-cols-7 border-b">
                  {weekDates.map((day, index) => {
                    const isToday = new Date().toDateString() === day.toDateString();
                    const isWeekend = index === 0 || index === 6;
                    return (
                      <div 
                        key={index}
                        className={`flex flex-col items-center p-2 ${isWeekend ? 'bg-muted/50' : ''} ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className="text-sm text-muted-foreground">{weekdays[day.getDay()]}</div>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-7 gap-1 p-2">
                  {weekDates.map((day, dayIndex) => {
                    const dayEvents = getEventsForDay(day);
                    const isWeekend = dayIndex === 0 || dayIndex === 6;
                    
                    return (
                      <div key={dayIndex} className={`min-h-[120px] space-y-1 rounded-sm p-1 ${isWeekend ? 'bg-muted/30' : ''}`}>
                        {dayEvents.map((event, eventIndex) => (
                          <Dialog key={eventIndex}>
                            <DialogTrigger asChild>
                              <div
                                className={`cursor-pointer rounded-sm ${getEventColor(event.risk, event.status)} p-1 text-xs shadow-sm hover:brightness-95`}
                                onClick={() => setSelectedEvent(event)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{formatTime(event.startDate)}</span>
                                  <Badge variant="outline" className="h-4 px-1 text-[10px]">{event.id}</Badge>
                                </div>
                                <div className="mt-0.5 line-clamp-2">{event.title}</div>
                              </div>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{event.title}</DialogTitle>
                                <DialogDescription>変更リクエスト詳細</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 py-4">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <div className="text-sm text-muted-foreground">変更ID</div>
                                    <div>{event.id}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">担当者</div>
                                    <div>{event.assignee}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">種類</div>
                                    <div>{event.type}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">リスク</div>
                                    <div>{event.risk}</div>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">スケジュール</div>
                                  <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {new Date(event.startDate).toLocaleString('ja-JP')} 〜 {new Date(event.endDate).toLocaleString('ja-JP')}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">影響システム</div>
                                  <div className="flex flex-wrap gap-1">
                                    {event.systems.map((system: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">{system}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button>詳細を表示</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {viewMode === "month" && (
              <div className="rounded-md border">
                <div className="grid grid-cols-7 border-b">
                  {weekdays.map((day, index) => (
                    <div key={index} className="p-2 text-center text-sm font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-px">
                  {/* 月表示のカレンダーをここに実装 */}
                  {Array.from({ length: 35 }).map((_, index) => {
                    // 月カレンダーの日付生成（簡易実装）
                    const day = new Date(currentYear, currentMonth - 1, index - 5);
                    const isCurrentMonth = day.getMonth() === currentMonth - 1;
                    const isToday = new Date().toDateString() === day.toDateString();
                    const dayEvents = getEventsForDay(day);
                    
                    return (
                      <div 
                        key={index} 
                        className={`min-h-[80px] p-1 ${isCurrentMonth ? '' : 'bg-muted/30 text-muted-foreground'} ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event, eventIndex) => (
                            <DropdownMenu key={eventIndex}>
                              <DropdownMenuTrigger asChild>
                                <div
                                  className={`cursor-pointer rounded-sm ${getEventColor(event.risk, event.status)} p-0.5 text-[10px] shadow-sm hover:brightness-95`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="truncate">{event.id}</span>
                                    <span className="truncate">{formatTime(event.startDate)}</span>
                                  </div>
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <div className="p-2">
                                  <div className="font-medium">{event.title}</div>
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {new Date(event.startDate).toLocaleString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                                <DropdownMenuItem>詳細を表示</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-center text-[10px] text-muted-foreground">
                              +{dayEvents.length - 2}件
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}