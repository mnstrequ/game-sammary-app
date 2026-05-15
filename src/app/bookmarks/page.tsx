"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Gamepad2, Columns, Upload, Filter, Monitor, ClipboardPaste, Dices, ArrowUpDown, Loader2 } from "lucide-react";
import { PlayStatus } from "@/lib/types";
import { parseCSV, parseExcel } from "@/lib/fileParser";
import { pickRandomGame, sortGamesByTheme } from "@/app/actions/aiFeatures";

type SortOption = "newest" | "title" | "time_short" | "time_long" | "ai_theme";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, updateStatus, bulkImport } = useBookmarks();
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<PlayStatus | "すべて">("すべて");
  const [platformFilter, setPlatformFilter] = useState<string>("すべて");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [aiTheme, setAiTheme] = useState("レベル上げが楽しい");
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPickResult, setAiPickResult] = useState<{title: string, message: string} | null>(null);
  
  // Custom sort order array from AI
  const [aiSortedIds, setAiSortedIds] = useState<string[]>([]);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allPlatforms = useMemo(() => {
    const platforms = new Set<string>();
    bookmarks.forEach(b => {
      b.platforms.forEach(p => platforms.add(p));
    });
    return Array.from(platforms).sort();
  }, [bookmarks]);

  // Extract hours from clear_time string (e.g. "30時間" -> 30)
  const parseHours = (timeStr?: string) => {
    if (!timeStr) return 9999;
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 9999;
  };

  const filteredAndSortedBookmarks = useMemo(() => {
    let result = bookmarks.filter(b => {
      if (statusFilter !== "すべて" && b.status !== statusFilter) return false;
      if (platformFilter !== "すべて" && b.platforms.length > 0 && !b.platforms.includes(platformFilter)) return false;
      return true;
    });

    if (sortOption === "newest") {
      result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    } else if (sortOption === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
    } else if (sortOption === "time_short") {
      result.sort((a, b) => parseHours(a.info?.clear_time.main) - parseHours(b.info?.clear_time.main));
    } else if (sortOption === "time_long") {
      result.sort((a, b) => parseHours(b.info?.clear_time.main) - parseHours(a.info?.clear_time.main));
    } else if (sortOption === "ai_theme" && aiSortedIds.length > 0) {
      result.sort((a, b) => {
        const idxA = aiSortedIds.indexOf(a.id);
        const idxB = aiSortedIds.indexOf(b.id);
        // If not in AI sorted list, put at the end
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    return result;
  }, [bookmarks, statusFilter, platformFilter, sortOption, aiSortedIds]);

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

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          const parsed = parseExcel(buffer);
          if (parsed.length > 0) {
            bulkImport(parsed);
            alert(`${parsed.length}件のゲームをインポートしました！`);
          } else {
            alert("Excelからデータを読み取れませんでした。フォーマットを確認してください。");
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const parsed = parseCSV(text);
          if (parsed.length > 0) {
            bulkImport(parsed);
            alert(`${parsed.length}件のゲームをインポートしました！`);
          } else {
            alert("CSV/TSVからデータを読み取れませんでした。フォーマットを確認してください。");
          }
        }
      };
      reader.readAsText(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    const parsed = parseCSV(pasteText);
    if (parsed.length > 0) {
      bulkImport(parsed);
      alert(`${parsed.length}件のゲームをインポートしました！`);
      setPasteText("");
      setShowPasteArea(false);
    } else {
      alert("読み取れるデータがありませんでした。フォーマットを確認してください。");
    }
  };

  const handleRandomPick = async () => {
    const unplayed = bookmarks.filter(b => b.status === "未プレイ");
    if (unplayed.length === 0) {
      alert("未プレイのゲームがありません！");
      return;
    }
    
    setAiLoading(true);
    setAiPickResult(null);
    const result = await pickRandomGame(unplayed);
    setAiLoading(false);
    
    if (result) {
      const game = unplayed.find(g => g.id === result.id);
      if (game) {
        setAiPickResult({ title: game.title, message: result.message });
      } else {
        alert("エラーが発生しました。");
      }
    } else {
      alert("AIピックアップに失敗しました。");
    }
  };

  const handleAiSort = async () => {
    if (bookmarks.length === 0) return;
    setAiLoading(true);
    const sortedIds = await sortGamesByTheme(filteredBookmarks, aiTheme);
    setAiSortedIds(sortedIds);
    setSortOption("ai_theme");
    setAiLoading(false);
  };

  if (bookmarks.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Gamepad2 className="w-16 h-16 text-muted-foreground opacity-50" />
          <h1 className="text-2xl font-bold">マイライブラリが空です</h1>
          <p className="text-muted-foreground">検索結果ページから追加するか、リストを一括インポートしてください。</p>
          <div className="flex gap-4 mt-4">
            <Link href="/"><Button>検索ページへ</Button></Link>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />ファイルから読込
            </Button>
            <input type="file" accept=".csv,.xlsx,.xls,.tsv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => setShowPasteArea(!showPasteArea)} className="text-muted-foreground flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4" />コピペでインポート
            </Button>
            {showPasteArea && (
              <div className="mt-4 flex flex-col gap-2 w-full max-w-md animate-in fade-in slide-in-from-top-2">
                <textarea 
                  className="w-full h-32 p-3 text-sm bg-background border rounded-md focus:ring-primary outline-none"
                  placeholder="タイトル [タブ] ハード [タブ] ステータス"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                />
                <Button onClick={handlePasteSubmit}>登録する</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background relative">
      
      {/* AI Pickup Modal */}
      {aiPickResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border-2 border-primary rounded-xl p-8 max-w-lg w-full shadow-2xl relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setAiPickResult(null)}>×</Button>
            <div className="flex flex-col items-center text-center space-y-4">
              <Dices className="w-16 h-16 text-primary neon-glow mb-2" />
              <h2 className="text-xl font-bold text-muted-foreground">AIが選ぶ「次に遊ぶべきゲーム」は…</h2>
              <h1 className="text-3xl font-extrabold text-primary">{aiPickResult.title}</h1>
              <p className="text-lg leading-relaxed mt-4 p-4 bg-primary/10 rounded-lg">{aiPickResult.message}</p>
              <Link href={`/result?title=${encodeURIComponent(aiPickResult.title)}`} className="w-full mt-4">
                <Button className="w-full py-6 text-lg neon-box">さっそく詳細を見る！</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight">マイライブラリ</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleRandomPick} disabled={aiLoading} className="bg-gradient-to-r from-primary to-purple-500 text-white font-bold neon-box">
              {aiLoading && !aiPickResult ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Dices className="w-4 h-4 mr-2" />}
              AIランダムピック
            </Button>
            
            <Button variant="outline" onClick={() => setShowPasteArea(!showPasteArea)} className="flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4" />
              <span className="hidden sm:inline">コピペ</span>
            </Button>

            <div>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">ファイル</span>
              </Button>
              <input type="file" accept=".csv,.xlsx,.xls,.tsv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>

            <div className="flex items-center gap-2 ml-2 border-l pl-2">
              <span className="text-xs text-muted-foreground">{selectedForCompare.length}件選択</span>
              <Button onClick={handleCompare} disabled={selectedForCompare.length < 2} className="flex items-center gap-2">
                <Columns className="w-4 h-4" /><span className="hidden sm:inline">比較</span>
              </Button>
            </div>
          </div>
        </div>

        {showPasteArea && (
          <div className="p-4 border rounded-lg bg-background/50 backdrop-blur animate-in fade-in slide-in-from-top-2">
            <h3 className="font-bold mb-2">コピペでインポート (TSV対応)</h3>
            <p className="text-sm text-muted-foreground mb-4">GoogleスプレッドシートやExcelの表を選択してコピーし、ここに貼り付けてください。</p>
            <div className="flex gap-2 items-end">
              <textarea 
                className="flex-1 min-h-[100px] p-3 text-sm bg-background border rounded-md focus:ring-primary outline-none"
                placeholder="タイトル [タブ] ハード [タブ] ステータス"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              <Button onClick={handlePasteSubmit} className="mb-1">登録</Button>
            </div>
          </div>
        )}

        {/* Filters & Sorting */}
        <div className="flex flex-col lg:flex-row gap-4 p-4 border rounded-lg bg-background/50 backdrop-blur items-start lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
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
                className="bg-transparent border rounded p-1 text-sm focus:ring-primary max-w-[150px]"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="すべて">すべて</option>
                {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 border-l pl-4">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">並び替え:</span>
              <select 
                className="bg-transparent border rounded p-1 text-sm focus:ring-primary"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
              >
                <option value="newest">登録が新しい順</option>
                <option value="title">タイトル順</option>
                <option value="time_short">クリア時間：短い順</option>
                <option value="time_long">クリア時間：長い順</option>
                {aiSortedIds.length > 0 && <option value="ai_theme">AIテーマ順 ({aiTheme})</option>}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-primary/10 p-2 rounded border border-primary/20">
            <span className="text-sm font-bold text-primary">✨ AIソート:</span>
            <select 
              className="bg-transparent border-b border-primary text-sm focus:outline-none"
              value={aiTheme}
              onChange={(e) => setAiTheme(e.target.value)}
            >
              <option value="レベル上げが楽しい">レベル上げが楽しい順</option>
              <option value="ストーリーで感動して泣ける">ストーリーで泣ける順</option>
              <option value="アクションの爽快感が強い">アクションの爽快感順</option>
              <option value="世界観が重厚でダーク">ダークファンタジー順</option>
            </select>
            <Button size="sm" onClick={handleAiSort} disabled={aiLoading}>
              {aiLoading && sortOption !== "ai_theme" ? <Loader2 className="w-3 h-3 animate-spin" /> : "実行"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedBookmarks.map((game) => {
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
                    variant="ghost" size="icon"
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
                  <div className="flex flex-wrap gap-1 mb-2">
                    {game.platforms && game.platforms.length > 0 ? (
                      game.platforms.slice(0, 3).map((p, i) => (
                        <span key={i} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">{p}</span>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground">ハード未定</span>
                    )}
                  </div>
                  
                  {game.info && (
                    <div className="text-xs text-muted-foreground mb-4">
                      ⏱️ {game.info.clear_time.main}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t flex gap-2">
                    <Link href={`/result?title=${encodeURIComponent(game.title)}`} className="w-full" onClick={(e) => e.stopPropagation()}>
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
