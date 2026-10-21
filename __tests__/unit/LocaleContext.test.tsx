import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LocaleProvider, useLocale } from '@/context/LocaleContext';

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
      </LocaleProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('en')).toBeInTheDocument();
      expect(screen.getByText('Train')).toBeInTheDocument();
      expect(document.documentElement.lang).toBe('en');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar idioma' }));

    await waitFor(() => {
      expect(screen.getByText('Entrenar')).toBeInTheDocument();
      expect(document.documentElement.lang).toBe('es');
    });
  });
});
