"use client";

import { useState, useEffect } from "react";
import { GameInfoResponse, PlayStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Users, HelpCircle, ThumbsUp, EyeOff, Eye, Star, Monitor } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

export function GameResult({ data }: { data: GameInfoResponse }) {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark, getBookmark, updateStatus, updateInfo } = useBookmarks();
  
  const bookmarked = isBookmarked(data.title);
  const savedGame = getBookmark(data.title);

  // If we open a result and it's already bookmarked but info is missing (e.g. from CSV import), update the info
  useEffect(() => {
    if (savedGame && !savedGame.info) {
      updateInfo(data.title, data);
    }
  }, [savedGame, data, updateInfo]);

  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(data.title);
    } else {
      addBookmark(data);
    }
  };

  const statusColors: Record<PlayStatus, string> = {
    "未プレイ": "bg-secondary text-secondary-foreground",
    "プレイ中": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    "クリア済": "bg-green-500/20 text-green-400 border border-green-500/30",
    "途中リタイア": "bg-destructive/20 text-destructive border border-destructive/30"
  };

  return (
    <div className="w-full max-w-5xl space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight neon-glow">{data.title}</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleBookmark}
            className={cn("rounded-full", bookmarked && "bg-primary/20")}
            title={bookmarked ? "ライブラリから削除" : "ライブラリに追加"}
          >
            <Star className={cn("w-5 h-5", bookmarked ? "fill-primary text-primary" : "text-muted-foreground")} />
          </Button>
        </div>
        <p className="text-xl text-muted-foreground">{data.genre}</p>
        
        {/* Platforms */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Monitor className="w-4 h-4 text-primary" />
          {data.platforms && data.platforms.map((p, i) => (
            <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded border">
              {p}
            </span>
          ))}
        </div>

        {/* Status Dropdown if bookmarked */}
        {bookmarked && savedGame && (
          <div className="mt-4">
            <select
              className={`text-sm px-3 py-1.5 rounded-md font-medium outline-none cursor-pointer ${statusColors[savedGame.status]}`}
              value={savedGame.status}
              onChange={(e) => updateStatus(savedGame.id, e.target.value as PlayStatus)}
            >
              <option value="未プレイ" className="bg-background text-foreground">未プレイ</option>
              <option value="プレイ中" className="bg-background text-foreground">プレイ中</option>
              <option value="クリア済" className="bg-background text-foreground">クリア済</option>
              <option value="途中リタイア" className="bg-background text-foreground">途中リタイア</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>クリア時間</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">メイン</span>
              <span className="font-medium">{data.clear_time.main}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">完全クリア</span>
              <span className="font-medium">{data.clear_time.complete}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DLC</span>
              <span className="font-medium">{data.clear_time.dlc}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>世界観</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{data.world}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <CardTitle>ストーリー</CardTitle>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowSpoiler(!showSpoiler)}
            className="flex items-center gap-2"
          >
            {showSpoiler ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showSpoiler ? "ネタバレを隠す" : "ネタバレを表示"}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed whitespace-pre-wrap">
            {showSpoiler ? data.story.spoiler_full : data.story.spoiler_free}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Users className="w-8 h-8 text-primary" />
          <CardTitle>登場人物</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.characters.map((char, index) => (
              <div key={index} className="border rounded-lg p-4 bg-background/50 hover:bg-accent/50 transition-colors">
                <h4 className="font-bold text-lg text-primary">{char.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{char.role}</p>
                <p className="text-sm">{char.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <HelpCircle className="w-8 h-8 text-primary" />
            <CardTitle>用語集</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {data.glossary.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left font-semibold text-primary hover:text-primary/80">
                    {item.term}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.meaning}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <ThumbsUp className="w-8 h-8 text-primary" />
            <CardTitle>おすすめポイント</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.recommend_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 bg-primary/20 p-1 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-primary neon-glow" />
                  </div>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
