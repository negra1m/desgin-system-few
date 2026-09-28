// Demos/hosts de teste da categoria "Formulários" (pasta components/forms). Um componente por id do registry.
import { defineComponent, h, type Component } from 'vue';
import { FewForm, FewFormSubmit } from '../components/forms/form.js';
import { FewFieldset, FewFieldsetLegend } from '../components/forms/fieldset.js';
import { FewField, FewFieldLabel, FewFieldControl, FewFieldDescription, FewFieldError } from '../components/forms/field.js';
import { FewLabel } from '../components/forms/label.js';
import { FewInput } from '../components/forms/input.js';
import { FewInputGroup, FewInputGroupAddon, FewInputGroupInput } from '../components/forms/input-group.js';
import { FewTextarea } from '../components/forms/textarea.js';
import { FewNumberInput, FewNumberInputInput, FewNumberInputIncrement, FewNumberInputDecrement } from '../components/forms/number-input.js';
import { FewPasswordInput, FewPasswordInputInput, FewPasswordInputToggle } from '../components/forms/password-input.js';
import { FewPinInput, FewPinInputInput } from '../components/forms/pin-input.js';
import { FewNativeSelect } from '../components/forms/native-select.js';
import { FewCheckbox, FewCheckboxIndicator } from '../components/forms/checkbox.js';
import { FewCheckboxGroup, FewCheckboxGroupItem } from '../components/forms/checkbox-group.js';
import { FewRadioGroup, FewRadioGroupItem, FewRadioGroupIndicator } from '../components/forms/radio-group.js';
import { FewSwitch, FewSwitchThumb } from '../components/forms/switch.js';
import { FewSlider, FewSliderTrack, FewSliderRange, FewSliderThumb } from '../components/forms/slider.js';
import { FewRating, FewRatingItem } from '../components/forms/rating.js';
import {
  FewFileUpload, FewFileUploadDropzone, FewFileUploadTrigger, FewFileUploadHiddenInput, FewFileUploadList,
} from '../components/forms/file-upload.js';
import { FewTagsInput, FewTagsInputLabel, FewTagsInputItem, FewTagsInputItemDelete, FewTagsInputInput } from '../components/forms/tags-input.js';

export const DemoForm = defineComponent({
  name: 'DemoForm',
  setup() {
    return () => h(FewForm, { onSubmit: () => {} }, () => [
      h(FewInput, { name: 'nome', placeholder: 'Seu nome' }),
      h(FewFormSubmit, null, () => 'Enviar'),
    ]);
  },
});

export const DemoFieldset = defineComponent({
  name: 'DemoFieldset',
  setup() {
    return () => h(FewFieldset, null, () => [
      h(FewFieldsetLegend, null, () => 'Endereço'),
      h(FewInput, { placeholder: 'Rua' }),
    ]);
  },
});

export const DemoField = defineComponent({
  name: 'DemoField',
  setup() {
    return () => h(FewField, { invalid: true, required: true }, () => [
      h(FewFieldLabel, null, () => 'E-mail'),
      h(FewFieldControl, null, () => h(FewInput, { type: 'email' })),
      h(FewFieldDescription, null, () => 'Usamos só para contato.'),
      h(FewFieldError, null, () => 'E-mail inválido.'),
    ]);
  },
});

export const DemoLabel = defineComponent({
  name: 'DemoLabel',
  setup() {
    return () => h('div', null, [
      h(FewLabel, { for: 'apelido', required: true }, () => 'Apelido'),
      h(FewInput, { id: 'apelido' }),
    ]);
  },
});

export const DemoInput = defineComponent({
  name: 'DemoInput',
  setup() {
    return () => h(FewInput, { placeholder: 'Digite algo', size: 'md' });
  },
});

export const DemoInputGroup = defineComponent({
  name: 'DemoInputGroup',
  setup() {
    return () => h(FewInputGroup, null, () => [
      h(FewInputGroupAddon, null, () => 'R$'),
      h(FewInputGroupInput, { placeholder: '0,00' }),
    ]);
  },
});

export const DemoTextarea = defineComponent({
  name: 'DemoTextarea',
  setup() {
    return () => h(FewTextarea, { placeholder: 'Escreva um comentário', autoResize: true });
  },
});

export const DemoNumberInput = defineComponent({
  name: 'DemoNumberInput',
  setup() {
    return () => h(FewNumberInput, { defaultValue: 2, min: 0, max: 10 }, () => [
      h(FewNumberInputDecrement),
      h(FewNumberInputInput),
      h(FewNumberInputIncrement),
    ]);
  },
});

