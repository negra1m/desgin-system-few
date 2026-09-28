// Hosts de demonstração/teste da categoria "Formulários" (pasta components/pickers). Um @Component por id do registry, selector few-demo-<id>.
import { Component, computed, signal, type Type } from '@angular/core';
import { FEW_SELECT } from '../components/pickers/select.js';
import { FEW_COMBOBOX } from '../components/pickers/combobox.js';
import { FEW_MULTI_SELECT } from '../components/pickers/multi-select.js';
import { FEW_CALENDAR } from '../components/pickers/calendar.js';
import { FEW_DATE_PICKER } from '../components/pickers/date-picker.js';

const PAISES = [
  { value: 'br', label: 'Brasil' },
  { value: 'pt', label: 'Portugal' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'jp', label: 'Japão' },
];

@Component({
  selector: 'few-demo-select',
  imports: [FEW_SELECT],
  template: `
    <div class="demo-stack demo-narrow">
      <div fewSelect [(value)]="value">
        <button fewSelectTrigger>
          <span fewSelectValue placeholder="Selecione um país"></span>
          <span fewSelectIcon></span>
        </button>
        <div fewSelectContent>
          <div fewSelectViewport>
            <div fewSelectLabel>América</div>
            @for (pais of paisesAmerica; track pais.value) {
              <div fewSelectItem [value]="pais.value">
                <span fewSelectItemText>{{ pais.label }}</span>
                <span fewSelectItemIndicator>✓</span>
              </div>
            }
            <div fewSelectSeparator></div>
            <div fewSelectLabel>Europa e Ásia</div>
            @for (pais of paisesResto; track pais.value) {
              <div fewSelectItem [value]="pais.value">
                <span fewSelectItemText>{{ pais.label }}</span>
                <span fewSelectItemIndicator>✓</span>
              </div>
            }
          </div>
        </div>
      </div>
      <p class="few-muted" role="status">Selecionado: {{ selectedLabel() }}</p>
    </div>
  `,
})
export class DemoSelect {
  protected readonly paisesAmerica = PAISES.slice(0, 2);
  protected readonly paisesResto = PAISES.slice(2);
  protected readonly value = signal('br');
  protected readonly selectedLabel = computed(() => PAISES.find(pais => pais.value === this.value())?.label ?? 'nenhum');
}

const NOMES = ['Ana', 'Bruno', 'Camila', 'Diego', 'Eduarda', 'Felipe', 'Giovana'];

@Component({
  selector: 'few-demo-combobox',
  imports: [FEW_COMBOBOX],
  template: `
    <div class="demo-stack demo-narrow">
      <div fewCombobox [(value)]="value" [(inputValue)]="inputValue">
        <input fewComboboxInput placeholder="Buscar nome…" />
        <div fewComboboxContent>
          @for (nome of nomes; track nome) {
            <div fewComboboxItem [value]="nome">
              <span fewComboboxItemText>{{ nome }}</span>
              <span fewComboboxItemIndicator>✓</span>
            </div>
          }
          <div fewComboboxEmpty>Nenhum nome encontrado</div>
        </div>
      </div>
      <p class="few-muted" role="status">Escolhido: {{ value() || 'nenhum' }}</p>
    </div>
  `,
})
export class DemoCombobox {
  protected readonly nomes = NOMES;
  protected readonly value = signal('');
  protected readonly inputValue = signal('');
}

const AREAS = ['Design', 'Front-end', 'Back-end', 'DevOps', 'Produto', 'Dados'];

@Component({
  selector: 'few-demo-multi-select',
  imports: [FEW_MULTI_SELECT],
  template: `
    <div class="demo-stack demo-narrow">
      <div fewMultiSelect [(value)]="value">
        <button fewMultiSelectTrigger>
          <div fewMultiSelectValue placeholder="Selecione áreas" [maxDisplay]="2"></div>
        </button>
        <div fewMultiSelectContent>
          <input fewMultiSelectSearch placeholder="Buscar área…" />
          <div fewMultiSelectSelectAll></div>
          @for (area of areas; track area) {
            <div fewMultiSelectItem [value]="area">
              <span fewMultiSelectItemIndicator>✓</span>{{ area }}
            </div>
          }
          <div fewMultiSelectEmpty>Nenhuma área encontrada</div>
        </div>
      </div>
      <p class="few-muted" role="status">{{ value().length }} área(s) selecionada(s)</p>
    </div>
  `,
})
export class DemoMultiSelect {
  protected readonly areas = AREAS;
  protected readonly value = signal<string[]>(['Design', 'Front-end']);
}

@Component({
  selector: 'few-demo-calendar',
  imports: [FEW_CALENDAR],
  template: `
    <div class="demo-stack demo-narrow">
      <div fewCalendar mode="single" [(value)]="date">
        <div fewCalendarHeader>
          <button fewCalendarPrevButton></button>
          <div fewCalendarHeading></div>
          <button fewCalendarNextButton></button>
        </div>
        <table fewCalendarGrid>
          <thead fewCalendarGridHead></thead>
          <tbody fewCalendarGridBody></tbody>
        </table>
      </div>
      <p class="few-muted" role="status">Data escolhida: {{ dateLabel() }}</p>
    </div>
  `,
})
export class DemoCalendar {
  protected readonly date = signal<Date | undefined>(new Date());
  protected readonly dateLabel = computed(() => { const d = this.date(); return d ? d.toLocaleDateString('pt-BR') : 'nenhuma'; });
}

@Component({
  selector: 'few-demo-date-picker',
  imports: [FEW_DATE_PICKER, FEW_CALENDAR],
  template: `
    <div class="demo-stack demo-narrow">
      <div fewDatePicker mode="single" [(value)]="date">
        <input fewDatePickerInput placeholder="dd/mm/aaaa" />
        <button fewDatePickerTrigger></button>
        <button fewDatePickerClear></button>
        <div fewDatePickerContent>
          <div fewCalendar mode="single" [(value)]="date">
            <div fewCalendarHeader>
              <button fewCalendarPrevButton></button>
              <div fewCalendarHeading></div>
              <button fewCalendarNextButton></button>
            </div>
            <table fewCalendarGrid>
              <thead fewCalendarGridHead></thead>
              <tbody fewCalendarGridBody></tbody>
            </table>
          </div>
        </div>
      </div>
      <p class="few-muted" role="status">Data: {{ dateLabel() }}</p>
    </div>
  `,
})
export class DemoDatePicker {
  protected readonly date = signal<Date | undefined>(undefined);
  protected readonly dateLabel = computed(() => { const d = this.date(); return d ? d.toLocaleDateString('pt-BR') : 'nenhuma'; });
}

export const PICKERS_DEMOS: Record<string, Type<unknown>> = {
  select: DemoSelect,
  combobox: DemoCombobox,
  'multi-select': DemoMultiSelect,
  calendar: DemoCalendar,
  'date-picker': DemoDatePicker,
};
