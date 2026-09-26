import type { Metadata } from 'next';
import '@fewcompany/ui/styles.css';
import './globals.css';
export const metadata: Metadata = { title: 'Few UI — Design system', description: 'Uma linguagem compartilhada para tudo que a Few constrói.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><body>{children}</body></html>; }
