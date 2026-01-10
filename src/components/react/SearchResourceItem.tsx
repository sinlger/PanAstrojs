import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

interface SearchResourceItemProps {
  id: number | string;
  title: string;
  description: string;
  sourceCode: string; // e.g. "quark"
  sharer: string;
  timeAgo: string;
  size: number;
  status: number; // 1: valid, 0: invalid, 2: unknown/pending
}

const getBadgeStyle = (source: string) => {
  const lowerSource = source.toLowerCase();
  
  // Category-based colors (Brighter)
  if (lowerSource.includes("视频")) return "bg-purple-100 text-purple-700 hover:bg-purple-200";
  if (lowerSource.includes("音乐") || lowerSource.includes("音频")) return "bg-pink-100 text-pink-700 hover:bg-pink-200";
  if (lowerSource.includes("软件") || lowerSource.includes("应用")) return "bg-blue-100 text-blue-700 hover:bg-blue-200";
  if (lowerSource.includes("文档") || lowerSource.includes("书籍")) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
  if (lowerSource.includes("图片") || lowerSource.includes("壁纸")) return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
  if (lowerSource.includes("游戏")) return "bg-red-100 text-red-700 hover:bg-red-200";
  if (lowerSource.includes("教程") || lowerSource.includes("课程")) return "bg-cyan-100 text-cyan-700 hover:bg-cyan-200";
  if (lowerSource.includes("压缩")) return "bg-orange-100 text-orange-700 hover:bg-orange-200";

  // Legacy/Netdisk fallbacks (Keep for backward compatibility or mixed use)
  if (lowerSource.includes("quark") || lowerSource.includes("夸克")) {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }
  if (lowerSource.includes("pikpak")) {
    return "bg-indigo-100 text-indigo-700 hover:bg-indigo-100";
  }
  if (lowerSource.includes("baidu") || lowerSource.includes("百度")) {
    return "bg-red-100 text-red-700 hover:bg-red-100";
  }
  if (lowerSource.includes("ali") || lowerSource.includes("阿里")) {
    return "bg-orange-100 text-orange-700 hover:bg-orange-100";
  }
  if (lowerSource.includes("xunlei") || lowerSource.includes("迅雷")) {
    return "bg-sky-100 text-sky-700 hover:bg-sky-100";
  }
  return "bg-slate-100 text-slate-700 hover:bg-slate-100";
};

const getStatusInfo = (status: number) => {
  switch (status) {
    case 1:
      return { text: "有效", color: "text-green-600", dot: "bg-green-500" };
    case 0:
      return { text: "失效", color: "text-red-500", dot: "bg-red-500" };
    default:
      return { text: "待检", color: "text-slate-400", dot: "bg-slate-300" };
  }
};

export function SearchResourceItem({
  id,
  title,
  description,
  sourceCode,
  sharer,
  timeAgo,
  size,
  status,
}: SearchResourceItemProps) {
  const badgeStyle = getBadgeStyle(sourceCode);
  const statusInfo = getStatusInfo(status);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3 text-xs">
          <Badge
            variant="secondary"
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase border-none shadow-none ${badgeStyle}`}
          >
            {sourceCode.toUpperCase()}
          </Badge>
          <span className="text-slate-400">
            来自: {sharer || "未知"} · {timeAgo}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug hover:text-blue-600 cursor-pointer transition-colors truncate">
          <a href={`/resource/${id}`}>
            {title}
          </a>
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2">
          {description || "暂无描述..."}
        </p>
      </div>

      <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 md:gap-1 min-w-[120px]">
        <div className="text-right">
          <div className="font-bold text-slate-700 text-lg">
            {formatBytes(size)}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-1 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            <span className={statusInfo.color}>{statusInfo.text}</span>
          </div>
        </div>
        <Button
          size="sm"
          className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-6 mt-auto"
          asChild
        >
          <a href={`/resource/${id}`}>
            详情
          </a>
        </Button>
      </div>
    </div>
  );
}
