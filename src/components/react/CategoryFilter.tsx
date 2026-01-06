import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const [activeId, setActiveId] = React.useState<number | null>(null);

  return (
    <div className="flex gap-4">
      <Button
        variant={activeId === null ? "default" : "outline"}
        className={cn(
          "px-5 py-2 rounded-full text-sm font-bold shadow-md transition-colors",
          activeId === null
            ? "bg-blue-600 text-white hover:bg-blue-700 border-transparent"
            : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-slate-600 hover:bg-white"
        )}
        onClick={() => setActiveId(null)}
      >
        全部资源
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeId === category.id ? "default" : "outline"}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-colors",
            activeId === category.id
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md border-transparent"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-slate-600 hover:bg-white"
          )}
          onClick={() => setActiveId(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
