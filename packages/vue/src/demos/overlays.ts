// Demos/hosts de teste da categoria "Overlays" (pasta components/overlays). Um componente por id do registry.
// Botões usam <button class="few-button"> nativo (a categoria actions está sendo feita em paralelo) — quando
// o overlay já tem seu próprio Trigger/Item, o botão few-button entra via asChild para herdar aria/onClick.
import { defineComponent, h, type Component } from 'vue';
import {
  FewDialog, FewDialogTrigger, FewDialogContent, FewDialogTitle, FewDialogDescription, FewDialogClose,
} from '../components/overlays/dialog.js';
import {
  FewAlertDialog, FewAlertDialogTrigger, FewAlertDialogContent, FewAlertDialogTitle, FewAlertDialogDescription,
  FewAlertDialogCancel, FewAlertDialogAction,
} from '../components/overlays/alert-dialog.js';
import {
  FewDrawer, FewDrawerTrigger, FewDrawerContent, FewDrawerTitle, FewDrawerDescription, FewDrawerClose, FewDrawerHandle,
} from '../components/overlays/drawer.js';
import { FewPopover, FewPopoverTrigger, FewPopoverContent, FewPopoverClose, FewPopoverArrow } from '../components/overlays/popover.js';
import { FewTooltipProvider, FewTooltip, FewTooltipTrigger, FewTooltipContent, FewTooltipArrow } from '../components/overlays/tooltip.js';
import {
  FewDropdownMenu, FewDropdownMenuTrigger, FewDropdownMenuContent, FewDropdownMenuItem, FewDropdownMenuCheckboxItem,
  FewDropdownMenuRadioGroup, FewDropdownMenuRadioItem, FewDropdownMenuItemIndicator, FewDropdownMenuLabel,
  FewDropdownMenuSeparator, FewDropdownMenuShortcut,
} from '../components/overlays/dropdown-menu.js';
import { FewContextMenu, FewContextMenuTrigger, FewContextMenuContent, FewContextMenuItem, FewContextMenuSeparator } from '../components/overlays/context-menu.js';
import { FewMenubar, FewMenubarMenu, FewMenubarTrigger, FewMenubarContent, FewMenubarItem, FewMenubarSeparator } from '../components/overlays/menubar.js';
import { FewToastProvider, FewToastViewport, useToast } from '../components/overlays/toast.js';

function fewButton(label: string) { return h('button', { class: 'few-button', type: 'button' }, label); }

export const DemoDialog = defineComponent({
  name: 'DemoDialog',
  setup() {
    return () => h(FewDialog, { defaultOpen: true }, () => [
      h(FewDialogTrigger, { asChild: true }, () => fewButton('Abrir diálogo')),
      h(FewDialogContent, null, () => [
        h(FewDialogTitle, null, () => 'Confirmar exclusão'),
        h(FewDialogDescription, null, () => 'Esta ação não pode ser desfeita.'),
        h(FewDialogClose, { asChild: true }, () => fewButton('Fechar')),
      ]),
    ]);
  },
});

export const DemoAlertDialog = defineComponent({
  name: 'DemoAlertDialog',
  setup() {
    return () => h(FewAlertDialog, { defaultOpen: true }, () => [
      h(FewAlertDialogTrigger, { asChild: true }, () => fewButton('Excluir conta')),
      h(FewAlertDialogContent, null, () => [
        h(FewAlertDialogTitle, null, () => 'Excluir conta permanentemente?'),
        h(FewAlertDialogDescription, null, () => 'Todos os dados serão perdidos.'),
        h(FewAlertDialogCancel, { asChild: true }, () => fewButton('Cancelar')),
        h(FewAlertDialogAction, { asChild: true }, () => fewButton('Excluir')),
      ]),
    ]);
  },
});

export const DemoDrawer = defineComponent({
  name: 'DemoDrawer',
  setup() {
    return () => h(FewDrawer, { defaultOpen: true, side: 'right' }, () => [
      h(FewDrawerTrigger, { asChild: true }, () => fewButton('Abrir painel')),
      h(FewDrawerContent, { size: '360px' }, () => [
        h(FewDrawerHandle),
        h(FewDrawerTitle, null, () => 'Filtros'),
        h(FewDrawerDescription, null, () => 'Ajuste os filtros da listagem.'),
        h(FewDrawerClose, { asChild: true }, () => fewButton('Fechar')),
      ]),
    ]);
  },
});

