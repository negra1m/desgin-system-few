# @fewcompany/ui

Componentes React 19 da Few Company. Importe `@fewcompany/ui/styles.css` uma vez na entrada do app. Temas disponíveis: `few`, `dark`, `caraminholas`, `ifight`, pelo atributo `data-few-theme` em qualquer contêiner.

```tsx
import '@fewcompany/ui/styles.css';
import { Button, Field, Input } from '@fewcompany/ui';

<Field label="E-mail" hint="Usado para confirmações.">
  {props => <Input {...props} type="email" />}
</Field>
<Button variant="primary" loading={saving}>Salvar</Button>
```

Formulários usam controles HTML nativos; passe `value` e `onChange` para estado controlado. Use `Field` para associar label, hint e erro. Tabs e Dialog são controlados. `Button` tem `type="button"` por padrão; defina `type="submit"` nos formulários.

Exports: Button, Badge, Card, CardHeader, Field, Input, Select, Textarea, Checkbox, Switch, Alert, Tabs, Dialog, MetricCard, EmptyState, Skeleton, Progress, Avatar, DataTable, tokens, registry e tipos públicos.

Não publique no registro antes de configurar o escopo Few Company e revisar a política de licença. O tarball gerado por `npm pack` pode ser instalado diretamente em projetos internos.
