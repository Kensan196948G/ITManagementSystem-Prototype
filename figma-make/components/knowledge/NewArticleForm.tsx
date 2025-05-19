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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BookOpen, FileUp, X } from "lucide-react";
import { Badge } from "../ui/badge";

interface NewArticleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (articleData: any) => void;
}

export function NewArticleForm({ isOpen, onClose, onSubmit }: NewArticleFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    category: "",
    content: "",
    tags: [] as string[],
    attachments: [] as string[],
    visibility: "public",
    status: "draft",
    currentTag: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleAddTag = () => {
    if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.currentTag.trim()],
        currentTag: ""
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddAttachment = () => {
    // In a real app, this would handle file uploads
    const mockFileName = `file-${Math.floor(Math.random() * 10000)}.pdf`;
    setFormData({
      ...formData,
      attachments: [...formData.attachments, mockFileName]
    });
  };

  const handleRemoveAttachment = (fileToRemove: string) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter(file => file !== fileToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.category || !formData.summary) {
      toast.error("必須項目を入力してください");
      return;
    }
    
    // Generate article ID and other metadata
    const articleData = {
      id: `KA-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: formData.title,
      summary: formData.summary,
      category: formData.category,
      content: formData.content,
      tags: formData.tags,
      attachments: formData.attachments,
      visibility: formData.visibility,
      status: formData.status,
      author: "山田太郎",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      views: 0,
      helpful: 0,
      notHelpful: 0,
    };
    
    onSubmit(articleData);
    
    // Reset form
    setFormData({
      title: "",
      summary: "",
      category: "",
      content: "",
      tags: [],
      attachments: [],
      visibility: "public",
      status: "draft",
      currentTag: "",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規記事作成</DialogTitle>
          <DialogDescription>
            ナレッジベースに新しい記事を作成します。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">基本情報</TabsTrigger>
              <TabsTrigger value="content">コンテンツ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="記事のタイトル"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">概要 <span className="text-destructive">*</span></Label>
                <Textarea
                  id="summary"
                  placeholder="記事の要約"
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
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
                      <SelectItem value="network">ネットワーク</SelectItem>
                      <SelectItem value="security">セキュリティ</SelectItem>
                      <SelectItem value="microsoft365">Microsoft 365</SelectItem>
                      <SelectItem value="activedirectory">Active Directory</SelectItem>
                      <SelectItem value="entra">Microsoft Entra ID</SelectItem>
                      <SelectItem value="teams">Microsoft Teams</SelectItem>
                      <SelectItem value="exchange">Exchange Online</SelectItem>
                      <SelectItem value="sharepoint">SharePoint</SelectItem>
                      <SelectItem value="hardware">ハードウェア</SelectItem>
                      <SelectItem value="software">ソフトウェア</SelectItem>
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
                      <SelectItem value="draft">下書き</SelectItem>
                      <SelectItem value="review">レビュー中</SelectItem>
                      <SelectItem value="published">公開</SelectItem>
                      <SelectItem value="archived">アーカイブ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="visibility">公開範囲</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => handleChange("visibility", value)}
                >
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="公開範囲を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">全員に公開</SelectItem>
                    <SelectItem value="internal">社内のみ</SelectItem>
                    <SelectItem value="restricted">特定のグループのみ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>タグ</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="タグを入力"
                    value={formData.currentTag}
                    onChange={(e) => handleChange("currentTag", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>追加</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">削除</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>添付ファイル</Label>
                <div className="flex items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted/50" onClick={handleAddAttachment}>
                  <div className="flex flex-col items-center">
                    <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">クリックしてファイルをアップロード</p>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{file}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveAttachment(file)}
                      >
                        削除
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="content">記事の内容</Label>
                <Textarea
                  id="content"
                  placeholder="記事の本文をマークダウン形式で入力してください"
                  rows={20}
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  マークダウン形式で入力できます。見出しには # を使用し、リストには - を使用します。
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="button" variant="outline">
              下書き保存
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