import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "年前";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "个月前";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "天前";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "小时前";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "分钟前";
  return "刚刚";
}
