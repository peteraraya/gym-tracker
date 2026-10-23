import { render, screen } from '@testing-library/react';
import { RepositoryProvider, useRepositories } from '@/context/RepositoryContext';

jest.mock('@/lib/infrastructure/supabase/config', () => ({
  hasSupabaseConfig: () => true,
}));

function RepositoryProbe() {
  const { isDatabaseEnabled, user } = useRepositories();

  return (
    <span>
      {isDatabaseEnabled ? 'database-enabled' : 'database-disabled'}:
      {user ? 'authenticated' : 'anonymous'}
    </span>
  );
}

describe('RepositoryProvider', () => {
  const originalDatabaseFlag = process.env.NEXT_PUBLIC_ENABLE_DATABASE;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_DATABASE = 'false';
  });

  afterAll(() => {
    if (originalDatabaseFlag === undefined) {
      delete process.env.NEXT_PUBLIC_ENABLE_DATABASE;
    } else {
      process.env.NEXT_PUBLIC_ENABLE_DATABASE = originalDatabaseFlag;
    }
  });

  it('provides repository context before authentication is available', () => {
    render(
      <RepositoryProvider user={null}>
        <RepositoryProbe />
      </RepositoryProvider>,
    );

    expect(screen.getByText('database-disabled:anonymous')).toBeTruthy();
  });

  it('keeps configured repositories available while the user is anonymous', () => {
    process.env.NEXT_PUBLIC_ENABLE_DATABASE = 'true';

    render(
      <RepositoryProvider user={null}>
        <RepositoryProbe />
      </RepositoryProvider>,
    );

    expect(screen.getByText('database-enabled:anonymous')).toBeTruthy();
  });
});
