// FileUpload (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/file-upload.tsx.
// Adaptação documentada: o input real (`fewFileUploadHiddenInput`) se registra no Root (`registerInput`) em vez
// de o Root guardar uma ref — equivalente ao `inputRef` do React, só que escrito de dentro para fora.
import { Component, Directive, ElementRef, booleanAttribute, computed, inject, input, model, output, signal } from '@angular/core';
import { formatFileSize, validateFile } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

export interface FewFileError { file: File; message: string }

/** Raiz: `<div fewFileUpload [(files)]="files" accept="image/*" (fileError)="onError($event)">…</div>`. */
@Directive({
  selector: '[fewFileUpload]',
  exportAs: 'fewFileUpload',
  host: { class: 'few-file-upload', '[attr.data-disabled]': 'dataAttr(disabled())' },
})
export class FewFileUpload {
  readonly files = model<File[]>([]);
  readonly accept = input<string>();
  readonly multiple = input(true, { transform: booleanAttribute });
  readonly maxSize = input<number>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly fileError = output<FewFileError>();
  /** Estado interno (não é prop no React): plain signal, igual ao `count` do Carousel. */
  readonly dragging = signal(false);
  protected readonly dataAttr = dataAttr;
  private inputEl: HTMLInputElement | null = null;

  registerInput(el: HTMLInputElement) { this.inputEl = el; }
  openPicker() { this.inputEl?.click(); }
  addFiles(list: FileList | File[]) {
    if (this.disabled()) return;
    const incoming = Array.from(list);
    const accepted: File[] = [];
    for (const file of incoming) {
      const error = validateFile(file, { accept: this.accept(), maxSize: this.maxSize() });
      if (error) this.fileError.emit({ file, message: error });
      else accepted.push(file);
    }
    this.files.set(this.multiple() ? [...this.files(), ...accepted] : accepted.slice(0, 1));
  }
}

@Directive({
  selector: '[fewFileUploadDropzone]',
  host: {
    class: 'few-file-upload-dropzone',
    '[attr.data-dragging]': 'dataAttr(upload.dragging())',
    '[attr.data-disabled]': 'dataAttr(upload.disabled())',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave()',
    '(drop)': 'onDrop($event)',
  },
})
export class FewFileUploadDropzone {
  protected readonly upload = inject(FewFileUpload);
  protected readonly dataAttr = dataAttr;
  protected onDragOver(event: DragEvent) { if (this.upload.disabled()) return; event.preventDefault(); this.upload.dragging.set(true); }
  protected onDragLeave() { this.upload.dragging.set(false); }
  protected onDrop(event: DragEvent) {
    if (this.upload.disabled()) return;
    event.preventDefault();
    this.upload.dragging.set(false);
    if (event.dataTransfer) this.upload.addFiles(event.dataTransfer.files);
  }
}

@Directive({ selector: 'button[fewFileUploadTrigger]', host: { class: 'few-file-upload-trigger', type: 'button', '[disabled]': 'upload.disabled()', '(click)': 'upload.openPicker()' } })
export class FewFileUploadTrigger {
  protected readonly upload = inject(FewFileUpload);
}

@Directive({
  selector: 'input[fewFileUploadHiddenInput]',
  host: {
    class: 'few-sr-only', type: 'file',
    '[attr.accept]': 'upload.accept() ?? null',
    '[multiple]': 'upload.multiple()',
    '[disabled]': 'upload.disabled()',
    '(change)': 'onChange($event)',
  },
})
export class FewFileUploadHiddenInput {
  protected readonly upload = inject(FewFileUpload);
  private readonly hostEl = inject<ElementRef<HTMLInputElement>>(ElementRef);
  constructor() { this.upload.registerInput(this.hostEl.nativeElement); }
  protected onChange(event: Event) {
    const el = event.target as HTMLInputElement;
    if (el.files) this.upload.addFiles(el.files);
    el.value = '';
  }
}

@Directive({ selector: '[fewFileUploadList]', host: { class: 'few-file-upload-list' } })
export class FewFileUploadList {}

/** `<li fewFileUploadItem [index]="i">…</li>`: distribui o `File` correspondente para ItemName/ItemSize/ItemDelete. */
@Directive({ selector: '[fewFileUploadItem]', exportAs: 'fewFileUploadItem', host: { class: 'few-file-upload-item' } })
export class FewFileUploadItem {
  private readonly upload = inject(FewFileUpload);
  readonly index = input.required<number>();
  readonly file = computed<File | undefined>(() => this.upload.files()[this.index()]);
}

@Component({ selector: 'span[fewFileUploadItemName]', host: { class: 'few-file-upload-item-name' }, template: `<ng-content>{{ item.file()?.name }}</ng-content>` })
export class FewFileUploadItemName {
  protected readonly item = inject(FewFileUploadItem);
}

@Component({ selector: 'span[fewFileUploadItemSize]', host: { class: 'few-file-upload-item-size few-muted' }, template: `<ng-content>{{ sizeText() }}</ng-content>` })
export class FewFileUploadItemSize {
  private readonly item = inject(FewFileUploadItem);
  protected readonly sizeText = computed(() => { const file = this.item.file(); return file ? formatFileSize(file.size) : ''; });
}

// Adaptação documentada: aria-label fixo ("Remover <nome>"), sem override via props.
@Component({
  selector: 'button[fewFileUploadItemDelete]',
  host: { class: 'few-file-upload-item-delete', type: 'button', '[attr.aria-label]': 'ariaLabel', '(click)': 'onClick()' },
  template: `<ng-content>&times;</ng-content>`,
})
export class FewFileUploadItemDelete {
  private readonly upload = inject(FewFileUpload);
  private readonly item = inject(FewFileUploadItem);
  protected get ariaLabel() { return `Remover ${this.item.file()?.name ?? ''}`; }
  protected onClick() {
    const index = this.item.index();
    this.upload.files.set(this.upload.files().filter((_, i) => i !== index));
  }
}

/** Importe tudo de uma vez: `imports: [FEW_FILE_UPLOAD]`. */
export const FEW_FILE_UPLOAD = [
  FewFileUpload, FewFileUploadDropzone, FewFileUploadTrigger, FewFileUploadHiddenInput,
  FewFileUploadList, FewFileUploadItem, FewFileUploadItemName, FewFileUploadItemSize, FewFileUploadItemDelete,
] as const;
