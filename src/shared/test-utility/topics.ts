import * as bip39 from 'bip39';
import { createTopic } from '../../core/services/topic-service';
import { ChromunityUser } from '../../types';

const createRandomTopic = (user: ChromunityUser, channel: string) => {
  return createTopic(
    user,
    channel,
    upperCaseFirst(bip39.generateMnemonic(128).substring(0, 39)),
    upperCaseFirst(bip39.generateMnemonic(256))
  );
};

function upperCaseFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export { createRandomTopic };
