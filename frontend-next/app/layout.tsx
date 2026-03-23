import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Africa Data Sources',
  description: 'Méta-base centralisée des sources de données africaines',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}