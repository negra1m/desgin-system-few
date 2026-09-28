// Hosts de demonstração/teste da categoria "Overlays" (pasta components/overlays). Um @Component por id do
// registry, selector few-demo-<id>.
import { Component, inject, type Type } from '@angular/core';
import { FewButton } from '../components/actions/button.js';
import { FEW_DIALOG } from '../components/overlays/dialog.js';
import { FEW_ALERT_DIALOG } from '../components/overlays/alert-dialog.js';
import { FEW_DRAWER } from '../components/overlays/drawer.js';
import { FEW_POPOVER } from '../components/overlays/popover.js';
import { FEW_TOOLTIP } from '../components/overlays/tooltip.js';
import { FEW_DROPDOWN_MENU } from '../components/overlays/dropdown-menu.js';
import { FEW_CONTEXT_MENU } from '../components/overlays/context-menu.js';
import { FEW_MENUBAR } from '../components/overlays/menubar.js';
import { FEW_MENU_PARTS } from '../components/overlays/menu-core.js';
import { FEW_TOAST, FewToastService } from '../components/overlays/toast.js';

@Component({
  selector: 'few-demo-dialog',
  imports: [FewButton, FEW_DIALOG],
  template: `
    <div fewDialog>
      <button fewDialogTrigger fewButton>Editar perfil</button>
      <dialog fewDialogContent>
        <h2 fewDialogTitle>Editar perfil</h2>
        <p fewDialogDescription>Atualize seus dados. As mudanças são salvas automaticamente.</p>
        <button fewDialogClose fewButton>Fechar</button>
      </dialog>
    </div>
  `,
})
export class DemoDialog {}

@Component({
  selector: 'few-demo-alert-dialog',
  imports: [FewButton, FEW_ALERT_DIALOG],
  template: `
    <div fewAlertDialog>
      <button fewAlertDialogTrigger fewButton>Excluir conta</button>
      <dialog fewAlertDialogContent>
        <h2 fewAlertDialogTitle>Tem certeza?</h2>
        <p fewAlertDialogDescription>Essa ação não pode ser desfeita.</p>
        <button fewAlertDialogCancel fewButton>Cancelar</button>
        <button fewAlertDialogAction fewButton>Excluir</button>
      </dialog>
    </div>
  `,
})
export class DemoAlertDialog {}

@Component({
  selector: 'few-demo-drawer',
  imports: [FewButton, FEW_DRAWER],
  template: `
    <div fewDrawer side="right">
      <button fewDrawerTrigger fewButton>Abrir menu</button>
      <dialog fewDrawerContent>
        <div fewDrawerHandle></div>
        <h2 fewDrawerTitle>Navegação</h2>
        <p fewDrawerDescription>Acesse as seções do painel.</p>
        <button fewDrawerClose fewButton>Fechar</button>
      </dialog>
    </div>
  `,
})
export class DemoDrawer {}

@Component({
  selector: 'few-demo-popover',
  imports: [FewButton, FEW_POPOVER],
  template: `
    <div fewPopover>
      <button fewPopoverTrigger fewButton>Mais informações</button>
      <div fewPopoverContent>
        <span fewPopoverArrow></span>
        <p class="few-muted">Conteúdo adicional sobre este item.</p>
        <button fewPopoverClose fewButton>Fechar</button>
      </div>
    </div>
  `,
})
export class DemoPopover {}

@Component({
  selector: 'few-demo-tooltip',
  imports: [FewButton, FEW_TOOLTIP],
  template: `
    <div fewTooltipProvider>
      <div fewTooltip>
        <button fewTooltipTrigger fewButton>Ajuda</button>
        <div fewTooltipContent>
          <span fewTooltipArrow></span>
          Mostra informações extras.
        </div>
      </div>
    </div>
  `,
})
export class DemoTooltip {}

@Component({
  selector: 'few-demo-dropdown-menu',
  imports: [FewButton, FEW_DROPDOWN_MENU],
  template: `
    <div fewDropdownMenu>
      <button fewDropdownMenuTrigger fewButton>Opções</button>
      <div fewDropdownMenuContent>
        <div fewMenuLabel>Conta</div>
        <div fewMenuItem>Perfil</div>
        <div fewMenuItem>Configurações</div>
        <div fewMenuSeparator></div>
        <div fewMenuCheckboxItem [checked]="true">
          <span fewMenuItemIndicator>✓</span>
          Notificações
        </div>
        <div fewMenuRadioGroup value="claro">
          <div fewMenuRadioItem value="claro">
            <span fewMenuItemIndicator>•</span>
            Tema claro
          </div>
          <div fewMenuRadioItem value="escuro">
            <span fewMenuItemIndicator>•</span>
            Tema escuro
          </div>
        </div>
        <div fewMenuItem>
          Sair
          <kbd fewMenuShortcut>Ctrl+Q</kbd>
        </div>
      </div>
    </div>
  `,
})
export class DemoDropdownMenu {}

@Component({
  selector: 'few-demo-context-menu',
  imports: [FewButton, FEW_CONTEXT_MENU, FEW_MENU_PARTS],
  template: `
    <div fewContextMenu>
      <div fewContextMenuTrigger class="few-muted" style="border:1px dashed currentColor;padding:2rem;text-align:center;">
        Clique com o botão direito aqui
      </div>
      <div fewContextMenuContent>
        <div fewMenuItem>Copiar</div>
        <div fewMenuItem>Colar</div>
        <div fewMenuSeparator></div>
        <div fewMenuItem>Excluir</div>
      </div>
    </div>
  `,
})
export class DemoContextMenu {}

@Component({
  selector: 'few-demo-menubar',
  imports: [FewButton, FEW_MENUBAR, FEW_MENU_PARTS],
  template: `
    <div fewMenubar>
      <div fewMenubarMenu value="arquivo">
        <button fewMenubarTrigger>Arquivo</button>
        <div fewMenubarContent>
          <div fewMenuItem>Novo</div>
          <div fewMenuItem>Abrir</div>
        </div>
      </div>
      <div fewMenubarMenu value="editar">
        <button fewMenubarTrigger>Editar</button>
        <div fewMenubarContent>
          <div fewMenuItem>Copiar</div>
          <div fewMenuItem>Colar</div>
        </div>
      </div>
    </div>
  `,
})
export class DemoMenubar {}

@Component({
  selector: 'few-demo-toast',
  imports: [FewButton, FEW_TOAST],
  template: `
    <div>
      <button fewButton (click)="notify()">Notificar</button>
      <div fewToastViewport position="bottom-right"></div>
    </div>
  `,
})
export class DemoToast {
  private readonly toastService = inject(FewToastService);
  protected notify(): void {
    this.toastService.toast({ title: 'Salvo', description: 'Suas alterações foram salvas.', tone: 'success' });
  }
}

export const OVERLAYS_DEMOS: Record<string, Type<unknown>> = {
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
