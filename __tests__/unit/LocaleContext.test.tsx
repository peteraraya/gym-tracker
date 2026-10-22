import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LocaleProvider, useLocale, useTranslations } from '@/context/LocaleContext';

function LocaleProbe() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div>
      <span>{locale}</span>
      <span>{t('nav.train')}</span>
      <button type="button" onClick={() => setLocale('es')}>Cambiar idioma</button>
    </div>
  );
}

function DashboardTranslationsProbe() {
  const t = useTranslations('dashboard');

  return (
    <div>
      <span>{t('quickStart')}</span>
      <span>{t('quickStartContinue')}</span>
      <span>{t('quickStartContinueDescription')}</span>
      <span>{t('quickStartRepeat')}</span>
      <span>{t('quickStartRepeatDescription')}</span>
    </div>
  );
}

describe('LocaleProvider', () => {
  beforeEach(() => {
    window.localStorage.setItem('locale', 'en');
    document.documentElement.lang = 'es';
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('loads a saved locale after hydration and updates the document language', async () => {
    render(
      <LocaleProvider>
        <LocaleProbe />
        <DashboardTranslationsProbe />
      </LocaleProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('en')).toBeInTheDocument();
      expect(screen.getByText('Train')).toBeInTheDocument();
      expect(screen.getByText('Quick start')).toBeInTheDocument();
      expect(screen.getByText('Start routine')).toBeInTheDocument();
      expect(screen.getByText('Repeat the routine you trained most recently.')).toBeInTheDocument();
      expect(document.documentElement.lang).toBe('en');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar idioma' }));

    await waitFor(() => {
      expect(screen.getByText('Entrenar')).toBeInTheDocument();
      expect(screen.getByText('Inicio rápido')).toBeInTheDocument();
      expect(screen.getByText('Empezar rutina')).toBeInTheDocument();
      expect(screen.getByText('Repite la última rutina que entrenaste.')).toBeInTheDocument();
      expect(document.documentElement.lang).toBe('es');
    });
  });
});
