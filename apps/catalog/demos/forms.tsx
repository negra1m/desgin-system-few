"use client";
import { useState } from 'react';
import {
  Form, Fieldset, Field, Label, Input, InputGroup, Textarea, NumberInput, PasswordInput, PinInput, NativeSelect,
  Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Rating, FileUpload, TagsInput, type CheckedState,
} from '@fewcompany/ui';
import type { DemoMap } from './types';

function FormDemo() {
  const [result, setResult] = useState<string | null>(null);
  return (
    <Form className="demo-stack demo-narrow" onSubmit={(_, values) => setResult(String(values.nome ?? ''))}>
      <Field>
        <Field.Label>Nome</Field.Label>
        <Field.Control><Input name="nome" placeholder="Seu nome" required /></Field.Control>
      </Field>
      <Form.Submit>Enviar</Form.Submit>
      {result && <p role="status" className="few-muted">Formulário enviado por {result}.</p>}
    </Form>
  );
}

function FieldsetDemo() {
  const [disabled, setDisabled] = useState(false);
  return (
    <div className="demo-stack demo-narrow">
      <label className="demo-row few-muted"><input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} /> Desabilitar grupo</label>
      <Fieldset disabled={disabled}>
        <Fieldset.Legend>Endereço</Fieldset.Legend>
        <Field>
          <Field.Label>Cidade</Field.Label>
          <Field.Control><Input placeholder="São Paulo" /></Field.Control>
        </Field>
      </Fieldset>
    </div>
  );
}

function FieldDemo() {
  const [value, setValue] = useState('');
  const invalid = value.length > 0 && !value.includes('@');
  return (
    <Field className="demo-narrow" invalid={invalid}>
      <Field.Label>Usuário</Field.Label>
      <Field.Control>
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="usuario@dominio.com" />
      </Field.Control>
      <Field.Description>Usamos para recuperação de conta.</Field.Description>
      {invalid && <Field.Error>Inclua um @ no usuário.</Field.Error>}
    </Field>
  );
}

function LabelDemo() {
  return (
    <div className="demo-stack demo-narrow">
      <Label htmlFor="label-demo-nome" required>Nome completo</Label>
      <Input id="label-demo-nome" placeholder="Ex.: Maria Silva" />
    </div>
  );
}

function InputDemo() {
  const [email, setEmail] = useState('');
  return (
    <div className="demo-stack demo-narrow">
      <Field>
        <Field.Label>E-mail</Field.Label>
        <Field.Control><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" /></Field.Control>
      </Field>
      <div className="demo-row">
        <Input size="sm" placeholder="Pequeno" />
        <Input size="lg" placeholder="Grande" />
      </div>
      <Input invalid defaultValue="valor errado" aria-label="Campo inválido" />
    </div>
  );
}

function InputGroupDemo() {
  return (
    <div className="demo-stack demo-narrow">
      <InputGroup>
        <InputGroup.Addon>R$</InputGroup.Addon>
        <InputGroup.Input placeholder="0,00" inputMode="decimal" aria-label="Valor em reais" />
      </InputGroup>
      <InputGroup>
        <InputGroup.Input placeholder="Buscar…" aria-label="Buscar" />
        <InputGroup.Element asChild side="end"><button type="button" aria-label="Buscar">⌕</button></InputGroup.Element>
      </InputGroup>
    </div>
  );
}

function TextareaDemo() {
  const [value, setValue] = useState('Texto que cresce conforme você digita.');
  return <Textarea className="demo-narrow" autoResize value={value} onChange={(e) => setValue(e.target.value)} aria-label="Mensagem" />;
}

function NumberInputDemo() {
  const [value, setValue] = useState<number | null>(1);
  return (
    <NumberInput value={value} onValueChange={setValue} min={0} max={10}>
      <NumberInput.Decrement>−</NumberInput.Decrement>
      <NumberInput.Input aria-label="Quantidade" />
      <NumberInput.Increment>+</NumberInput.Increment>
    </NumberInput>
  );
}

function PasswordInputDemo() {
  return (
    <PasswordInput className="demo-narrow">
      <PasswordInput.Input placeholder="Sua senha" aria-label="Senha" />
      <PasswordInput.Toggle />
    </PasswordInput>
  );
}

function PinInputDemo() {
  const [value, setValue] = useState('');
  const [complete, setComplete] = useState('');
  return (
    <div className="demo-stack">
      <PinInput length={4} value={value} onValueChange={setValue} onComplete={setComplete}>
        {Array.from({ length: 4 }).map((_, i) => <PinInput.Input key={i} index={i} />)}
      </PinInput>
      <p className="few-muted" role="status">{complete ? `Código completo: ${complete}` : 'Digite os 4 dígitos.'}</p>
    </div>
  );
}

