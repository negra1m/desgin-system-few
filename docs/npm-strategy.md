# Parecer de produto e distribuição

## Decisão do MVP

**Viável como pacote interno versionado.** A oportunidade imediata é reduzir duplicação entre os projetos da Few e dar previsibilidade às atualizações. O MVP entrega formato npm, declarações TypeScript, exports explícitos, peer dependencies React e tarball instalável.

A avaliação usa a perspectiva de marketing/produto solicitada no initial; não implica uma consulta a uma pessoa externa.

## Público e proposta

Público inicial: desenvolvedores da Few que iniciam apps React web ou desktop. Proposta: usar padrões já reconhecíveis nos produtos, preservando a identidade de cada marca com tokens. Catálogo, exemplos e versões reduzem o custo de descoberta e adoção.

## Por que não lançar como produto público agora

Ainda não há evidência de adoção do pacote em dois aplicativos independentes, política de suporte ou licença pública aprovada. Publicar como oferta comercial/open source antes dessa validação criaria compromisso de compatibilidade sem necessidade imediata. O pacote usa `UNLICENSED` e `publishConfig.access=restricted` deliberadamente.

## Próximo gate de publicação

1. Migrar uma tela real de Caraminholas e uma de iFIGHT; medir esforço e diferenças de tema.
2. Validar acessibilidade e estabilidade da API nos consumidores, incluindo renderer desktop quando existir.
3. Confirmar escopo `@fewcompany`, conta npm e acesso privado; escolher licença antes de tornar público.
4. Automatizar releases com changelog e SemVer. No ciclo 0.x, alterações incompatíveis exigem nova minor e guia de migração.

Métrica inicial: menos componentes copiados por projeto, menos ajustes locais e menor tempo até a primeira tela funcional. Não estimamos receita ou demanda pública sem evidência.
