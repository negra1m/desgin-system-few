"use client";
import { useState } from 'react';
import { Select, Combobox, MultiSelect, Calendar, DatePicker } from '@fewcompany/ui';
import type { DemoMap } from './types';

const PAISES = [
  { value: 'br', label: 'Brasil' },
  { value: 'pt', label: 'Portugal' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'jp', label: 'Japão' },
];

function SelectDemo() {
  const [value, setValue] = useState('br');
  return (
    <div className="demo-stack demo-narrow">
      <Select value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="Selecione um país" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Content>
          <Select.Viewport>
            <Select.Label>América</Select.Label>
            {PAISES.slice(0, 2).map(pais => (
              <Select.Item key={pais.value} value={pais.value}>
                <Select.ItemText>{pais.label}</Select.ItemText>
                <Select.ItemIndicator>✓</Select.ItemIndicator>
              </Select.Item>
            ))}
            <Select.Separator />
            <Select.Label>Europa e Ásia</Select.Label>
            {PAISES.slice(2).map(pais => (
              <Select.Item key={pais.value} value={pais.value}>
                <Select.ItemText>{pais.label}</Select.ItemText>
                <Select.ItemIndicator>✓</Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select>
      <p className="few-muted" role="status">Selecionado: {PAISES.find(pais => pais.value === value)?.label ?? 'nenhum'}</p>
    </div>
  );
}

const NOMES = ['Ana', 'Bruno', 'Camila', 'Diego', 'Eduarda', 'Felipe', 'Giovana'];

function ComboboxDemo() {
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState('');
  return (
    <div className="demo-stack demo-narrow">
      <Combobox value={value} onValueChange={setValue} inputValue={inputValue} onInputValueChange={setInputValue}>
        <Combobox.Input placeholder="Buscar nome…" />
        <Combobox.Content>
          {NOMES.map(nome => (
            <Combobox.Item key={nome} value={nome}>
              <Combobox.ItemText>{nome}</Combobox.ItemText>
              <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
            </Combobox.Item>
          ))}
          <Combobox.Empty>Nenhum nome encontrado</Combobox.Empty>
        </Combobox.Content>
      </Combobox>
      <p className="few-muted" role="status">Escolhido: {value || 'nenhum'}</p>
    </div>
  );
}

const AREAS = ['Design', 'Front-end', 'Back-end', 'DevOps', 'Produto', 'Dados'];

function MultiSelectDemo() {
  const [value, setValue] = useState<string[]>(['Design', 'Front-end']);
  return (
    <div className="demo-stack demo-narrow">
      <MultiSelect value={value} onValueChange={setValue}>
        <MultiSelect.Trigger>
          <MultiSelect.Value placeholder="Selecione áreas" maxDisplay={2} />
        </MultiSelect.Trigger>
        <MultiSelect.Content>
          <MultiSelect.Search placeholder="Buscar área…" />
          <MultiSelect.SelectAll />
          {AREAS.map(area => (
            <MultiSelect.Item key={area} value={area}>
              <MultiSelect.ItemIndicator>✓</MultiSelect.ItemIndicator>
              {area}
            </MultiSelect.Item>
          ))}
          <MultiSelect.Empty>Nenhuma área encontrada</MultiSelect.Empty>
        </MultiSelect.Content>
      </MultiSelect>
      <p className="few-muted" role="status">{value.length} área(s) selecionada(s)</p>
    </div>
  );
}

function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className="demo-stack demo-narrow">
      <Calendar mode="single" value={date} onValueChange={(next) => setDate(next as Date)}>
        <Calendar.Header>
          <Calendar.PrevButton />
          <Calendar.Heading />
          <Calendar.NextButton />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHead />
          <Calendar.GridBody />
        </Calendar.Grid>
      </Calendar>
      <p className="few-muted" role="status">Data escolhida: {date ? date.toLocaleDateString('pt-BR') : 'nenhuma'}</p>
    </div>
  );
}

function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <div className="demo-stack demo-narrow">
      <DatePicker mode="single" value={date} onValueChange={(next) => setDate(next as Date | undefined)}>
        <DatePicker.Input placeholder="dd/mm/aaaa" />
        <DatePicker.Trigger />
        <DatePicker.Clear />
        <DatePicker.Content>
          <Calendar mode="single" value={date} onValueChange={(next) => setDate(next as Date)}>
            <Calendar.Header>
              <Calendar.PrevButton />
              <Calendar.Heading />
              <Calendar.NextButton />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHead />
              <Calendar.GridBody />
            </Calendar.Grid>
          </Calendar>
        </DatePicker.Content>
      </DatePicker>
      <p className="few-muted" role="status">Data: {date ? date.toLocaleDateString('pt-BR') : 'nenhuma'}</p>
    </div>
  );
}

// Demos da categoria "Formulários". Chave = id do registry. Cada demo é um componente React interativo.
export const pickersDemos: DemoMap = {
  select: SelectDemo,
  combobox: ComboboxDemo,
  'multi-select': MultiSelectDemo,
  calendar: CalendarDemo,
  'date-picker': DatePickerDemo,
};
