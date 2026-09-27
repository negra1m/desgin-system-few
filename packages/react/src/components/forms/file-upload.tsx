"use client";
import { useRef, useState, type ComponentProps, type DragEvent, type RefObject } from 'react';
import { formatFileSize, validateFile } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface FileUploadContextValue {
  files: File[]; setFiles: (files: File[]) => void; addFiles: (list: FileList | File[]) => void;
  accept?: string; multiple?: boolean; maxSize?: number; disabled?: boolean;
  dragging: boolean; setDragging: (dragging: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}
const [FileUploadProvider, useFileUpload] = createContext<FileUploadContextValue>('FileUpload');

export interface FileUploadProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  asChild?: boolean;
  files?: File[]; defaultFiles?: File[]; onFilesChange?: (files: File[]) => void;
  accept?: string; multiple?: boolean; maxSize?: number; disabled?: boolean;
  /** Chamado para cada arquivo rejeitado por tipo ou tamanho (accept/maxSize). */
  onFileError?: (file: File, message: string) => void;
}
function FileUploadRoot({ asChild, files, defaultFiles = [], onFilesChange, accept, multiple = true, maxSize, disabled, onFileError, className, ...props }: FileUploadProps) {
  const [current, setCurrent] = useControllableState<File[]>({ value: files, defaultValue: defaultFiles, onChange: onFilesChange });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  function addFiles(list: FileList | File[]) {
    if (disabled) return;
    const incoming = Array.from(list);
    const accepted: File[] = [];
    for (const file of incoming) {
      const error = validateFile(file, { accept, maxSize });
      if (error) onFileError?.(file, error); else accepted.push(file);
    }
    setCurrent(multiple ? [...current, ...accepted] : accepted.slice(0, 1));
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <FileUploadProvider value={{ files: current, setFiles: setCurrent, addFiles, accept, multiple, maxSize, disabled, dragging, setDragging, inputRef }}>
      <Comp {...props} data-disabled={dataAttr(disabled)} className={cx('few-file-upload', className)} />
    </FileUploadProvider>
  );
}

export interface FileUploadDropzoneProps extends ComponentProps<'div'> { asChild?: boolean }
function FileUploadDropzone({ asChild, className, onDragOver, onDragLeave, onDrop, ...props }: FileUploadDropzoneProps) {
  const { addFiles, disabled, dragging, setDragging } = useFileUpload('FileUpload.Dropzone');
  function handleDragOver(event: DragEvent<HTMLDivElement>) { onDragOver?.(event); if (disabled) return; event.preventDefault(); setDragging(true); }
  function handleDragLeave(event: DragEvent<HTMLDivElement>) { onDragLeave?.(event); setDragging(false); }
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    onDrop?.(event);
    if (disabled) return;
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp {...props} data-dragging={dataAttr(dragging)} data-disabled={dataAttr(disabled)} className={cx('few-file-upload-dropzone', className)}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} />
  );
}

export interface FileUploadTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function FileUploadTrigger({ asChild, className, onClick, ...props }: FileUploadTriggerProps) {
  const { inputRef, disabled } = useFileUpload('FileUpload.Trigger');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} type="button" disabled={disabled} className={cx('few-file-upload-trigger', className)}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) inputRef.current?.click(); }} />
  );
}

export interface FileUploadHiddenInputProps extends Omit<ComponentProps<'input'>, 'type' | 'onChange'> {}
function FileUploadHiddenInput({ className, ...props }: FileUploadHiddenInputProps) {
  const { inputRef, accept, multiple, disabled, addFiles } = useFileUpload('FileUpload.HiddenInput');
  return (
    <input
      {...props}
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      className={cx('few-sr-only', className)}
      onChange={(event) => { if (event.currentTarget.files) addFiles(event.currentTarget.files); event.currentTarget.value = ''; }}
    />
  );
}

export interface FileUploadListProps extends ComponentProps<'ul'> { asChild?: boolean }
function FileUploadList({ asChild, className, ...props }: FileUploadListProps) {
  const Comp = asChild ? Slot : 'ul';
  return <Comp {...props} className={cx('few-file-upload-list', className)} />;
}

interface FileItemContextValue { file: File; index: number }
const [FileItemProvider, useFileItem] = createContext<FileItemContextValue>('FileUpload.Item');

export interface FileUploadItemProps extends ComponentProps<'li'> { asChild?: boolean; index: number }
function FileUploadItem({ asChild, index, className, ...props }: FileUploadItemProps) {
  const { files } = useFileUpload('FileUpload.Item');
  const file = files[index];
  if (!file) return null;
  const Comp = asChild ? Slot : 'li';
  return (
    <FileItemProvider value={{ file, index }}>
      <Comp {...props} className={cx('few-file-upload-item', className)} />
    </FileItemProvider>
  );
}

export interface FileUploadItemNameProps extends ComponentProps<'span'> { asChild?: boolean }
function FileUploadItemName({ asChild, className, children, ...props }: FileUploadItemNameProps) {
  const { file } = useFileItem('FileUpload.ItemName');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-file-upload-item-name', className)}>{children ?? file.name}</Comp>;
}

export interface FileUploadItemSizeProps extends ComponentProps<'span'> { asChild?: boolean }
function FileUploadItemSize({ asChild, className, children, ...props }: FileUploadItemSizeProps) {
  const { file } = useFileItem('FileUpload.ItemSize');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-file-upload-item-size', 'few-muted', className)}>{children ?? formatFileSize(file.size)}</Comp>;
}

export interface FileUploadItemDeleteProps extends ComponentProps<'button'> { asChild?: boolean }
function FileUploadItemDelete({ asChild, className, onClick, children, ...props }: FileUploadItemDeleteProps) {
  const { index, file } = useFileItem('FileUpload.ItemDelete');
  const { files, setFiles } = useFileUpload('FileUpload.ItemDelete');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} type="button" aria-label={props['aria-label'] ?? `Remover ${file.name}`} className={cx('few-file-upload-item-delete', className)}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setFiles(files.filter((_, i) => i !== index)); }}>
      {children ?? '×'}
    </Comp>
  );
}

/** FileUpload composto: Root > Dropzone(Trigger, HiddenInput) + List(Item(ItemName, ItemSize, ItemDelete)). */
export const FileUpload = Object.assign(FileUploadRoot, {
  Root: FileUploadRoot, Dropzone: FileUploadDropzone, Trigger: FileUploadTrigger, HiddenInput: FileUploadHiddenInput,
  List: FileUploadList, Item: FileUploadItem, ItemName: FileUploadItemName, ItemSize: FileUploadItemSize, ItemDelete: FileUploadItemDelete,
});
export { FileUploadRoot, FileUploadDropzone, FileUploadTrigger, FileUploadHiddenInput, FileUploadList, FileUploadItem, FileUploadItemName, FileUploadItemSize, FileUploadItemDelete };
