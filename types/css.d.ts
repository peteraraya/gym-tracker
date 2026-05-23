// Declaración de módulos CSS para importaciones de efectos secundarios
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
