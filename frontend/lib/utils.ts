import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getScoreColor = (score: number) => {
  if (score >= 85) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-rose-500";
};

export const getOddsWidth = (level: string) => {
  const l = level.toLowerCase();
  if (l.includes('high')) return 'w-full';
  if (l.includes('medium')) return 'w-2/3';
  return 'w-1/3';
};

export const getOddsColorClass = (level: string) => {
   const l = level.toLowerCase();
   if (l.includes('high')) return 'bg-emerald-500';
   if (l.includes('medium')) return 'bg-amber-500';
   return 'bg-rose-500';
};

export const getOddsColor = (level: string) => {
  const l = level.toLowerCase();
  if (l.includes('high')) return 'text-emerald-600 dark:text-emerald-400';
  if (l.includes('medium')) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
};
