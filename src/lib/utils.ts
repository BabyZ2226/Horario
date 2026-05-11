import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  pink: 'bg-pink-100 text-pink-800 border-pink-300',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  slate: 'bg-slate-100 text-slate-800 border-slate-300',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  violet: 'bg-violet-100 text-violet-800 border-violet-300',
  rose: 'bg-rose-100 text-rose-800 border-rose-300',
  amber: 'bg-amber-100 text-amber-800 border-amber-300',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  teal: 'bg-teal-100 text-teal-800 border-teal-300',
  lime: 'bg-lime-100 text-lime-800 border-lime-300',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300'
};
