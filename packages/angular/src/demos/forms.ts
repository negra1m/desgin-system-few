// Hosts de demonstração/teste da categoria "Formulários" (pasta components/forms). Um @Component por id do registry, selector few-demo-<id>.
import { Component, signal, type Type } from '@angular/core';
import { FEW_FORM } from '../components/forms/form.js';
import { FEW_FIELDSET } from '../components/forms/fieldset.js';
import { FEW_FIELD } from '../components/forms/field.js';
import { FEW_LABEL } from '../components/forms/label.js';
import { FEW_INPUT } from '../components/forms/input.js';
import { FEW_INPUT_GROUP } from '../components/forms/input-group.js';
import { FEW_TEXTAREA } from '../components/forms/textarea.js';
import { FEW_NUMBER_INPUT } from '../components/forms/number-input.js';
import { FEW_PASSWORD_INPUT } from '../components/forms/password-input.js';
import { FEW_PIN_INPUT } from '../components/forms/pin-input.js';
import { FEW_NATIVE_SELECT } from '../components/forms/native-select.js';
import { FEW_CHECKBOX } from '../components/forms/checkbox.js';
import { FEW_CHECKBOX_GROUP } from '../components/forms/checkbox-group.js';
import { FEW_RADIO_GROUP } from '../components/forms/radio-group.js';
import { FEW_SWITCH } from '../components/forms/switch.js';
import { FEW_SLIDER } from '../components/forms/slider.js';
import { FEW_RATING } from '../components/forms/rating.js';
import { FEW_FILE_UPLOAD } from '../components/forms/file-upload.js';
import { FEW_TAGS_INPUT } from '../components/forms/tags-input.js';

@Component({
  selector: 'few-demo-form',
  imports: [FEW_FORM, FEW_FIELD, FEW_INPUT],
  template: `
    <form fewForm (formSubmit)="onSubmit($event)" class="demo-stack">
      <div fewField>
        <label fewFieldLabel>Nome</label>
        <input fewInput fewFieldControl name="nome" placeholder="Seu nome" />
      </div>
      <button fewFormSubmit>Enviar</button>
    </form>
    <p class="few-muted" role="status">{{ submitted() ? 'Enviado: ' + submitted() : 'Ainda não enviado.' }}</p>
  `,
})
export class DemoForm {
  protected readonly submitted = signal('');
  protected onSubmit(values: Record<string, FormDataEntryValue>) { this.submitted.set(String(values['nome'] ?? '')); }
}

@Component({
  selector: 'few-demo-fieldset',
  imports: [FEW_FIELDSET, FEW_FIELD, FEW_INPUT],
  template: `
    <fieldset fewFieldset>
      <legend fewFieldsetLegend>Endereço</legend>
      <div fewField>
        <label fewFieldLabel>Rua</label>
        <input fewInput fewFieldControl placeholder="Nome da rua" />
      </div>
    </fieldset>
  `,
})
export class DemoFieldset {}

@Component({
  selector: 'few-demo-field',
  imports: [FEW_FIELD, FEW_INPUT],
  template: `
    <div fewField [invalid]="true" [required]="true">
      <label fewFieldLabel>E-mail</label>
      <input fewInput fewFieldControl type="email" />
      <p fewFieldDescription>Usaremos só para contato.</p>
      <p fewFieldError>Informe um e-mail válido.</p>
    </div>
  `,
})
export class DemoField {}

@Component({
  selector: 'few-demo-label',
  imports: [FEW_LABEL],
  template: `
    <label fewLabel for="demo-label-input" required>Apelido</label>
    <input id="demo-label-input" class="few-input" placeholder="Como te chamam?" />
  `,
})
export class DemoLabel {}

@Component({
  selector: 'few-demo-input',
  imports: [FEW_INPUT],
  template: `
    <div class="demo-stack">
      <input fewInput placeholder="Normal" />
      <input fewInput [invalid]="true" placeholder="Inválido" aria-label="Campo inválido" />
      <input fewInput size="sm" placeholder="Pequeno" />
    </div>
  `,
})
export class DemoInput {}

@Component({
  selector: 'few-demo-input-group',
  imports: [FEW_INPUT_GROUP, FEW_INPUT],
  template: `
    <div fewInputGroup>
      <span fewInputGroupAddon>R$</span>
      <input fewInput fewInputGroupInput placeholder="0,00" />
    </div>
  `,
})
export class DemoInputGroup {}

@Component({
  selector: 'few-demo-textarea',
  imports: [FEW_TEXTAREA],
  template: `<textarea fewTextarea rows="3" placeholder="Escreva algo..."></textarea>`,
})
export class DemoTextarea {}

@Component({
  selector: 'few-demo-number-input',
  imports: [FEW_NUMBER_INPUT],
  template: `
    <div fewNumberInput [value]="3" [min]="0" [max]="10">
      <button fewNumberInputDecrement></button>
      <input fewNumberInputInput aria-label="Quantidade" />
      <button fewNumberInputIncrement></button>
    </div>
  `,
})
export class DemoNumberInput {}

