import { component, type ComponentRecord } from './shared.js';
// Registro da categoria "Formulários" (pasta components/pickers). Um component() por componente, na ordem do menu.
export const pickersRegistry: ComponentRecord[] = [
  component({
    id: 'select', name: 'Select', category: 'Formulários',
    description: 'Campo de seleção única com listbox posicionado, navegação completa por teclado e typeahead.',
    variants: ['com grupos e separador', 'com input oculto para formulário (name)', 'desabilitado'],
    parts: ['Root', 'Trigger', 'Value', 'Icon', 'Content', 'Viewport', 'Group', 'Label', 'Item', 'ItemText', 'ItemIndicator', 'Separator'],
    origins: ['Caraminholas · OrderForm'],
    references: ['Radix Select', 'PrimeReact Dropdown'],
    code: '<Select defaultValue="few"><Select.Trigger><Select.Value placeholder="Selecione…"/><Select.Icon/></Select.Trigger><Select.Content><Select.Viewport><Select.Item value="few"><Select.ItemText>Few</Select.ItemText><Select.ItemIndicator/></Select.Item></Select.Viewport></Select.Content></Select>',
  }),
  component({
    id: 'combobox', name: 'Combobox', category: 'Formulários',
    description: 'Campo de texto que filtra opções em tempo real, sem acento e sem diferenciar caixa.',
    variants: ['com valor customizado (allowCustomValue)', 'com estado vazio', 'com grupos'],
    parts: ['Root', 'Input', 'Trigger', 'Content', 'Item', 'ItemText', 'ItemIndicator', 'Empty', 'Group', 'Label'],
    origins: ['Few · novo padrão'],
    references: ['MUI Autocomplete', 'PrimeReact AutoComplete'],
    code: '<Combobox><Combobox.Input placeholder="Buscar…"/><Combobox.Content><Combobox.Item value="few">Few</Combobox.Item><Combobox.Empty>Nada encontrado</Combobox.Empty></Combobox.Content></Combobox>',
  }),
  component({
    id: 'multi-select', name: 'MultiSelect', category: 'Formulários',
    description: 'Seleção múltipla com chips removíveis, busca embutida e opção de selecionar tudo.',
    variants: ['com maxDisplay (chips + N)', 'com SelectAll', 'com busca vazia'],
    parts: ['Root', 'Trigger', 'Value', 'Content', 'Search', 'Item', 'ItemIndicator', 'Empty', 'SelectAll'],
    origins: ['Few · novo padrão'],
    references: ['PrimeReact MultiSelect', 'MUI Autocomplete multiple'],
    code: '<MultiSelect value={value} onValueChange={setValue}><MultiSelect.Trigger><MultiSelect.Value placeholder="Selecione…" maxDisplay={2}/></MultiSelect.Trigger><MultiSelect.Content><MultiSelect.Search/><MultiSelect.Item value="few">Few</MultiSelect.Item></MultiSelect.Content></MultiSelect>',
  }),
  component({
    id: 'calendar', name: 'Calendar', category: 'Formulários',
    description: 'Grade de dias navegável por teclado, com modos de data única, múltipla ou faixa.',
    variants: ['single', 'range', 'multiple', 'com min/max/disabledDates'],
    parts: ['Root', 'Header', 'PrevButton', 'NextButton', 'Heading', 'Grid', 'GridHead', 'HeadCell', 'GridBody', 'Row', 'Cell', 'Day'],
    origins: ['Few · novo padrão'],
    references: ['PrimeReact Calendar', 'MUI DateCalendar'],
    code: '<Calendar mode="single" value={date} onValueChange={setDate}><Calendar.Header><Calendar.PrevButton/><Calendar.Heading/><Calendar.NextButton/></Calendar.Header><Calendar.Grid><Calendar.GridHead/><Calendar.GridBody/></Calendar.Grid></Calendar>',
  }),
  component({
    id: 'date-picker', name: 'DatePicker', category: 'Formulários',
    description: 'Campo de data com digitação dd/mm/aaaa e um calendário no popover para escolher visualmente.',
    variants: ['single', 'range', 'com Clear', 'digitação inválida (data-invalid)'],
    parts: ['Root', 'Trigger', 'Input', 'Content', 'Clear'],
    origins: ['Few · novo padrão'],
    references: ['MUI DatePicker', 'Radix + react-day-picker (padrão de composição)'],
    code: '<DatePicker value={date} onValueChange={setDate}><DatePicker.Input placeholder="dd/mm/aaaa"/><DatePicker.Trigger/><DatePicker.Clear/><DatePicker.Content><Calendar mode="single" value={date} onValueChange={setDate}>…</Calendar></DatePicker.Content></DatePicker>',
  }),
];
