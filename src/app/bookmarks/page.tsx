"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Gamepad2, Columns, Upload, Filter, Monitor } from "lucide-react";
import { PlayStatus } from "@/lib/types";
import { parseCSV } from "@/lib/csvParser";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, updateStatus, bulkImport } = useBookmarks();
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<PlayStatus | "すべて">("すべて");
  const [platformFilter, setPlatformFilter] = useState<string>("すべて");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract all unique platforms
  const allPlatforms = useMemo(() => {
    const platforms = new Set<string>();
    bookmarks.forEach(b => {
      b.platforms.forEach(p => platforms.add(p));
    });
    return Array.from(platforms).sort();
  }, [bookmarks]);

  // Filter bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      if (statusFilter !== "すべて" && b.status !== statusFilter) return false;
      if (platformFilter !== "すべて" && b.platforms.length > 0 && !b.platforms.includes(platformFilter)) return false;
      return true;
    });
  }, [bookmarks, statusFilter, platformFilter]);

  const handleSelect = (title: string) => {
    setSelectedForCompare((prev) => 
      prev.includes(title) 
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const handleCompare = () => {
    if (selectedForCompare.length >= 2) {
      const query = selectedForCompare.map(t => `title=${encodeURIComponent(t)}`).join('&');
      router.push(`/compare?${query}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          bulkImport(parsed);
          alert(`${parsed.length}件のゲームをインポートしました！`);
        } else {
          alert("CSVからデータを読み取れませんでした。フォーマットを確認してください。");
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (bookmarks.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Gamepad2 className="w-16 h-16 text-muted-foreground opacity-50" />
          <h1 className="text-2xl font-bold">マイライブラリが空です</h1>
          <p className="text-muted-foreground">検索結果ページから追加するか、CSVで一括インポートしてください。</p>
          <div className="flex gap-4 mt-4">
            <Link href="/">
              <Button>検索ページへ</Button>
            </Link>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              CSVインポート
            </Button>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight">マイライブラリ</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* CSV Import */}
            <div>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 h-9">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">インポート</span>
              </Button>
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>

            {/* Compare Button */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedForCompare.length}件選択中
              </span>
              <Button 
                onClick={handleCompare} 
                disabled={selectedForCompare.length < 2}
                className="flex items-center gap-2 h-9"
              >
                <Columns className="w-4 h-4" />
                <span className="hidden sm:inline">比較する</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-background/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">ステータス:</span>
            <select 
              className="bg-transparent border rounded p-1 text-sm focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PlayStatus | "すべて")}
            >
              <option value="すべて">すべて</option>
              <option value="未プレイ">未プレイ</option>
              <option value="プレイ中">プレイ中</option>
              <option value="クリア済">クリア済</option>
              <option value="途中リタイア">途中リタイア</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">ハード:</span>
            <select 
              className="bg-transparent border rounded p-1 text-sm focus:ring-primary max-w-[200px]"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="すべて">すべて</option>
              {allPlatforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBookmarks.map((game) => {
            const isSelected = selectedForCompare.includes(game.id);
            const statusColors: Record<PlayStatus, string> = {
              "未プレイ": "bg-secondary text-secondary-foreground",
              "プレイ中": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
              "クリア済": "bg-green-500/20 text-green-400 border border-green-500/30",
              "途中リタイア": "bg-destructive/20 text-destructive border border-destructive/30"
            };

            return (
              <Card 
                key={game.id} 
                className={`relative flex flex-col h-full transition-all duration-200 cursor-pointer ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => handleSelect(game.id)}
              >
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(game.id);
                      setSelectedForCompare(prev => prev.filter(t => t !== game.id));
                    }}
                  >
                    ×
                  </Button>
                </div>
                <CardHeader className="pb-3 pr-10">
                  <CardTitle className="line-clamp-2 text-lg leading-tight min-h-[2.8rem]">{game.title}</CardTitle>
                  <div className="flex gap-2 flex-wrap mt-2">
                    <select
                      className={`text-xs px-2 py-1 rounded-md font-medium outline-none cursor-pointer ${statusColors[game.status]}`}
                      value={game.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(game.id, e.target.value as PlayStatus)}
                    >
                      <option value="未プレイ">未プレイ</option>
                      <option value="プレイ中">プレイ中</option>
                      <option value="クリア済">クリア済</option>
                      <option value="途中リタイア">途中リタイア</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {game.platforms && game.platforms.length > 0 ? (
                      game.platforms.slice(0, 3).map((p, i) => (
                        <span key={i} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground">ハード未定</span>
                    )}
                    {game.platforms && game.platforms.length > 3 && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">+{game.platforms.length - 3}</span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t flex gap-2">
                    <Link 
                      href={`/result?title=${encodeURIComponent(game.title)}`}
                      className="w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant={game.info ? "outline" : "default"} className="w-full h-9 text-xs">
                        {game.info ? "詳細を見る" : "AIで詳細を生成する"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
