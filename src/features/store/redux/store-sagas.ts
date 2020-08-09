import { takeLatest, put, select } from 'redux-saga/effects';
import { Action } from '@reduxjs/toolkit';
import { StoreActionTypes } from './store-types';
import {
  getStoreCategories,
  openCategory,
  getOwnedItems,
  placeItemBid,
  startAuction,
  finalizeAuction,
  isAuctionInProgress,
} from '../store.service';
import {
  updateStoreCategories,
  switchCategory,
  updateItems,
  loadOwnedItems,
  updateOwnedItems,
  switchToMyItems,
  processAuctions,
  bidOnItem,
  updateAuctionInProgress,
} from './store-actions';
import { setQueryPending, setOperationPending, setRateLimited } from '../../../shared/redux/common-actions';
import { notifySuccess, notifyError } from '../../../core/snackbar/redux/snackbar-actions';
import { checkUserKudos } from '../../user/redux/account-actions';
import logger from '../../../shared/util/logger';
import ApplicationState from '../../../core/application-state';

export function* storeWatcher() {
  yield takeLatest(StoreActionTypes.CHECK_AUCTION_IN_PROGRESS, checkAuctionInProgress);
  yield takeLatest(StoreActionTypes.LOAD_CATEGORIES, loadCategoriesSaga);
  yield takeLatest(StoreActionTypes.SWITCH_CATEGORY, switchCategorySaga);
  yield takeLatest(StoreActionTypes.LOAD_OWNED_ITEMS, loadOwnedItemsSaga);
  yield takeLatest(StoreActionTypes.BID_ON_ITEM, bidOnItemSaga);
  yield takeLatest(StoreActionTypes.PROCESS_AUCTIONS, processAuctionsSaga);
}

const getKudos = (state: ApplicationState) => state.account.kudos;

function* checkAuctionInProgress() {
  const inProgress = yield isAuctionInProgress();
  yield put(updateAuctionInProgress(inProgress));
}

function* loadCategoriesSaga() {
  yield put(setQueryPending(true));

  const categories = yield getStoreCategories();
  yield put(updateStoreCategories(categories));

  yield put(setQueryPending(false));
}

function* switchCategorySaga(action: Action) {
  if (switchCategory.match(action)) {
    yield put(setQueryPending(true));

    const items = yield openCategory(action.payload);
    yield put(updateItems(items));

    yield put(setQueryPending(false));
  }
}

function* loadOwnedItemsSaga(action: Action) {
  if (loadOwnedItems.match(action)) {
    yield put(setQueryPending(true));

    const ownedItems = yield getOwnedItems(action.payload);
    yield put(updateOwnedItems(ownedItems));
    yield put(switchToMyItems());

    yield put(setQueryPending(false));
  }
}

function* bidOnItemSaga(action: Action) {
  if (bidOnItem.match(action)) {
    try {
      yield put(setOperationPending(true));

      const kudos = yield select(getKudos);

      if (kudos >= action.payload.bid) {
        yield placeItemBid(action.payload.user, action.payload.item, action.payload.bid);

        yield put(checkUserKudos());
        yield put(notifySuccess(`${action.payload.item.name} has been added to your items`));

        action.payload.bidSuccessCallback(action.payload.bid);
      } else {
        yield put(notifyError(`You don't have enough kudos to place a bid of ${action.payload.bid}`));
      }
    } catch (error) {
      yield put(notifyError(`Error during purchase: ${error.message}`));
      yield put(setRateLimited());
    } finally {
      yield put(setOperationPending(false));
    }
  }
}

function* processAuctionsSaga(action: Action) {
  if (processAuctions.match(action)) {
    try {
      yield finalizeAuction(action.payload);
    } catch (error) {
      logger.info('Attempted to finalize auctions: ', error.message);
    }

    try {
      yield startAuction(action.payload);
    } catch (error) {
      logger.info('Attempted to start auctions: ', error.message);
    }
  }
}
