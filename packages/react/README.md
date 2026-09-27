# @fewcompany/ui

Adaptador React 19 do design system da Few Company, sobre `@fewcompany/core` (tokens, CSS e lógica headless). Importe `@fewcompany/ui/styles.css` uma vez na entrada do app. Temas: `few`, `dark`, `caraminholas`, `ifight`, pelo atributo `data-few-theme` em qualquer contêiner.

```tsx
import '@fewcompany/ui/styles.css';
import { Button, Dialog, Field, Input, Tabs } from '@fewcompany/ui';

<Field invalid={!!error}>
  <Field.Label>E-mail</Field.Label>
  <Field.Control><Input type="email" autoComplete="email" /></Field.Control>
  <Field.Error>{error}</Field.Error>
</Field>

<Tabs defaultValue="resumo">
  <Tabs.List><Tabs.Trigger value="resumo">Resumo</Tabs.Trigger><Tabs.Trigger value="atividade">Atividade</Tabs.Trigger></Tabs.List>
  <Tabs.Content value="resumo">…</Tabs.Content>
</Tabs>

<Dialog>
  <Dialog.Trigger asChild><Button>Compartilhar</Button></Dialog.Trigger>
  <Dialog.Content><Dialog.Title>Pronto?</Dialog.Title><Dialog.Close asChild><Button variant="secondary">Voltar</Button></Dialog.Close></Dialog.Content>
</Dialog>
```

Padrão de composição (ver `docs/composition.md`): cada componente é uma raiz com partes (`Foo.Trigger`, `Foo.Content`); toda parte aceita `asChild`, `className`, `ref` e as props nativas; estado por `value/defaultValue/onValueChange` (`open`, `checked`); `data-state` para estilizar. `Button` tem `type="button"` por padrão.

Categorias e exports: Utilitários (Slot, VisuallyHidden, Portal), Ações (Button, IconButton, ButtonGroup, Toggle, ToggleGroup, SplitButton, Link), Formulários (Form, Fieldset, Field, Label, Input, InputGroup, Textarea, NumberInput, PasswordInput, PinInput, NativeSelect, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Rating, FileUpload, TagsInput, Select, Combobox, MultiSelect, Calendar, DatePicker), Navegação (Tabs, Breadcrumb, Pagination, Steps, NavigationMenu, Sidebar, CommandMenu), Overlays (Dialog, AlertDialog, Drawer, Popover, Tooltip, DropdownMenu, ContextMenu, Menubar, Toast + useToast), Feedback (Alert, Badge, Tag, Progress, ProgressCircle, Spinner, Skeleton, EmptyState), Dados (Table, DataTable, List, DescriptionList, Avatar, AvatarGroup, Stat, Timeline, Tree, Accordion, Collapsible, Carousel), Estrutura (Card, Separator, AspectRatio, ScrollArea, Stack, Grid, Toolbar, AppShell), Tipografia (Heading, Text, Code, Kbd). Também `tokens`, `registry`, `categories` e os hooks da lib (`useControllableState`, `useDismiss`, `usePosition`, `useTopLayer`, `createContext`).

Não publique no registro antes de configurar o escopo Few Company e revisar a política de licença. Os tarballs gerados por `npm run pack:ui` (core + ui) podem ser instalados diretamente em projetos internos.
