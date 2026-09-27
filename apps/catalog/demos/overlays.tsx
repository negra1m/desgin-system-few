"use client";
import { useState } from 'react';
import {
  Button, Dialog, AlertDialog, Drawer, type DrawerSide, Popover, Tooltip, DropdownMenu, ContextMenu, Menubar, Toast, useToast,
} from '@fewcompany/ui';
import type { DemoMap } from './types';
// Demos da categoria "Overlays". Chave = id do registry. Cada demo é um componente React interativo.

function DialogDemo() {
  return (
    <div className="demo-stack">
      <Dialog>
        <Dialog.Trigger asChild>
          <Button>Abrir diálogo</Button>
        </Dialog.Trigger>
        <Dialog.Content size="md">
          <Dialog.Title>Editar perfil</Dialog.Title>
          <Dialog.Description>Esc fecha o diálogo e o foco volta para o botão que abriu.</Dialog.Description>
          <div className="demo-row">
            <Dialog.Close asChild><Button variant="secondary">Cancelar</Button></Dialog.Close>
            <Dialog.Close asChild><Button>Salvar</Button></Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}

function AlertDialogDemo() {
  const [status, setStatus] = useState('Nenhuma conta excluída ainda.');
  return (
    <div className="demo-stack">
      <AlertDialog>
        <AlertDialog.Trigger asChild><Button variant="danger">Excluir conta</Button></AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Title>Excluir conta?</AlertDialog.Title>
          <AlertDialog.Description>Essa ação não pode ser desfeita. Clicar fora não fecha — só Cancelar, Excluir ou Esc.</AlertDialog.Description>
          <div className="demo-row">
            <AlertDialog.Cancel asChild><Button variant="secondary">Cancelar</Button></AlertDialog.Cancel>
            <AlertDialog.Action asChild><Button variant="danger" onClick={() => setStatus('Conta excluída.')}>Excluir</Button></AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog>
      <p className="few-muted" role="status">{status}</p>
    </div>
  );
}

function DrawerDemo() {
  const [side, setSide] = useState<DrawerSide>('right');
  return (
    <div className="demo-stack">
      <div className="demo-row">
        {(['left', 'right', 'top', 'bottom'] as const).map(option => (
          <Button key={option} size="sm" variant={side === option ? 'primary' : 'secondary'} onClick={() => setSide(option)}>{option}</Button>
        ))}
      </div>
      <Drawer side={side}>
        <Drawer.Trigger asChild><Button>Abrir gaveta</Button></Drawer.Trigger>
        <Drawer.Content>
          {side === 'bottom' && <Drawer.Handle />}
          <Drawer.Title>Filtros</Drawer.Title>
          <Drawer.Description>Gaveta modal ancorada em &quot;{side}&quot;.</Drawer.Description>
          <Drawer.Close asChild><Button variant="secondary">Fechar</Button></Drawer.Close>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}

function PopoverDemo() {
  return (
    <div className="demo-row">
      <Popover>
        <Popover.Trigger asChild><Button variant="secondary">Ajustes rápidos</Button></Popover.Trigger>
        <Popover.Content side="bottom" align="start">
          <Popover.Arrow />
          <p className="few-muted">Camada não modal — não bloqueia o resto da página.</p>
          <Popover.Close asChild><Button size="sm" variant="ghost">Fechar</Button></Popover.Close>
        </Popover.Content>
      </Popover>
    </div>
  );
}

function TooltipDemo() {
  return (
    <Tooltip.Provider delayDuration={400}>
      <div className="demo-row">
        <Tooltip>
          <Tooltip.Trigger asChild><Button variant="ghost">Negrito</Button></Tooltip.Trigger>
          <Tooltip.Content>Aplicar negrito<Tooltip.Arrow /></Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger asChild><Button variant="ghost">Itálico</Button></Tooltip.Trigger>
          <Tooltip.Content>Aplicar itálico<Tooltip.Arrow /></Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger asChild disabled><Button variant="ghost" disabled>Indisponível</Button></Tooltip.Trigger>
          <Tooltip.Content>Não abre — trigger desabilitado<Tooltip.Arrow /></Tooltip.Content>
        </Tooltip>
      </div>
    </Tooltip.Provider>
  );
}

function DropdownMenuDemo() {
  const [autoSave, setAutoSave] = useState(true);
  const [theme, setTheme] = useState('few');
  return (
    <div className="demo-row">
      <DropdownMenu>
        <DropdownMenu.Trigger asChild><Button variant="secondary">Ações</Button></DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Arquivo</DropdownMenu.Label>
          <DropdownMenu.Item>Editar<DropdownMenu.Shortcut>Ctrl+E</DropdownMenu.Shortcut></DropdownMenu.Item>
          <DropdownMenu.Item disabled>Duplicar</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.CheckboxItem checked={autoSave} onCheckedChange={setAutoSave}>
            <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>Salvar automaticamente
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.Separator />
          <DropdownMenu.Label>Tema</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenu.RadioItem value="few"><DropdownMenu.ItemIndicator>●</DropdownMenu.ItemIndicator>Few</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="ifight"><DropdownMenu.ItemIndicator>●</DropdownMenu.ItemIndicator>iFIGHT</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
      <p className="few-muted" role="status">Tema selecionado: {theme} · salvar automático: {autoSave ? 'ligado' : 'desligado'}</p>
    </div>
  );
}

function ContextMenuDemo() {
  const [message, setMessage] = useState('Clique com o botão direito na área abaixo.');
  return (
    <div className="demo-stack">
      <ContextMenu>
        <ContextMenu.Trigger style={{ border: '1px dashed var(--few-line)', borderRadius: 'var(--few-radius)', padding: 24, textAlign: 'center', color: 'var(--few-muted)' }}>
          Área de teste (botão direito)
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={() => setMessage('Copiado.')}>Copiar</ContextMenu.Item>
          <ContextMenu.Item onSelect={() => setMessage('Colado.')}>Colar</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item disabled>Renomear (em breve)</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <p className="few-muted" role="status">{message}</p>
    </div>
  );
}

function MenubarDemo() {
  const [message, setMessage] = useState('Nenhuma ação executada ainda.');
  return (
    <div className="demo-stack">
      <Menubar>
        <Menubar.Menu value="file">
          <Menubar.Trigger>Arquivo</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item onSelect={() => setMessage('Novo arquivo criado.')}>Novo</Menubar.Item>
            <Menubar.Item onSelect={() => setMessage('Arquivo salvo.')}>Salvar</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
        <Menubar.Menu value="edit">
          <Menubar.Trigger>Editar</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item onSelect={() => setMessage('Ação desfeita.')}>Desfazer</Menubar.Item>
            <Menubar.Item onSelect={() => setMessage('Ação refeita.')}>Refazer</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
      </Menubar>
      <p className="few-muted" role="status">{message}</p>
    </div>
  );
}

function ToastTriggers() {
  const { toast } = useToast();
  return (
    <div className="demo-row">
      <Button onClick={() => toast({ title: 'Salvo', description: 'Alterações salvas com sucesso.', tone: 'success' })}>Sucesso</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Atenção', description: 'Confira os campos antes de continuar.', tone: 'warning' })}>Aviso</Button>
      <Button variant="danger" onClick={() => toast({ title: 'Erro ao salvar', description: 'Tente novamente em instantes.', tone: 'danger' })}>Erro</Button>
    </div>
  );
}
function ToastDemo() {
  return (
    <Toast.Provider duration={4000}>
      <div className="demo-stack">
        <ToastTriggers />
        <p className="few-muted">Passe o mouse ou foque um toast para pausar o fechamento automático.</p>
      </div>
      <Toast.Viewport position="bottom-right" />
    </Toast.Provider>
  );
}

export const overlaysDemos: DemoMap = {
  dialog: DialogDemo,
  'alert-dialog': AlertDialogDemo,
  drawer: DrawerDemo,
  popover: PopoverDemo,
  tooltip: TooltipDemo,
  'dropdown-menu': DropdownMenuDemo,
  'context-menu': ContextMenuDemo,
  menubar: MenubarDemo,
  toast: ToastDemo,
};
