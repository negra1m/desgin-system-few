export type Category = 'Utilitários' | 'Ações' | 'Formulários' | 'Navegação' | 'Overlays' | 'Feedback' | 'Dados' | 'Estrutura' | 'Tipografia';
export const categories: Category[] = ['Utilitários', 'Ações', 'Formulários', 'Navegação', 'Overlays', 'Feedback', 'Dados', 'Estrutura', 'Tipografia'];
export const LIBRARY_VERSION = '1.1.0';

export interface ComponentRecord {
  id: string; name: string; category: Category; description: string;
  version: string; variants: string[]; origins: string[]; consumers: string[]; code: string;
  /** Partes do componente composto, ex.: ['Root', 'List', 'Trigger', 'Content']. Vazio para componentes simples. */
  parts: string[];
  /** Referências de mercado que inspiraram a API. */
  references: string[];
  /** Mesmo exemplo de `code`, em template Vue (`@fewcompany/vue`). Vazio enquanto não houver snippet. */
  vueCode: string;
}

export interface ComponentInput { id: string; name: string; category: Category; description: string; variants: string[]; origins: string[]; code: string; vueCode?: string; parts?: string[]; references?: string[] }
export const component = ({ parts = [], references = [], vueCode = '', ...input }: ComponentInput): ComponentRecord => ({ ...input, parts, references, vueCode, version: LIBRARY_VERSION, consumers: ['Catálogo Few'] });
