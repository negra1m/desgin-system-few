import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '@fewcompany/ui/styles.css';
import './globals.css';
export const metadata: Metadata = { title: 'Few UI — Design system', description: 'Uma linguagem compartilhada para tudo que a Few constrói.' };
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-few-sans', display: 'swap' });
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR" className={poppins.variable}><body>{children}</body></html>; }
