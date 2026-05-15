"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { suggestTitles } from "@/app/actions/suggestTitles";

export function SearchForm() {
  const [title, setTitle] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (title.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      const results = await suggestTitles(title);
      setSuggestions(results);
      setIsSuggesting(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      setShowSuggestions(false);
      router.push(`/result?title=${encodeURIComponent(title.trim())}`);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setTitle(suggestion);
    setShowSuggestions(false);
    router.push(`/result?title=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2 relative z-20">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ゲームのタイトルを入力..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 h-12 bg-background/80 backdrop-blur-sm border-primary/50 focus-visible:ring-primary text-lg"
          />
        </div>
        <Button type="submit" className="h-12 px-6">
          検索
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && title.length >= 2 && (
        <div className="absolute top-full left-0 right-[88px] mt-2 bg-background/95 backdrop-blur border border-primary/20 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          {isSuggesting ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              候補を検索中...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((suggestion, idx) => (
                <li 
                  key={idx}
                  className="px-4 py-3 hover:bg-primary/10 cursor-pointer text-left flex items-center transition-colors text-sm"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <Search className="w-3.5 h-3.5 mr-3 text-muted-foreground opacity-50 shrink-0" />
                  <span className="line-clamp-1">{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-xs text-muted-foreground text-left">
              そのまま「検索」を押すと入力したタイトルで検索します。
            </div>
          )}
        </div>
      )}
    </div>
  );
}
