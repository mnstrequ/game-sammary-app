"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Gamepad2, Columns } from "lucide-react";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const router = useRouter();

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

  if (bookmarks.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <div className="flex flex-col items-center space-y-4">
          <Gamepad2 className="w-16 h-16 text-muted-foreground opacity-50" />
          <h1 className="text-2xl font-bold">お気に入りがありません</h1>
          <p className="text-muted-foreground">検索結果ページから、お気に入りに追加してみましょう。</p>
          <Link href="/">
            <Button className="mt-4">検索ページへ</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight">お気に入り一覧</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {selectedForCompare.length}件選択中 (比較には2件以上必要です)
            </span>
            <Button 
              onClick={handleCompare} 
              disabled={selectedForCompare.length < 2}
              className="flex items-center gap-2"
            >
              <Columns className="w-4 h-4" />
              比較する
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((game) => {
            const isSelected = selectedForCompare.includes(game.title);
            return (
              <Card 
                key={game.title} 
                className={`relative transition-all duration-200 cursor-pointer ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => handleSelect(game.title)}
              >
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(game.title);
                      setSelectedForCompare(prev => prev.filter(t => t !== game.title));
                    }}
                  >
                    ×
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="pr-8 line-clamp-1">{game.title}</CardTitle>
                  <CardDescription>{game.genre}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">メインクリア</span>
                      <span className="font-medium">{game.clear_time.main}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">完全クリア</span>
                      <span className="font-medium">{game.clear_time.complete}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Link 
                      href={`/result?title=${encodeURIComponent(game.title)}`}
                      className="w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="outline" className="w-full h-8 text-xs">詳細を見る</Button>
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
