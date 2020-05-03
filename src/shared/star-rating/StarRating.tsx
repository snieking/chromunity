import React, { useState, useEffect } from "react";
import { ChromunityUser } from "../../types";
import { ApplicationState } from "../../core/store";
import { connect } from "react-redux";
import StarRatingPresentation from "./StarRatingPresentation";
import { toLowerCase } from "../util/util";
import { setRateLimited, setOperationPending } from "../redux/CommonActions";
import { setError } from "../../core/snackbar/redux/snackbarTypes";

interface Props {
  starRatingFetcher: () => Promise<string[]>;
  removeRating?: () => Promise<unknown>;
  incrementRating?: () => Promise<unknown>;
  user: ChromunityUser;
  rateLimited: boolean;
  setRateLimited: typeof setRateLimited;
  setError: typeof setError;
  setOperationPending: typeof setOperationPending;
}

const StarRating: React.FunctionComponent<Props> = (props) => {
  const [loading, setLoading] = useState(true);
  const [ratedBy, setRatedBy] = useState<string[]>([]);

  useEffect(() => {
    props.starRatingFetcher().then((raters) => {
      setRatedBy(raters);
      setLoading(false);
    });
    // eslint-disable-next-line
  }, []);

  function ratedByMe(): boolean {
    return props.user != null && ratedBy.map((u) => toLowerCase(u)).includes(toLowerCase(props.user.name));
  }

  function toggleRating() {
    if (!loading && props.user) {
      setLoading(true);
      props.setOperationPending(true);

      if (ratedByMe() && props.removeRating) {
        props
          .removeRating()
          .catch((error) => {
            props.setError(error.message);
            props.setRateLimited();
          })
          .then(() => setRatedBy(ratedBy.filter((u) => toLowerCase(u) !== toLowerCase(props.user.name))))
          .finally(() => {
            setLoading(false);
            props.setOperationPending(false);
          });
      } else if (!ratedByMe() && props.incrementRating) {
        props
          .incrementRating()
          .catch((error) => {
            props.setError(error.message);
            props.setRateLimited();
          })
          .then(() => setRatedBy(ratedBy.concat([props.user.name])))
          .finally(() => {
            setLoading(false);
            props.setOperationPending(false);
          });
      }
    }
  }

  return (
    <StarRatingPresentation
      ratedBy={ratedBy}
      ratedByMe={ratedByMe()}
      toggleRating={props.incrementRating && props.removeRating ? toggleRating : null}
      disabled={props.rateLimited}
    />
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    rateLimited: store.common.rateLimited,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setRateLimited: () => dispatch(setRateLimited()),
    setError: (msg: string) => dispatch(setError(msg)),
    setOperationPending: (pending: boolean) => dispatch(setOperationPending(pending)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StarRating);
