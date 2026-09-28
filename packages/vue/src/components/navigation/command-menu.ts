// Paleta de comandos em <dialog> nativo. Ver command-menu.tsx no React. Lógica pura (commandScore/nextIndex/normalizeText) vem do core.
import { defineComponent, mergeProps, onMounted, onUnmounted, ref, watch, type PropType, type Ref } from 'vue';
import { commandScore, nextIndex, normalizeText } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface CommandContext {
  baseId: string;
  query: () => string; setQuery: (query: string) => void;
  activeId: () => string | null; setActiveId: (id: string | null) => void;
  listRef: Ref<HTMLElement | null>;
  empty: () => boolean;
}
const [provideCommand, useCommand] = createContext<CommandContext>('FewCommandMenu');

/** Raiz: `<FewCommandMenu v-model:open="open" shortcut>`. `shortcut` liga Ctrl/Cmd+K para abrir e fechar. */
export const FewCommandMenu = defineComponent({
  name: 'FewCommandMenu',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    shortcut: { type: Boolean, default: false },
    /** Rótulo acessível do diálogo. */
    label: { type: String, default: 'Comandos' },
  },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('command');
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, o => emit('update:open', o));
    const query = ref('');
    const activeId = ref<string | null>(null);
    const empty = ref(false);
    const dialogHost = ref<HTMLElement | null>(null);
    const listHost = ref<HTMLElement | null>(null);
    const previouslyFocused = ref<HTMLElement | null>(null);

    if (props.shortcut) {
      const onKeydown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(current => !current); }
      };
      onMounted(() => { if (typeof document !== 'undefined') document.addEventListener('keydown', onKeydown); });
      onUnmounted(() => { if (typeof document !== 'undefined') document.removeEventListener('keydown', onKeydown); });
    }

    watch(open, (isOpen) => {
      const dialog = dialogHost.value as HTMLDialogElement | null;
      if (isOpen) {
        query.value = '';
        activeId.value = null;
        if (typeof document !== 'undefined') previouslyFocused.value = document.activeElement as HTMLElement | null;
        if (dialog && !dialog.open) dialog.showModal();
      } else if (dialog?.open) {
        dialog.close();
        previouslyFocused.value?.focus();
      }
    }, { flush: 'post', immediate: true });

    watch([query, open], () => {
      const container = listHost.value;
      if (!container) return;
      const options = Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'));
      empty.value = options.length === 0;
      activeId.value = (activeId.value && options.some(option => option.id === activeId.value)) ? activeId.value : (options[0]?.id ?? null);
    }, { flush: 'post', immediate: true });

    function handleClose() { setOpen(false); }

    provideCommand({
      baseId, query: () => query.value, setQuery: q => { query.value = q; },
      activeId: () => activeId.value, setActiveId: id => { activeId.value = id; },
      listRef: listHost, empty: () => empty.value,
    });

    return () => renderPrimitive('dialog', props.asChild, mergeProps(attrs, {
      ref: dialogHost, 'aria-label': (attrs['aria-label'] as string | undefined) ?? props.label,
      class: 'few-command', onClose: handleClose,
    }), slots);
  },
});

export const FewCommandInput = defineComponent({
  name: 'FewCommandInput',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const command = useCommand('FewCommandInput');
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.key === 'Enter') { event.preventDefault(); (command.activeId() ? document.getElementById(command.activeId()!) : null)?.click(); return; }
      const options = Array.from(command.listRef.value?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
      if (!options.length) return;
      const current = command.activeId() ? options.findIndex(option => option.id === command.activeId()) : -1;
      const next = nextIndex(event.key, current < 0 ? 0 : current, options.length, { orientation: 'vertical', loop: false });
      if (next === null) return;
      event.preventDefault();
      const target = options[next];
      command.setActiveId(target.id);
      target.scrollIntoView({ block: 'nearest' });
    }
    function handleInput(event: Event) { command.setQuery((event.target as HTMLInputElement).value); }
    return () => renderPrimitive('input', props.asChild, mergeProps(attrs, {
      type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': `${command.baseId}-list`, 'aria-autocomplete': 'list',
      'aria-activedescendant': command.activeId() ?? undefined, autocomplete: 'off', spellcheck: false,
      value: command.query(), class: 'few-command-input', onInput: handleInput, onKeydown: handleKeydown,
    }), slots);
  },
});

export const FewCommandList = defineComponent({
  name: 'FewCommandList',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const command = useCommand('FewCommandList');
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { ref: command.listRef, id: `${command.baseId}-list`, role: 'listbox', class: 'few-command-list' }), slots);
  },
});

export const FewCommandGroup = defineComponent({
  name: 'FewCommandGroup',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'group', class: 'few-command-group' }), slots);
  },
});

export const FewCommandGroupHeading = defineComponent({
  name: 'FewCommandGroupHeading',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-command-group-heading' }), slots);
  },
});

export const FewCommandItem = defineComponent({
  name: 'FewCommandItem',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** Texto pesquisável (sem acento) e identificador entregue ao emit `select`. */
    value: { type: String, required: true },
    keywords: { type: Array as PropType<string[]>, default: undefined },
    disabled: Boolean,
  },
  emits: { select: (value: string) => typeof value === 'string' },
  setup(props, { slots, attrs, emit }) {
    const command = useCommand('FewCommandItem');
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || props.disabled) return;
      emit('select', props.value);
    }
    return () => {
      const matches = commandScore(props.value, command.query(), props.keywords) !== null;
      if (!matches) return null;
      const id = (attrs['id'] as string | undefined) ?? `${command.baseId}-item-${normalizeText(props.value).replace(/\s+/g, '-')}`;
      const active = command.activeId() === id;
      function handleMouseenter() { if (!props.disabled) command.setActiveId(id); }
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        id, role: 'option', 'aria-selected': active, 'aria-disabled': props.disabled ? true : undefined,
        'data-disabled': dataAttr(props.disabled), 'data-state': active ? 'active' : undefined,
        class: 'few-command-item', onClick: handleClick, onMouseenter: handleMouseenter,
      }), slots);
    };
  },
});

export const FewCommandEmpty = defineComponent({
  name: 'FewCommandEmpty',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const command = useCommand('FewCommandEmpty');
    return () => {
      if (!command.empty()) return null;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'status', class: 'few-command-empty' }), slots, children => children.length ? children : ['Nada encontrado.']);
    };
  },
});

export const FewCommandSeparator = defineComponent({
  name: 'FewCommandSeparator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'separator', 'aria-orientation': 'horizontal', class: 'few-command-separator' }), slots);
  },
});

export const FewCommandShortcut = defineComponent({
  name: 'FewCommandShortcut',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('kbd', props.asChild, mergeProps(attrs, { class: 'few-command-shortcut' }), slots);
  },
});
