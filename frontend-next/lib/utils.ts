import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score >= 4) return 'text-green-600 bg-green-50 border-green-200';
  if (score === 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

export function formatFrequency(freq: string): string {
  const map: Record<string, string> = {
    'Annuel': '📅 Annuel',
    'Mensuel': '📆 Mensuel',
    'Hebdomadaire': '📊 Hebdomadaire',
    'Quotidien': '⚡ Quotidien',
    'Irrégulier': '🔄 Irrégulier',
    'Projet': '📌 Projet',
    'Biennal': '📅 Tous les 2 ans',
    'Quinquennal': '📅 Tous les 5 ans',
    'Décennal': '📅 Tous les 10 ans',
    'Continue': '🔄 Continue',
    'Trimestriel': '📆 Trimestriel',
    'Semestriel': '📆 Semestriel'
  };
  return map[freq] || freq;
}