export const DemoPasswordInput = defineComponent({
  name: 'DemoPasswordInput',
  setup() {
    return () => h(FewPasswordInput, null, () => [
      h(FewPasswordInputInput, { placeholder: 'Senha' }),
      h(FewPasswordInputToggle),
    ]);
  },
});

export const DemoPinInput = defineComponent({
  name: 'DemoPinInput',
  setup() {
    return () => h(FewPinInput, { length: 4, defaultValue: '12' }, () => (
      Array.from({ length: 4 }, (_, i) => h(FewPinInputInput, { key: i, index: i }))
    ));
  },
});

export const DemoNativeSelect = defineComponent({
  name: 'DemoNativeSelect',
  setup() {
    return () => h(FewNativeSelect, null, () => [
      h('option', { value: 'sp' }, 'São Paulo'),
      h('option', { value: 'rj' }, 'Rio de Janeiro'),
    ]);
  },
});

export const DemoCheckbox = defineComponent({
  name: 'DemoCheckbox',
  setup() {
    return () => h(FewCheckbox, { defaultChecked: 'indeterminate' }, () => [
      h(FewCheckboxIndicator),
      ' Selecionar todos',
    ]);
  },
});

export const DemoCheckboxGroup = defineComponent({
  name: 'DemoCheckboxGroup',
  setup() {
    return () => h(FewCheckboxGroup, { defaultValue: ['a'] }, () => [
      h(FewCheckboxGroupItem, { value: 'a' }, () => [h(FewCheckboxIndicator), ' Opção A']),
      h(FewCheckboxGroupItem, { value: 'b' }, () => [h(FewCheckboxIndicator), ' Opção B']),
    ]);
  },
});

export const DemoRadioGroup = defineComponent({
  name: 'DemoRadioGroup',
  setup() {
    return () => h(FewRadioGroup, { defaultValue: 'b' }, () => [
      h(FewRadioGroupItem, { value: 'a' }, () => [h(FewRadioGroupIndicator), ' Mensal']),
      h(FewRadioGroupItem, { value: 'b' }, () => [h(FewRadioGroupIndicator), ' Anual']),
    ]);
  },
});

export const DemoSwitch = defineComponent({
  name: 'DemoSwitch',
  setup() {
    return () => h(FewSwitch, { defaultChecked: true }, () => [h(FewSwitchThumb), ' Notificações']);
  },
});

export const DemoSlider = defineComponent({
  name: 'DemoSlider',
  setup() {
    return () => h(FewSlider, { defaultValue: [40] }, () => h(FewSliderTrack, null, () => [
      h(FewSliderRange),
      h(FewSliderThumb, { index: 0 }),
    ]));
  },
});

export const DemoRating = defineComponent({
  name: 'DemoRating',
  setup() {
    return () => h(FewRating, { defaultValue: 3, max: 5 }, () => (
      Array.from({ length: 5 }, (_, i) => h(FewRatingItem, { key: i, value: i + 1 }))
    ));
  },
});

export const DemoFileUpload = defineComponent({
  name: 'DemoFileUpload',
  setup() {
    return () => h(FewFileUpload, null, () => [
      h(FewFileUploadDropzone, null, () => [
        h(FewFileUploadTrigger, null, () => 'Selecionar arquivo'),
        h(FewFileUploadHiddenInput),
      ]),
      h(FewFileUploadList, null, () => []),
    ]);
  },
});

export const DemoTagsInput = defineComponent({
  name: 'DemoTagsInput',
  setup() {
    return () => h(FewTagsInput, { defaultValue: ['few', 'design'] }, () => [
      h(FewTagsInputLabel, null, () => 'Tags'),
      h(FewTagsInputItem, { index: 0 }, () => [h(FewTagsInputItemDelete)]),
      h(FewTagsInputItem, { index: 1 }, () => [h(FewTagsInputItemDelete)]),
      h(FewTagsInputInput, { placeholder: 'Nova tag' }),
    ]);
  },
});

export const FORMS_DEMOS: Record<string, Component> = {
  form: DemoForm, fieldset: DemoFieldset, field: DemoField, label: DemoLabel, input: DemoInput,
  'input-group': DemoInputGroup, textarea: DemoTextarea, 'number-input': DemoNumberInput, 'password-input': DemoPasswordInput,
  'pin-input': DemoPinInput, 'native-select': DemoNativeSelect, checkbox: DemoCheckbox, 'checkbox-group': DemoCheckboxGroup,
  'radio-group': DemoRadioGroup, switch: DemoSwitch, slider: DemoSlider, rating: DemoRating, 'file-upload': DemoFileUpload,
  'tags-input': DemoTagsInput,
};
