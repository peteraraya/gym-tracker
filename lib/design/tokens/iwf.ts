// ============================================
// TOKENS DE DISEÑO IWF (International Weightlifting Federation)
// Colores oficiales de competición para discos de barras olímpicas
// ============================================

export const IWF_COLORS = {
  // Discos de competición (colores oficiales IWF)
  25:   { hex: '#ED1C24', label: 'Rojo',   text: '#FFFFFF' },
  20:   { hex: '#0052A4', label: 'Azul',   text: '#FFFFFF' },
  15:   { hex: '#FFC400', label: 'Amarillo', text: '#000000' },
  10:   { hex: '#00A651', label: 'Verde',  text: '#FFFFFF' },
  5:    { hex: '#FFFFFF', label: 'Blanco', text: '#000000' },
  // Micro-carga (colores IWF claros / pastel)
  2.5:  { hex: '#F06262', label: 'Rojo claro',   text: '#FFFFFF' },
  2:    { hex: '#4D94E0', label: 'Azul claro',   text: '#FFFFFF' },
  1.5:  { hex: '#FFD966', label: 'Amarillo claro', text: '#000000' },
  1:    { hex: '#6FCF97', label: 'Verde claro',  text: '#000000' },
  0.5:  { hex: '#E8E8E8', label: 'Blanco grisáceo', text: '#000000' },
  // Libras (equivalentes IWF)
  45:   { hex: '#ED1C24', label: 'Rojo',   text: '#FFFFFF' },
  35:   { hex: '#0052A4', label: 'Azul',   text: '#FFFFFF' },
} as const;

export type IWFWeight = keyof typeof IWF_COLORS;

export function getIWFColor(weight: number) {
  return IWF_COLORS[weight as IWFWeight] || { hex: '#94A3B8', label: 'Gris', text: '#FFFFFF' };
}

// ============================================
// TOKENS DE INTERFAZ (Mobile-First)
// ============================================

export const UI_TOKENS = {
  // Touch targets mínimos (estándar iOS/Android)
  touchTarget: '48px',
  // Espaciado
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  // Border radius
  radius: {
    sm: '6px',
    md: '12px',
    lg: '24px',
    full: '9999px',
  },
  // Sombras
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  // Colores de superficie (tema oscuro para gimnasios)
  surface: {
    bg: '#0F1115',
    card: '#1A1D24',
    cardHover: '#242830',
    border: '#2D3139',
  },
  // Colores de texto
  text: {
    primary: '#FFFFFF',
    secondary: '#9AA0A6',
    muted: '#6B7280',
    inverse: '#0F1115',
  },
  // Colores de estado
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },
  // Acento interactivo
  accent: {
    primary: '#06B6D4', // Cian
    hover: '#0891B2',
  },
} as const;

export type UIToken = typeof UI_TOKENS;