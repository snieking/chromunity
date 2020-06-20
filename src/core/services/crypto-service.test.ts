import { generateRandomMnemonic } from './crypto-service';

describe('crypto tests', () => {
  it('generate mnemonic', async () => {
    expect(generateRandomMnemonic().length).toBeGreaterThan(32);
  });
});
