// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/file-upload.tsx
import { createTextVNode, defineComponent, h, mergeProps, ref, type PropType, type Ref } from 'vue';
import { formatFileSize, validateFile } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface FileUploadContextValue {
  files: () => File[]; setFiles: (files: File[]) => void; addFiles: (list: FileList | File[]) => void;
  accept: () => string | undefined; multiple: () => boolean; maxSize: () => number | undefined; disabled: () => boolean | undefined;
  dragging: () => boolean; setDragging: (dragging: boolean) => void; inputRef: Ref<HTMLInputElement | null>;
}
const [provideFileUpload, useFileUpload] = createContext<FileUploadContextValue>('FewFileUpload');

export const FewFileUpload = defineComponent({
  name: 'FewFileUpload',
  inheritAttrs: false,
  props: {
    asChild: Boolean, files: { type: Array as PropType<File[]>, default: undefined }, defaultFiles: { type: Array as PropType<File[]>, default: () => [] },
    accept: { type: String, default: undefined }, multiple: { type: Boolean, default: true }, maxSize: { type: Number, default: undefined }, disabled: Boolean,
  },
  emits: { 'update:files': (_value: File[]) => true, fileError: (_file: File, _message: string) => true },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<File[]>(() => props.files, props.defaultFiles, v => emit('update:files', v));
    const dragging = ref(false);
    const inputRef = ref<HTMLInputElement | null>(null);
    function addFiles(list: FileList | File[]) {
      if (props.disabled) return;
      const incoming = Array.from(list);
      const accepted: File[] = [];
      for (const file of incoming) {
        const error = validateFile(file, { accept: props.accept, maxSize: props.maxSize });
        if (error) emit('fileError', file, error); else accepted.push(file);
      }
      setCurrent(props.multiple ? [...current.value, ...accepted] : accepted.slice(0, 1));
    }
    provideFileUpload({
      files: () => current.value, setFiles: setCurrent, addFiles,
      accept: () => props.accept, multiple: () => props.multiple, maxSize: () => props.maxSize, disabled: () => props.disabled,
      dragging: () => dragging.value, setDragging: (v: boolean) => { dragging.value = v; }, inputRef,
    });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      'data-disabled': dataAttr(props.disabled), class: 'few-file-upload',
    }), slots);
  },
});

export const FewFileUploadDropzone = defineComponent({
  name: 'FewFileUploadDropzone',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useFileUpload('FewFileUploadDropzone');
    function handleDragover(event: DragEvent) { if (ctx.disabled()) return; event.preventDefault(); ctx.setDragging(true); }
    function handleDragleave() { ctx.setDragging(false); }
    function handleDrop(event: DragEvent) {
      if (ctx.disabled()) return;
      event.preventDefault();
      ctx.setDragging(false);
      if (event.dataTransfer) ctx.addFiles(event.dataTransfer.files);
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      'data-dragging': dataAttr(ctx.dragging()), 'data-disabled': dataAttr(ctx.disabled()), class: 'few-file-upload-dropzone',
      onDragover: handleDragover, onDragleave: handleDragleave, onDrop: handleDrop,
    }), slots);
  },
});

export const FewFileUploadTrigger = defineComponent({
  name: 'FewFileUploadTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useFileUpload('FewFileUploadTrigger');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', disabled: ctx.disabled() || undefined, class: 'few-file-upload-trigger',
      onClick: () => ctx.inputRef.value?.click(),
    }), slots);
  },
});

export const FewFileUploadHiddenInput = defineComponent({
  name: 'FewFileUploadHiddenInput',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const ctx = useFileUpload('FewFileUploadHiddenInput');
    return () => h('input', mergeProps(attrs, {
      ref: ctx.inputRef, type: 'file', accept: ctx.accept(), multiple: ctx.multiple(), disabled: ctx.disabled() || undefined,
      class: 'few-sr-only',
      onChange: (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        if (target.files) ctx.addFiles(target.files);
        target.value = '';
      },
    }));
  },
});

export const FewFileUploadList = defineComponent({
  name: 'FewFileUploadList',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('ul', props.asChild, mergeProps(attrs, { class: 'few-file-upload-list' }), slots);
  },
});

interface FileItemContextValue { file: () => File | undefined; index: number }
const [provideFileItem, useFileItem] = createContext<FileItemContextValue>('FewFileUploadItem');

export const FewFileUploadItem = defineComponent({
  name: 'FewFileUploadItem',
  inheritAttrs: false,
  props: { asChild: Boolean, index: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const ctx = useFileUpload('FewFileUploadItem');
    provideFileItem({ file: () => ctx.files()[props.index], index: props.index });
    return () => {
      const file = ctx.files()[props.index];
      if (!file) return null;
      return renderPrimitive('li', props.asChild, mergeProps(attrs, { class: 'few-file-upload-item' }), slots);
    };
  },
});

export const FewFileUploadItemName = defineComponent({
  name: 'FewFileUploadItemName',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const item = useFileItem('FewFileUploadItemName');
    return () => {
      const file = item.file();
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [createTextVNode(file?.name ?? '')]; } };
      return renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-file-upload-item-name' }), content);
    };
  },
});

export const FewFileUploadItemSize = defineComponent({
  name: 'FewFileUploadItemSize',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const item = useFileItem('FewFileUploadItemSize');
    return () => {
      const file = item.file();
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [createTextVNode(formatFileSize(file?.size ?? 0))]; } };
      return renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-file-upload-item-size few-muted' }), content);
    };
  },
});

export const FewFileUploadItemDelete = defineComponent({
  name: 'FewFileUploadItemDelete',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const item = useFileItem('FewFileUploadItemDelete');
    const ctx = useFileUpload('FewFileUploadItemDelete');
    return () => {
      const file = item.file();
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [createTextVNode('×')]; } };
      return renderPrimitive('button', props.asChild, mergeProps(attrs, {
        type: 'button', 'aria-label': (attrs['aria-label'] as string | undefined) ?? `Remover ${file?.name ?? ''}`, class: 'few-file-upload-item-delete',
        onClick: () => ctx.setFiles(ctx.files().filter((_, i) => i !== item.index)),
      }), content);
    };
  },
});
