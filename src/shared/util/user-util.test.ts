import { ifEmptyAvatarThenPlaceholder, isRepresentative } from './user-util';
import { createLoggedInUser } from '../test-utility/users';

describe('user utilities tests', () => {
  it('login users', async () => {
    const user = await createLoggedInUser();
    expect(user).toBeDefined();
  });

  it('avatar placeholder', async () => {
    const placeholder: string = ifEmptyAvatarThenPlaceholder('', 'snieking');
    expect(placeholder).not.toBe('');

    const placeholder2: string = ifEmptyAvatarThenPlaceholder('', 'snieking');
    expect(placeholder2).not.toBe('');

    const noPlaceholder: string = ifEmptyAvatarThenPlaceholder('test', 'snieking');
    expect(noPlaceholder).toBe('test');
  });

  describe('isRepresentative', () => {
    it('should return false if no user', () => {
      expect(isRepresentative(null, ['snieking'])).toBeFalsy();
    });

    it('should return false if null reps', () => {
      expect(isRepresentative({ name: 'snieking', ft3User: null }, null)).toBeFalsy();
    });

    it('should return false if empty reps', () => {
      expect(isRepresentative({ name: 'snieking', ft3User: null }, [])).toBeFalsy();
    });

    it('should return true if reps contains user', () => {
      expect(isRepresentative({ name: 'snieking', ft3User: null }, ['snieking'])).toBeTruthy();
    });

    it('should return true if reps contains user in another casing 1', () => {
      expect(isRepresentative({ name: 'snieking', ft3User: null }, ['snieKing'])).toBeTruthy();
    });

    it('should return true if reps contains user in another casing 2', () => {
      expect(isRepresentative({ name: 'Snieking', ft3User: null }, ['snieking'])).toBeTruthy();
    });
  });
});
