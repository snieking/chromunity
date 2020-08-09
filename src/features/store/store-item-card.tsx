import React, { useState, useEffect } from 'react';
import {
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
} from '@material-ui/core';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import { connect } from 'react-redux';
import { StoreItem, Bid } from './store.model';
import ApplicationState from '../../core/application-state';
import { COLOR_OFF_WHITE, COLOR_CHROMIA_DARK } from '../../theme';
import { bidOnItem } from './redux/store-actions';
import { ChromunityUser } from '../../types';
import NameBadge from '../../shared/name-displays/name-badge';
import { getCurrentBid } from './store.service';
import BidDialog from './bid-dialog';
import { toLowerCase, useInterval } from '../../shared/util/util';

interface Props {
  item: StoreItem;
  isOnAuction: boolean;
  user: ChromunityUser;
  ownedItems: StoreItem[];
  minPrice: number;
  maxPrice: number;
  kudos: number;
  bidOnItem: typeof bidOnItem;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
    icon: {
      color: theme.palette.type === 'dark' ? COLOR_OFF_WHITE : COLOR_CHROMIA_DARK,
      position: 'relative',
      top: '3px',
      marginRight: '5px',
    },
    purchased: {
      opacity: 0.6,
    },
    itemPreview: {
      margin: '10px',
    },
  })
);

const StoreItemCard: React.FunctionComponent<Props> = (props) => {
  const [currentBid, setCurrentBid] = useState(1);
  const [currentBidder, setCurrentBidder] = useState('');
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    getBidder(props.isOnAuction, props.item);
  }, [props.isOnAuction, props.item]);

  useInterval(() => getBidder(props.isOnAuction, props.item), 10000);

  const isAlreadyOwned = (): boolean => props.ownedItems.map((i) => i.id).includes(props.item.id);
  const isHighestBidder = (): boolean =>
    props.user && currentBidder && toLowerCase(currentBidder) === toLowerCase(props.user.name);

  const openPurchaseDialog = (): void => setPurchaseDialogOpen(true);
  const closePurchaseDialog = (): void => setPurchaseDialogOpen(false);

  function getBidder(isOnAction: boolean, item: StoreItem) {
    if (isOnAction && item) {
      getCurrentBid(item).then((bid: Bid) => {
        if (bid) {
          setCurrentBid(bid.amount);
          setCurrentBidder(bid.bidder);
        }
      });
    }
  }

  function makeMeHighestBidder(amount: number) {
    setCurrentBid(amount);
    setCurrentBidder(props.user.name);
  }

  function getCardContent() {
    if (props.item.category === 'Name Coloring') {
      return <NameBadge name={props.user.name} styleId={props.item.id} />;
    }
  }

  if (props.isOnAuction && (currentBid < props.minPrice || currentBid > props.maxPrice)) {
    return null;
  }

  return (
    <Card className={`${isAlreadyOwned() ? classes.purchased : ''}`}>
      <CardHeader
        title={
          <Typography variant="h6" component="h6">
            {props.item.name}
          </Typography>
        }
        subheader={
          props.isOnAuction && (
            <>
              <AccountBalanceIcon className={classes.icon} fontSize="small" />
              <Typography component="span" variant="body1">
                {currentBid}
              </Typography>
            </>
          )
        }
      />
      <CardContent>
        <div className={classes.itemPreview}>{getCardContent()}</div>
        <Typography variant="body2" color="textSecondary" component="p">
          {props.item.description}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <BidDialog
          open={purchaseDialogOpen}
          item={props.item}
          currentBid={currentBid}
          onClose={closePurchaseDialog}
          onSuccess={makeMeHighestBidder}
        />
        <Button
          variant="outlined"
          color="primary"
          disabled={isAlreadyOwned() || isHighestBidder() || props.kudos <= currentBid}
          onClick={openPurchaseDialog}
        >
          {isAlreadyOwned() ? 'Purchased' : 'Bid'}
        </Button>
      </CardActions>
    </Card>
  );
};

const mapStateToProps = (state: ApplicationState) => {
  return {
    ownedItems: state.store.ownedItems,
    user: state.account.user,
    minPrice: state.store.minPrice,
    maxPrice: state.store.maxPrice,
    kudos: state.account.kudos,
  };
};

const mapDispatchToProps = {
  bidOnItem,
};

export default connect(mapStateToProps, mapDispatchToProps)(StoreItemCard);
