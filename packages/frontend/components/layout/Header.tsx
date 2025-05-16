import { Bell, Building2, LogOut, Mail, Search, User, UserCog, Users } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// サンプルユーザーデータ
const availableUsers = [
  {
    id: "user1",
    name: "山田太郎",
    nameInitials: "山太",
    email: "t.yamada@example.com",
    department: "IT部門",
    role: "IT管理者",
    lastLogin: "2025-05-10T08:30:00",
  },
  {
    id: "user2",
    name: "佐藤花子",
    nameInitials: "佐花",
    email: "h.sato@example.com",
    department: "カスタマーサポート",
    role: "サポートスタッフ",
    lastLogin: "2025-05-09T14:30:00",
  },
  {
    id: "user3",
    name: "田中次郎",
    nameInitials: "田次",
    email: "j.tanaka@example.com",
    department: "情報システム部",
    role: "システム管理者",
    lastLogin: "2025-05-10T09:15:00",
  }
];

// サンプル通知データ
const notifications = [
  {
    id: "notif1",
    title: "インシデント #INC-2025-0042 が割り当てられました",
    time: "10分前",
    read: false,
    type: "incident",
  },
  {
    id: "notif2",
    title: "変更申請 #CHG-2025-0019 が承認されました",
    time: "30分前",
    read: false,
    type: "change",
  },
  {
    id: "notif3",
    title: "SLA違反のアラートが発生しています",
    time: "1時間前",
    read: false,
    type: "alert",
  },
  {
    id: "notif4",
    title: "セキュリティパッチ適用の予定が登録されました",
    time: "3時間前",
    read: true,
    type: "security",
  },
  {
    id: "notif5",
    title: "新しいナレッジ記事「障害対応手順書」が公開されました",
    time: "昨日",
    read: true,
    type: "knowledge",
  }
];

export function Header() {
  const [currentUser, setCurrentUser] = useState(availableUsers[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userNotifications, setUserNotifications] = useState(notifications);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isUserSwitchDialogOpen, setIsUserSwitchDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentUser.id);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // 通知の未読数をカウント
  const unreadCount = userNotifications.filter(notif => !notif.read).length;

  // 通知をすべて既読にする
  const markAllAsRead = () => {
    const updatedNotifications = userNotifications.map(notif => ({
      ...notif,
      read: true
    }));
    setUserNotifications(updatedNotifications);
  };

  // 特定の通知を既読にする
  const markAsRead = (id: string) => {
    const updatedNotifications = userNotifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setUserNotifications(updatedNotifications);
  };

  // ユーザーの切替
  const switchUser = () => {
    const newUser = availableUsers.find(user => user.id === selectedUserId);
    if (newUser) {
      setCurrentUser(newUser);
      setIsUserSwitchDialogOpen(false);
    }
  };

  // 検索ハンドラー
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 実際の検索機能を実装する場合はここで検索APIを呼び出すなどの処理を行う
    console.log(`検索クエリ: ${searchQuery}`);
    // 検索結果画面に遷移するなどの処理を追加
  };

  // ログアウト処理
  const handleLogout = () => {
    // 実際のログアウト処理（API呼び出しなど）
    console.log("ログアウト処理を実行");
    setIsLogoutDialogOpen(false);
    // ログアウト後にログイン画面に遷移する処理を追加
  };

  // 通知のテスト関数
  const handleNotificationClick = () => {
    console.log("通知がクリックされました");
    setNotificationOpen(!notificationOpen);
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <div className="relative flex-1">
        <form onSubmit={handleSearch} className="flex items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm pl-8"
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="sm" 
            className="ml-1 h-8"
          >
            検索
          </Button>
        </form>
      </div>
      
      {/* 通知ポップオーバー - 完全修正版 */}
      <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
        <PopoverTrigger onClick={handleNotificationClick} className="group p-2 rounded-md hover:bg-accent relative inline-flex items-center justify-center cursor-pointer">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0">{unreadCount}</Badge>
          )}
          <span className="sr-only">通知</span>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" alignOffset={-5} className="w-[350px] p-0">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-medium">通知</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs h-7"
              >
                すべて既読にする
              </Button>
            )}
          </div>
          <div className="max-h-[300px] overflow-auto">
            {userNotifications.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                通知はありません
              </div>
            ) : (
              userNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`
                    p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer
                    ${notification.read ? '' : 'bg-accent/30'}
                  `}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {!notification.read && (
                      <Badge className="ml-2 h-1.5 w-1.5 rounded-full p-0 bg-blue-500" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{notification.time}</div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full justify-center">
              すべての通知を表示
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* ユーザーメニュー - 修正版 */}
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{currentUser.nameInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.role}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>ユーザー情報</DropdownMenuLabel>
            <div className="px-2 py-1.5">
              <div className="text-sm font-medium">{currentUser.name}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{currentUser.department}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log("プロフィール")}>
              <User className="mr-2 h-4 w-4" />
              <span>プロフィール</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("設定")}>
              <UserCog className="mr-2 h-4 w-4" />
              <span>設定</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsUserSwitchDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              <span>ユーザー切替</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>ログアウト</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ユーザー切替ダイアログ */}
      <Dialog open={isUserSwitchDialogOpen} onOpenChange={setIsUserSwitchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ユーザー切替</DialogTitle>
            <DialogDescription>
              別のユーザーアカウントに切り替えます
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-select">切替先ユーザー</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ユーザーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserSwitchDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={switchUser}>切替</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ログアウト確認ダイアログ */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ログアウト確認</DialogTitle>
            <DialogDescription>
              システムからログアウトしますか？
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              ログアウトすると、再度ログインするまで各種機能が使用できなくなります。
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              進行中の作業があれば先に保存することをお勧めします。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleLogout}>ログアウト</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}