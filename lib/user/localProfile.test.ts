import {
  getProfileLocally,
  saveProfileLocally,
} from './localProfile';

describe('localProfile', () => {
  let getItemSpy: jest.SpyInstance<string | null, [key: string]>;
  let setItemSpy: jest.SpyInstance<void, [key: string, value: string]>;

  beforeEach(() => {
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    setItemSpy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a complete local profile with default identity fields', () => {
    getItemSpy.mockReturnValue(null);

    const saved = saveProfileLocally({
      age: 34,
      currentWeight: 82,
      fitnessGoal: 'strength',
    });

    expect(saved).toMatchObject({
      id: 'local-profile',
      userId: 'local-user',
      name: 'Usuario',
      email: 'local@user.com',
      age: 34,
      currentWeight: 82,
      fitnessGoal: 'strength',
    });

    const storedValue = setItemSpy.mock.calls[0][1];
    expect(JSON.parse(storedValue)).toMatchObject({
      name: 'Usuario',
      email: 'local@user.com',
      age: 34,
      currentWeight: 82,
      fitnessGoal: 'strength',
    });
  });

  it('preserves existing identity fields when updating workout preferences', () => {
    getItemSpy.mockReturnValue(JSON.stringify({
      id: 'existing-profile',
      userId: 'existing-user',
      name: 'Paula',
      email: 'paula@example.com',
      avatarUrl: '/avatar.png',
      weeklyWorkouts: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }));

    const saved = saveProfileLocally({
      weeklyWorkouts: 4,
    });

    expect(saved).toMatchObject({
      id: 'existing-profile',
      userId: 'existing-user',
      name: 'Paula',
      email: 'paula@example.com',
      avatarUrl: '/avatar.png',
      weeklyWorkouts: 4,
    });
  });

  it('returns null when no local profile exists', () => {
    getItemSpy.mockReturnValue(null);

    expect(getProfileLocally()).toBeNull();
  });

  it('persists weightHistory when saving profile', () => {
    getItemSpy.mockReturnValue(JSON.stringify({
      id: 'existing-profile',
      name: 'Paula',
      email: 'paula@example.com',
      weightHistory: [{ date: '2026-08-01', weight: 80.5 }],
    }));

    const saved = saveProfileLocally({
      weightHistory: [
        { date: '2026-08-01', weight: 80.5 },
        { date: '2026-09-01', weight: 79.9 },
      ],
    });

    expect(saved.weightHistory).toHaveLength(2);
    expect(saved.weightHistory?.[1]).toEqual({ date: '2026-09-01', weight: 79.9 });

    const storedValue = setItemSpy.mock.calls[0][1];
    expect(JSON.parse(storedValue).weightHistory).toHaveLength(2);
  });
});
