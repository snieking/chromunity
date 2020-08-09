import { op, nop } from 'ft3-lib';
import { StoreItem, Bid } from './store.model';
import { ChromunityUser } from '../../types';
import { executeQuery, executeOperations } from '../../core/services/postchain';

export function isAuctionInProgress(): Promise<string[]> {
  return executeQuery('auction_in_progress', {});
}

export function getStoreCategories(): Promise<string[]> {
  return executeQuery('get_store_categories', {});
}

export function openCategory(category: string): Promise<StoreItem[]> {
  return executeQuery('get_store_items_by_category', { name: category });
}

export function getCurrentBid(item: StoreItem): Promise<Bid> {
  return executeQuery('get_current_bid', { id: item.id });
}

export function getOwnedItems(user: ChromunityUser): Promise<StoreItem[]> {
  return executeQuery('get_owned_items', { name: user.name });
}

export function getOwnedItemsByCategory(user: ChromunityUser, category: string): Promise<StoreItem[]> {
  return executeQuery('get_owned_items_by_category', { name: user.name, category });
}

export function placeItemBid(user: ChromunityUser, item: StoreItem, bid: number): Promise<unknown> {
  return executeOperations(user.ft3User, op('put_bid', user.ft3User.authDescriptor.id, user.name, item.id, bid));
}

export function startAuction(user: ChromunityUser): Promise<unknown> {
  return executeOperations(user.ft3User, op('start_auction'), nop());
}

export function finalizeAuction(user: ChromunityUser): Promise<unknown> {
  return executeOperations(user.ft3User, op('finalize_auction'), nop());
}