function NativeSelectDemo() {
  return (
    <NativeSelect defaultValue="sp" className="demo-narrow" aria-label="Estado">
      <option value="sp">São Paulo</option>
      <option value="rj">Rio de Janeiro</option>
      <option value="mg">Minas Gerais</option>
    </NativeSelect>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = useState<CheckedState>('indeterminate');
  return (
    <Checkbox.Root checked={checked} onCheckedChange={setChecked}>
      <Checkbox.Indicator />
      Aceito os termos de uso
    </Checkbox.Root>
  );
}

function CheckboxGroupDemo() {
  const [value, setValue] = useState<string[]>(['few']);
  return (
    <CheckboxGroup value={value} onValueChange={setValue}>
      <CheckboxGroup.Item value="few"><Checkbox.Indicator /> Few</CheckboxGroup.Item>
      <CheckboxGroup.Item value="ifight"><Checkbox.Indicator /> iFIGHT</CheckboxGroup.Item>
      <CheckboxGroup.Item value="caraminholas"><Checkbox.Indicator /> Caraminholas</CheckboxGroup.Item>
    </CheckboxGroup>
  );
}

function RadioGroupDemo() {
  const [value, setValue] = useState('pix');
  return (
    <RadioGroup value={value} onValueChange={setValue} aria-label="Forma de pagamento">
      <RadioGroup.Item value="pix"><RadioGroup.Indicator /> Pix</RadioGroup.Item>
      <RadioGroup.Item value="cartao"><RadioGroup.Indicator /> Cartão</RadioGroup.Item>
      <RadioGroup.Item value="boleto"><RadioGroup.Indicator /> Boleto</RadioGroup.Item>
    </RadioGroup>
  );
}

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <label className="demo-row">
      <Switch.Root checked={on} onCheckedChange={setOn}><Switch.Thumb /></Switch.Root>
      Notificações por e-mail
    </label>
  );
}

function SliderDemo() {
  const [value, setValue] = useState([30]);
  return (
    <div className="demo-stack demo-narrow">
      <Slider value={value} onValueChange={setValue} max={100} step={5}>
        <Slider.Track>
          <Slider.Range />
          <Slider.Thumb index={0} aria-label="Volume" />
        </Slider.Track>
      </Slider>
      <p className="few-muted">Valor: {value[0]}</p>
    </div>
  );
}

function RatingDemo() {
  const [value, setValue] = useState(3);
  return (
    <div className="demo-stack">
      <Rating value={value} onValueChange={setValue} max={5}>
        {Array.from({ length: 5 }).map((_, i) => <Rating.Item key={i} value={i + 1} />)}
      </Rating>
      <p className="few-muted">Nota: {value} de 5</p>
    </div>
  );
}

function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  return (
    <FileUpload files={files} onFilesChange={setFiles} maxSize={2_000_000} onFileError={(file, message) => setError(`${file.name}: ${message}`)}>
      <FileUpload.Dropzone className="demo-narrow">
        <p className="few-muted">Arraste um arquivo ou</p>
        <FileUpload.Trigger>Escolher arquivo</FileUpload.Trigger>
        <FileUpload.HiddenInput aria-label="Arquivo" />
      </FileUpload.Dropzone>
      {error && <p role="alert" className="few-muted">{error}</p>}
      <FileUpload.List>
        {files.map((_, index) => (
          <FileUpload.Item key={index} index={index}>
            <FileUpload.ItemName />
            <FileUpload.ItemSize />
            <FileUpload.ItemDelete />
          </FileUpload.Item>
        ))}
      </FileUpload.List>
    </FileUpload>
  );
}

function TagsInputDemo() {
  const [tags, setTags] = useState(['react', 'few']);
  return (
    <div className="demo-narrow">
      <TagsInput value={tags} onValueChange={setTags} max={6}>
        <TagsInput.Label>Tecnologias</TagsInput.Label>
        {tags.map((tag, index) => (
          <TagsInput.Item key={tag} index={index}>
            {tag} <TagsInput.ItemDelete />
          </TagsInput.Item>
        ))}
        <TagsInput.Input placeholder="Adicionar…" />
      </TagsInput>
    </div>
  );
}

// Demos da categoria "Formulários". Chave = id do registry. Cada demo é um componente React interativo.
export const formsDemos: DemoMap = {
  form: FormDemo,
  fieldset: FieldsetDemo,
  field: FieldDemo,
  label: LabelDemo,
  input: InputDemo,
  'input-group': InputGroupDemo,
  textarea: TextareaDemo,
  'number-input': NumberInputDemo,
  'password-input': PasswordInputDemo,
  'pin-input': PinInputDemo,
  'native-select': NativeSelectDemo,
  checkbox: CheckboxDemo,
  'checkbox-group': CheckboxGroupDemo,
  'radio-group': RadioGroupDemo,
  switch: SwitchDemo,
  slider: SliderDemo,
  rating: RatingDemo,
  'file-upload': FileUploadDemo,
  'tags-input': TagsInputDemo,
};
