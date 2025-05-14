import { useState } from "react";
import { Book, BookOpen, FileText, Filter, Plus, Search, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { KnowledgeArticlesList } from "./KnowledgeArticlesList";
import { KnownErrorsList } from "./KnownErrorsList";
import { KnowledgeArticleDetail } from "./KnowledgeArticleDetail";
import { KnownErrorDetail } from "./KnownErrorDetail";
import { NewArticleForm } from "./NewArticleForm";
import { toast } from "sonner";

export function KnowledgeBasePage() {
  const [viewMode, setViewMode] = useState<"list" | "article" | "knownError">("list");
  const [activeTab, setActiveTab] = useState<"articles" | "knownErrors">("articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isNewArticleFormOpen, setIsNewArticleFormOpen] = useState(false);
  
  // タブが変更されたときのハンドラー
  const handleTabChange = (value: string) => {
    setActiveTab(value as "articles" | "knownErrors");
  };
  
  // 検索処理のハンドラー
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 実際の検索処理はここに実装
    console.log("検索クエリ:", searchQuery);
  };
  
  // 記事詳細を表示する処理
  const handleViewArticle = () => {
    setViewMode("article");
  };
  
  // 既知のエラー詳細を表示する処理
  const handleViewKnownError = () => {
    setViewMode("knownError");
  };
  
  // リスト表示に戻る処理
  const handleBackToList = () => {
    setViewMode("list");
  };

  // 新規記事を作成する処理
  const handleCreateArticle = (articleData: any) => {
    // 実際のアプリではAPIを呼び出して記事を保存
    console.log("新規記事データ:", articleData);
    toast.success(`記事「${articleData.title}」が作成されました`);
  };
  
  return (
    <div className="space-y-4 p-4">
      {viewMode === "list" ? (
        <>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h1>ナレッジベース</h1>
              <p className="text-muted-foreground">
                技術文書と既知のエラーデータベース
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsNewArticleFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                新規記事作成
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="記事を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit" variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">フィルター</span>
              </Button>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="カテゴリで絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのカテゴリ</SelectItem>
                  <SelectItem value="network">ネットワーク</SelectItem>
                  <SelectItem value="security">セキュリティ</SelectItem>
                  <SelectItem value="microsoft365">Microsoft 365</SelectItem>
                  <SelectItem value="activedirectory">Active Directory</SelectItem>
                  <SelectItem value="entra">Microsoft Entra ID</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="exchange">Exchange Online</SelectItem>
                </SelectContent>
              </Select>
            </form>
          </div>
          
          <Tabs defaultValue="articles" value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="articles" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span>技術文書</span>
              </TabsTrigger>
              <TabsTrigger value="knownErrors" className="gap-2">
                <FileText className="h-4 w-4" />
                <span>既知のエラー</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="articles">
              <KnowledgeArticlesList 
                searchQuery={searchQuery} 
                categoryFilter={categoryFilter}
                onViewArticle={handleViewArticle}
              />
            </TabsContent>
            <TabsContent value="knownErrors">
              <KnownErrorsList 
                searchQuery={searchQuery} 
                categoryFilter={categoryFilter}
                onViewKnownError={handleViewKnownError}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : viewMode === "article" ? (
        <KnowledgeArticleDetail onBack={handleBackToList} />
      ) : (
        <KnownErrorDetail onBack={handleBackToList} />
      )}

      {/* 新規記事作成フォームのダイアログ */}
      <NewArticleForm 
        isOpen={isNewArticleFormOpen}
        onClose={() => setIsNewArticleFormOpen(false)}
        onSubmit={handleCreateArticle}
      />
    </div>
  );
}