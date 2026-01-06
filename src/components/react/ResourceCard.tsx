import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive, ChevronRight } from "lucide-react";

interface ResourceCardProps {
  title: string;
  date: string;
  size: string;
  source: string;
  link: string;
}

const getBadgeStyle = (source: string) => {
  const lowerSource = source.toLowerCase();
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

export function ResourceCard({
  title,
  date,
  size,
  source,
  link,
}: ResourceCardProps) {
  return (
    <Card className="bg-white border border-slate-200 rounded-2xl card-hover shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <CardHeader className="p-5 pb-0">
        <div className="flex justify-between items-start mb-3">
          <Badge
            variant="secondary"
            className={`px-2 py-1 text-[10px] font-bold rounded uppercase border-none shadow-none ${getBadgeStyle(
              source
            )}`}
          >
            {source}
          </Badge>
          <span className="text-[11px] text-slate-400">{date}</span>
        </div>
        <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors text-base">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="p-5 pt-0 mt-5 flex items-center justify-between">
        <div className="flex items-center text-xs text-slate-400">
          <HardDrive className="w-3 h-3 mr-1" />
          {size}
        </div>
        <a
          href={link}
          className="text-xs font-bold text-blue-500 flex items-center group"
        >
          查看详情
          <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
        </a>
      </CardContent>
    </Card>
  );
}
