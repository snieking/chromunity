import { createReducer } from '@reduxjs/toolkit';
import { StoreState } from './store-types';
import {
  updateStoreCategories,
  updateItems,
  switchCategory,
  updateOwnedItems,
  updatePriceRangeFilter,
  switchToMyItems,
  updateAuctionInProgress,
} from './store-actions';

const initialState: StoreState = {
  auctionInProgress: false,
  storeCategories: [],
  category: 'My Items',
  storeItems: [],
  ownedItems: [],
  minPrice: 0,
  maxPrice: 10000,
};

export const storeReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(updateAuctionInProgress, (state, action) => {
      state.auctionInProgress = action.payload;
    })
    .addCase(updateStoreCategories, (state, action) => {
      state.storeCategories = action.payload;
    })
    .addCase(switchCategory, (state, action) => {
      state.category = action.payload;
    })
    .addCase(switchToMyItems, (state) => {
      state.storeItems = state.ownedItems;
      state.category = 'My Items';
    })
    .addCase(updateItems, (state, action) => {
      state.storeItems = action.payload;
    })
    .addCase(updateOwnedItems, (state, action) => {
      state.ownedItems = action.payload;
    })
    .addCase(updatePriceRangeFilter, (state, action) => {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
    })
);
