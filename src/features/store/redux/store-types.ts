import { StoreItem } from '../store.model';
import { ChromunityUser } from '../../../types';

export enum StoreActionTypes {
  CHECK_AUCTION_IN_PROGRESS = 'STORE/AUCTION/IN_PROGRESS',
  UPDATE_AUCTION_IN_PROGRESS = 'STORE/AUCTION/UPDATE',
  LOAD_CATEGORIES = 'STORE/CATEGORIES/LOAD',
  UPDATE_CATEGORIES = 'STORE/CATEGORIES/UPDATE',
  SWITCH_CATEGORY = 'STORE/CATEGORIES/SWITCH',
  SWITCH_TO_MY_ITEMS = 'STORE/CATEGORIES/MY_ITEMS',
  UPDATE_ITEMS = 'STORE/ITEMS/UPDATE',
  LOAD_OWNED_ITEMS = 'STORE/ITEMS/OWNED/LOAD',
  UPDATE_OWNED_ITEMS = 'STORE/ITEMS/OWNED/UPDATE',
  UPDATE_PRICE_RANGE_FILTER = 'STORE/ITEMS/PRICE_RANGE/UPDATE',
  BID_ON_ITEM = 'STORE/ITEMS/BID',
  PROCESS_AUCTIONS = 'STORE/AUCTIONS/PROCESS',
}

export interface IUpdatePriceRangeFilter {
  min: number;
  max: number;
}

export interface IBidOnItem {
  user: ChromunityUser;
  item: StoreItem;
  bid: number;
  bidSuccessCallback: (amount: number) => void;
}

export interface StoreState {
  auctionInProgress: boolean;
  storeCategories: string[];
  category: string;
  storeItems: StoreItem[];
  ownedItems: StoreItem[];
  minPrice: number;
  maxPrice: number;
}
