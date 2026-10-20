[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [components/ui/NumericInput](../README.md) / NumericInput

# Variable: NumericInput

> `const` **NumericInput**: `ForwardRefExoticComponent`\<`NumericInputProps` & `RefAttributes`\<`HTMLInputElement`\>\>

Defined in: [components/ui/NumericInput.tsx:36](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/NumericInput.tsx#L36)

Input numérico controlado que resuelve el bug "se queda el 0 al borrar".

Comportamiento:
- Muestra el valor inicial tal cual (incluyendo '0').
- Cuando el usuario borra el campo, muestra vacío y emite 0 al padre.
- Si el padre devuelve 0 (round-trip), NO sobreescribe el display vacío.
- Si el padre cambia el valor a uno distinto del último emitido (cambio externo),
  sincroniza el display.
- Acepta coma o punto como separador decimal (cuando allowDecimal=true).
- Rechaza caracteres no numéricos.
