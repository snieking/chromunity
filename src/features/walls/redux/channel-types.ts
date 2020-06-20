import { Topic } from '../../../types';

export enum ChannelActionTypes {
  INIT_CHANNEL = 'CHANNEL/INIT',
  UPDATE_CHANNEL = 'CHANNEL/UPDATE',
  LOAD_CHANNEL = 'CHANNEL/LOAD',
  LOAD_OLDER_CHANNEL_TOPICS = 'CHANNEL/LOAD/OLDER/TOPICS',
  LOAD_CHANNEL_POPULARITY = 'CHANNEL/LOAD/POPULARITY',
}

export interface IUpdateChannel {
  name: string;
  topics: Topic[];
  couldExistOlder: boolean;
}

export interface ILoadChannel {
  name: string;
  pageSize: number;
}

export interface ILoadChannelByPopularity {
  name: string;
  timestamp: number;
  pageSize: number;
}

export interface ChannelState {
  name: string;
  topics: Topic[];
  couldExistOlder: boolean;
}