@Component({
  selector: 'few-demo-password-input',
  imports: [FEW_PASSWORD_INPUT, FEW_INPUT],
  template: `
    <div fewPasswordInput>
      <input fewInput fewPasswordInputInput placeholder="Senha" />
      <button fewPasswordInputToggle></button>
    </div>
  `,
})
export class DemoPasswordInput {}

@Component({
  selector: 'few-demo-pin-input',
  imports: [FEW_PIN_INPUT],
  template: `
    <div fewPinInput [length]="4" [value]="'12'">
      @for (i of [0, 1, 2, 3]; track i) {
        <input fewPinInputInput [index]="i" />
      }
    </div>
  `,
})
export class DemoPinInput {}

@Component({
  selector: 'few-demo-native-select',
  imports: [FEW_NATIVE_SELECT],
  template: `
    <span fewNativeSelect>
      <select fewNativeSelectControl>
        <option value="a">Opção A</option>
        <option value="b">Opção B</option>
      </select>
    </span>
  `,
})
export class DemoNativeSelect {}

@Component({
  selector: 'few-demo-checkbox',
  imports: [FEW_CHECKBOX],
  template: `
    <div class="demo-stack">
      <label fewCheckbox [checked]="true">
        <input fewCheckboxInput /><span fewCheckboxIndicator></span> Marcado
      </label>
      <label fewCheckbox [checked]="'indeterminate'">
        <input fewCheckboxInput /><span fewCheckboxIndicator></span> Indeterminado
      </label>
    </div>
  `,
})
export class DemoCheckbox {}

@Component({
  selector: 'few-demo-checkbox-group',
  imports: [FEW_CHECKBOX_GROUP, FEW_CHECKBOX],
  template: `
    <div fewCheckboxGroup [value]="['a']">
      <label fewCheckboxGroupItem value="a"><input fewCheckboxInput /><span fewCheckboxIndicator></span> A</label>
      <label fewCheckboxGroupItem value="b"><input fewCheckboxInput /><span fewCheckboxIndicator></span> B</label>
    </div>
  `,
})
export class DemoCheckboxGroup {}

@Component({
  selector: 'few-demo-radio-group',
  imports: [FEW_RADIO_GROUP],
  template: `
    <div fewRadioGroup [value]="'b'">
      <label fewRadioGroupItem value="a"><input fewRadioGroupItemInput /><span fewRadioGroupIndicator></span> A</label>
      <label fewRadioGroupItem value="b"><input fewRadioGroupItemInput /><span fewRadioGroupIndicator></span> B</label>
    </div>
  `,
})
export class DemoRadioGroup {}

@Component({
  selector: 'few-demo-switch',
  imports: [FEW_SWITCH],
  template: `
    <label fewSwitch [checked]="true">
      <input fewSwitchInput /><span fewSwitchThumb></span> Notificações
    </label>
  `,
})
export class DemoSwitch {}

@Component({
  selector: 'few-demo-slider',
  imports: [FEW_SLIDER],
  template: `
    <div fewSlider [values]="[30]">
      <div fewSliderTrack>
        <div fewSliderRange></div>
        <div fewSliderThumb [index]="0"></div>
      </div>
    </div>
  `,
})
export class DemoSlider {}

@Component({
  selector: 'few-demo-rating',
  imports: [FEW_RATING],
  template: `
    <div fewRating [value]="3">
      @for (i of [1, 2, 3, 4, 5]; track i) {
        <button fewRatingItem [value]="i"></button>
      }
    </div>
  `,
})
export class DemoRating {}

@Component({
  selector: 'few-demo-file-upload',
  imports: [FEW_FILE_UPLOAD],
  template: `
    <div fewFileUpload>
      <div fewFileUploadDropzone>
        <button fewFileUploadTrigger>Selecionar arquivo</button>
        <input fewFileUploadHiddenInput />
      </div>
      <ul fewFileUploadList></ul>
    </div>
  `,
})
export class DemoFileUpload {}

@Component({
  selector: 'few-demo-tags-input',
  imports: [FEW_TAGS_INPUT],
  template: `
    <div fewTagsInput [value]="['few', 'angular']">
      <label fewTagsInputLabel>Tags</label>
      @for (tag of tags; track tag; let i = $index) {
        <span fewTagsInputItem [index]="i">
          <button fewTagsInputItemDelete></button>
        </span>
      }
      <input fewTagsInputInput placeholder="Adicionar tag..." />
    </div>
  `,
})
export class DemoTagsInput {
  protected readonly tags = ['few', 'angular'];
}

export const FORMS_DEMOS: Record<string, Type<unknown>> = {
  form: DemoForm,
  fieldset: DemoFieldset,
  field: DemoField,
  label: DemoLabel,
  input: DemoInput,
  'input-group': DemoInputGroup,
  textarea: DemoTextarea,
  'number-input': DemoNumberInput,
  'password-input': DemoPasswordInput,
  'pin-input': DemoPinInput,
  'native-select': DemoNativeSelect,
  checkbox: DemoCheckbox,
  'checkbox-group': DemoCheckboxGroup,
  'radio-group': DemoRadioGroup,
  switch: DemoSwitch,
  slider: DemoSlider,
  rating: DemoRating,
  'file-upload': DemoFileUpload,
  'tags-input': DemoTagsInput,
};
