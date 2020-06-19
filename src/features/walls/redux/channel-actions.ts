import {
  ChannelActionTypes,
  ILoadChannel,
  ILoadChannelByPopularity,
  IUpdateChannel
} from "./channel-types";
import { createAction } from "@reduxjs/toolkit";
import { withPayloadType } from "../../../shared/redux/util";

export const channelInit = createAction(ChannelActionTypes.INIT_CHANNEL);

export const loadChannel = createAction(ChannelActionTypes.LOAD_CHANNEL, withPayloadType<ILoadChannel>());

export const loadOlderTopicsInChannel = createAction(ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS, withPayloadType<number>());

export const loadChannelByPopularity = createAction(ChannelActionTypes.LOAD_CHANNEL_POPULARITY, withPayloadType<ILoadChannelByPopularity>());

export const updateChannel = createAction(ChannelActionTypes.UPDATE_CHANNEL, withPayloadType<IUpdateChannel>());
