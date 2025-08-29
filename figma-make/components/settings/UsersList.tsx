import { useState } from "react";
import { 
  User, Pencil, Trash, Shield, UserPlus, Search, Filter, MoreHorizontal 
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../ui/dialog";
import { UserForm } from "./UserForm";
import { toast } from "sonner@2.0.3";

// サンプルユーザーデータ
const sampleUsers = [
  { 
    id: "u1", 
    name: "山田 太郎", 
    email: "t.yamada@example.com", 
    role: "admin", 
    department: "IT部門", 
    lastLogin: "2025-05-10T09:30:00" 
  },
  { 
    id: "u2", 
    name: "佐藤 花子", 
    email: "h.sato@example.com", 
    role: "general", 
    department: "カスタマーサポート", 
    lastLogin: "2025-05-09T14:45:00" 
  },
  { 
    id: "u3", 
    name: "田中 次郎", 
    email: "j.tanaka@example.com", 
    role: "admin", 
    department: "情報システム部", 
    lastLogin: "2025-05-10T11:20:00" 
  },
  { 
    id: "u4", 
    name: "鈴木 一郎", 
    email: "i.suzuki@example.com", 
    role: "general", 
    department: "営業部", 
    lastLogin: "2025-05-08T16:10:00" 
  },
  { 
    id: "u5", 
    name: "高橋 真理子", 
    email: "m.takahashi@example.com", 
    role: "general", 
    department: "人事部", 
    lastLogin: "2025-05-07T10:15:00" 
  },
  { 
    id: "u6", 
    name: "伊藤 健太", 
    email: "k.ito@example.com", 
    role: "general", 
    department: "財務部", 
    lastLogin: "2025-05-06T13:40:00" 
  },
  { 
    id: "u7", 
    name: "渡辺 麻衣", 
    email: "m.watanabe@example.com", 
    role: "admin", 
    department: "情報システム部", 
    lastLogin: "2025-05-10T08:55:00" 
  },
];

// 日付フォーマット用ユーティリティ関数
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function UsersList() {
  const [users, setUsers] = useState(sampleUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // 検索とフィルタリング
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // ユーザー追加
  const handleAddUser = (userData: any) => {
    const newUser = {
      id: `u${users.length + 1}`,
      ...userData,
      lastLogin: '-'
    };
    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    toast.success("ユーザーが追加されました");
  };

  // ユーザー編集
  const handleEditUser = (userData: any) => {
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id ? { ...user, ...userData } : user
    );
    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
    toast.success("ユーザー情報が更新されました");
  };

  // ユーザー削除
  const handleDeleteUser = () => {
    const updatedUsers = users.filter(user => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    setIsDeleteDialogOpen(false);
    toast.success("ユーザーが削除されました");
  };

  // 編集ダイアログを開く
  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // 削除ダイアログを開く
  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">ユーザー管理</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          新規ユーザー追加
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ユーザーを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="権限でフィルタ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての権限</SelectItem>
            <SelectItem value="admin">管理者</SelectItem>
            <SelectItem value="general">一般ユーザー</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>権限</TableHead>
              <TableHead>部署</TableHead>
              <TableHead>最終ログイン</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'admin' ? (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Shield className="mr-1 h-3 w-3" />
                      管理者
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <User className="mr-1 h-3 w-3" />
                      一般ユーザー
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>{user.lastLogin !== '-' ? formatDate(user.lastLogin) : '-'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">メニューを開く</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openEditDialog(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* 新規ユーザー追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新規ユーザー追加</DialogTitle>
            <DialogDescription>
              新しいユーザーの情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <UserForm onSubmit={handleAddUser} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* ユーザー編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
            <DialogDescription>
              ユーザー情報を編集してください
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm 
              initialData={selectedUser} 
              onSubmit={handleEditUser} 
              onCancel={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* ユーザー削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ユーザー削除</DialogTitle>
            <DialogDescription>
              本当にこのユーザーを削除しますか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}