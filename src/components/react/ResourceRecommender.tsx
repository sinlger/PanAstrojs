import * as React from "react";
import { CategoryFilter } from "./CategoryFilter";
import { ResourceCard } from "./ResourceCard";
import { Button } from "@/components/ui/button";
import { formatBytes, formatTimeAgo } from "@/lib/utils";

interface Resource {
  id: number;
  title: string;
  created_at: string;
  file_size: number;
  source_code: string;
  source_name: string;
  category_name: string | null;
  share_url: string;
}

interface Category {
  id: number;
  name: string;
}

interface ResourceRecommenderProps {
  initialResources: Resource[];
  categories: Category[];
  totalResources: number;
}

export function ResourceRecommender({ initialResources, categories, totalResources: initialTotal }: ResourceRecommenderProps) {
  const [resources, setResources] = React.useState<Resource[]>(initialResources);
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  const fetchResources = async (catId: number | null, pageNum: number, append: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (catId) params.append("category_id", catId.toString());
      params.append("page", pageNum.toString());
      params.append("limit", "12");

      const res = await fetch(`/api/resources?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (append) {
        setResources(prev => [...prev, ...data]);
      } else {
        setResources(data);
      }
      
      if (data.length < 10) setHasMore(false);
      else setHasMore(true);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (id: number | null) => {
    if (selectedCategory === id) return;
    setSelectedCategory(id);
    setPage(1);
    fetchResources(id, 1, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResources(selectedCategory, nextPage, true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        <CategoryFilter 
            categories={categories} 
            selectedId={selectedCategory} 
            onSelect={handleCategorySelect} 
        />
        <div className="hidden sm:block text-sm text-slate-400">
            共收录 {initialTotal.toLocaleString()} 条记录
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            id={resource.id}
            title={resource.title}
            date={formatTimeAgo(resource.created_at)}
            size={formatBytes(resource.file_size)}
            source={resource.category_name || "未分类"}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 text-center">
            <Button
            variant="outline"
            className="px-8 py-3 h-auto bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            onClick={handleLoadMore}
            disabled={loading}
            >
            {loading ? "加载中..." : "加载更多资源"}
            </Button>
        </div>
      )}
    </div>
  );
}