export const DemoPopover = defineComponent({
  name: 'DemoPopover',
  setup() {
    return () => h(FewPopover, { defaultOpen: true }, () => [
      h(FewPopoverTrigger, { asChild: true }, () => fewButton('Compartilhar')),
      h(FewPopoverContent, null, () => [
        h(FewPopoverArrow),
        h('p', { class: 'few-muted' }, 'Copie o link para compartilhar este projeto.'),
        h(FewPopoverClose, { asChild: true }, () => fewButton('Fechar')),
      ]),
    ]);
  },
});

export const DemoTooltip = defineComponent({
  name: 'DemoTooltip',
  setup() {
    return () => h(FewTooltipProvider, null, () => h(FewTooltip, { defaultOpen: true }, () => [
      h(FewTooltipTrigger, { asChild: true }, () => fewButton('Salvar')),
      h(FewTooltipContent, null, () => [h(FewTooltipArrow), 'Salva as alterações (Ctrl+S)']),
    ]));
  },
});

export const DemoDropdownMenu = defineComponent({
  name: 'DemoDropdownMenu',
  setup() {
    return () => h(FewDropdownMenu, { defaultOpen: true }, () => [
      h(FewDropdownMenuTrigger, { asChild: true }, () => fewButton('Ações')),
      h(FewDropdownMenuContent, null, () => [
        h(FewDropdownMenuLabel, null, () => 'Conta'),
        h(FewDropdownMenuItem, null, () => 'Editar perfil'),
        h(FewDropdownMenuCheckboxItem, { defaultChecked: true }, () => [h(FewDropdownMenuItemIndicator, null, () => '✓'), 'Notificações']),
        h(FewDropdownMenuSeparator),
        h(FewDropdownMenuRadioGroup, { defaultValue: 'grid' }, () => [
          h(FewDropdownMenuRadioItem, { value: 'grid' }, () => [h(FewDropdownMenuItemIndicator, null, () => '•'), 'Grade']),
          h(FewDropdownMenuRadioItem, { value: 'list' }, () => [h(FewDropdownMenuItemIndicator, null, () => '•'), 'Lista']),
        ]),
        h(FewDropdownMenuSeparator),
        h(FewDropdownMenuItem, null, () => ['Excluir', h(FewDropdownMenuShortcut, null, () => '⌘⌫')]),
      ]),
    ]);
  },
});

export const DemoContextMenu = defineComponent({
  name: 'DemoContextMenu',
  setup() {
    return () => h(FewContextMenu, { defaultOpen: true }, () => [
      h(FewContextMenuTrigger, null, () => h('div', { class: 'few-muted' }, 'Clique com o botão direito nesta área.')),
      h(FewContextMenuContent, null, () => [
        h(FewContextMenuItem, null, () => 'Copiar'),
        h(FewContextMenuItem, null, () => 'Colar'),
        h(FewContextMenuSeparator),
        h(FewContextMenuItem, { disabled: true }, () => 'Desfazer'),
      ]),
    ]);
  },
});

export const DemoMenubar = defineComponent({
  name: 'DemoMenubar',
  setup() {
    return () => h(FewMenubar, { defaultValue: 'file' }, () => [
      h(FewMenubarMenu, { value: 'file' }, () => [
        h(FewMenubarTrigger, { asChild: true }, () => fewButton('Arquivo')),
        h(FewMenubarContent, null, () => [
          h(FewMenubarItem, null, () => 'Novo'),
          h(FewMenubarItem, null, () => 'Abrir'),
          h(FewMenubarSeparator),
          h(FewMenubarItem, null, () => 'Sair'),
        ]),
      ]),
      h(FewMenubarMenu, { value: 'edit' }, () => [
        h(FewMenubarTrigger, { asChild: true }, () => fewButton('Editar')),
        h(FewMenubarContent, null, () => [
          h(FewMenubarItem, null, () => 'Copiar'),
          h(FewMenubarItem, null, () => 'Colar'),
        ]),
      ]),
    ]);
  },
});

export const DemoToast = defineComponent({
  name: 'DemoToast',
  setup() {
    const { toast } = useToast();
    return () => h(FewToastProvider, { duration: 4000 }, () => [
      h('button', { class: 'few-button', type: 'button', onClick: () => toast({ title: 'Salvo', description: 'As alterações foram publicadas.', tone: 'success' }) }, 'Mostrar notificação'),
      h(FewToastViewport, { position: 'bottom-right' }),
    ]);
  },
});

export const OVERLAYS_DEMOS: Record<string, Component> = {
  dialog: DemoDialog,
  'alert-dialog': DemoAlertDialog,
  drawer: DemoDrawer,
  popover: DemoPopover,
  tooltip: DemoTooltip,
  'dropdown-menu': DemoDropdownMenu,
  'context-menu': DemoContextMenu,
  menubar: DemoMenubar,
  toast: DemoToast,
};
