import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-4">
      <Button
        variant={selectedId === null ? "default" : "outline"}
        className={cn(
          "px-5 py-2 rounded-full text-sm font-bold shadow-md transition-colors",
          selectedId === null
            ? "bg-blue-600 text-white hover:bg-blue-700 border-transparent"
            : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-slate-600 hover:bg-white"
        )}
        onClick={() => onSelect(null)}
      >
        全部资源
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedId === category.id ? "default" : "outline"}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-colors",
            selectedId === category.id
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md border-transparent"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-slate-600 hover:bg-white"
          )}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
