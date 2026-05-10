"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchForm() {
  const [title, setTitle] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      router.push(`/result?title=${encodeURIComponent(title)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center space-x-2">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ゲームのタイトルを入力..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-primary/50 focus-visible:ring-primary text-lg"
        />
      </div>
      <Button type="submit" className="h-12 px-6">
        検索
      </Button>
    </form>
  );
}
