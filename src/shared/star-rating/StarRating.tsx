import React, { useState, useEffect } from "react";
import { ChromunityUser } from "../../types";
import { ApplicationState } from "../../core/store";
import { connect } from "react-redux";
import StarRatingPresentation from "./StarRatingPresentation";
import { toLowerCase } from "../util/util";

interface Props {
  starRatingFetcher: () => Promise<string[]>;
  removeRating?: () => Promise<unknown>;
  incrementRating?: () => Promise<unknown>;
  user: ChromunityUser;
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

      if (ratedByMe() && props.removeRating) {
        props.removeRating().then(() => {
          setRatedBy(ratedBy.filter((u) => toLowerCase(u) !== toLowerCase(props.user.name)));
          setLoading(false);
        });
      } else if (!ratedByMe() && props.incrementRating) {
        props.incrementRating().then(() => {
          setRatedBy(ratedBy.concat([props.user.name]));
          setLoading(false);
        });
      }
    }
  }

  return (
    <StarRatingPresentation
      ratedBy={ratedBy}
      ratedByMe={ratedByMe()}
      toggleRating={props.incrementRating && props.removeRating ? toggleRating : null}
    />
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

export default connect(mapStateToProps, null)(StarRating);
