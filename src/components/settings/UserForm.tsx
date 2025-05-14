import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface UserFormProps {
  initialData?: {
    name: string;
    email: string;
    role: string;
    department: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "general",
    department: "IT部門"
  });
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleRoleChange = (value: string) => {
    console.log("Role changed to:", value);
    setFormData({
      ...formData,
      role: value
    });
  };
  
  const handleDepartmentChange = (value: string) => {
    setFormData({
      ...formData,
      department: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">氏名</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="例: 山田 太郎"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="例: taro.yamada@example.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">ユーザー権限</Label>
        <Select
          value={formData.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="権限を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">管理者</SelectItem>
            <SelectItem value="general">一般ユーザー</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm mt-2 text-muted-foreground">
          {formData.role === "admin" 
            ? "管理者：全機能へのアクセス権、ユーザー・システム設定の管理権限" 
            : "一般ユーザー：基本機能へのアクセス権、限定的な管理権限"}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">部署</Label>
        <Select
          value={formData.department}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="部署を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IT部門">IT部門</SelectItem>
            <SelectItem value="情���システム部">情報システム部</SelectItem>
            <SelectItem value="カスタマーサポート">カスタマーサポート</SelectItem>
            <SelectItem value="営業部">営業部</SelectItem>
            <SelectItem value="人事部">人事部</SelectItem>
            <SelectItem value="財務部">財務部</SelectItem>
            <SelectItem value="マーケティング部">マーケティング部</SelectItem>
            <SelectItem value="開発部">開発部</SelectItem>
            <SelectItem value="経営企画部">経営企画部</SelectItem>
            <SelectItem value="総務部">総務部</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          {initialData ? "更新" : "追加"}
        </Button>
      </div>
    </form>
  );
}