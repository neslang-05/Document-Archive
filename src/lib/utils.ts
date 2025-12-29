import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

export function getFileIcon(extension: string): string {
  const icons: Record<string, string> = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    ppt: "📊",
    pptx: "📊",
    xls: "📈",
    xlsx: "📈",
    zip: "📦",
    rar: "📦",
    default: "📁",
  }
  return icons[extension.toLowerCase()] || icons.default
}
