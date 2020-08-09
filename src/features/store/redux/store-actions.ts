import { createAction } from '@reduxjs/toolkit';
import { StoreActionTypes, IUpdatePriceRangeFilter, IBidOnItem } from './store-types';
import { StoreItem } from '../store.model';
import { withPayloadType } from '../../../shared/redux/util';
import { ChromunityUser } from '../../../types';

export const checkIsAuctionInProgress = createAction(StoreActionTypes.CHECK_AUCTION_IN_PROGRESS);

export const updateAuctionInProgress = createAction(
  StoreActionTypes.UPDATE_AUCTION_IN_PROGRESS,
  withPayloadType<boolean>()
);

export const loadStoreCategories = createAction(StoreActionTypes.LOAD_CATEGORIES);

export const updateStoreCategories = createAction(StoreActionTypes.UPDATE_CATEGORIES, withPayloadType<string[]>());

export const switchCategory = createAction(StoreActionTypes.SWITCH_CATEGORY, withPayloadType<string>());

export const switchToMyItems = createAction(StoreActionTypes.SWITCH_TO_MY_ITEMS);

export const updateItems = createAction(StoreActionTypes.UPDATE_ITEMS, withPayloadType<StoreItem[]>());

export const loadOwnedItems = createAction(StoreActionTypes.LOAD_OWNED_ITEMS, withPayloadType<ChromunityUser>());

export const updateOwnedItems = createAction(StoreActionTypes.UPDATE_OWNED_ITEMS, withPayloadType<StoreItem[]>());

export const updatePriceRangeFilter = createAction(
  StoreActionTypes.UPDATE_PRICE_RANGE_FILTER,
  withPayloadType<IUpdatePriceRangeFilter>()
);

export const bidOnItem = createAction(StoreActionTypes.BID_ON_ITEM, withPayloadType<IBidOnItem>());

export const processAuctions = createAction(StoreActionTypes.PROCESS_AUCTIONS, withPayloadType<ChromunityUser>());
