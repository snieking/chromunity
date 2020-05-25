import React, { useEffect, useState } from "react";
import PinDropIcon from "@material-ui/icons/PinDrop";
import { ApplicationState } from "../../../core/store";
import { ChromunityUser } from "../../../types";
import { connect } from "react-redux";
import { toLowerCase } from "../../../shared/util/util";
import { IconButton, Tooltip } from "@material-ui/core";
import { pinTopic, checkPinnedTopicByRep } from "../../governing/redux/govActions";
import { COLOR_ORANGE } from "../../../theme";
import ConfirmDialog from "../../../shared/ConfirmDialog";

interface Props {
  topicId: string;
  user: ChromunityUser;
  rateLimited: boolean;
  representatives: string[];
  topicIdPinnedByMe: string;
  pinTopic: typeof pinTopic;
  checkPinnedByRep: typeof checkPinnedTopicByRep;
}

const PinButton: React.FunctionComponent<Props> = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (isRepresentative()) {
      props.checkPinnedByRep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.representatives, props.user]);

  function isRepresentative() {
    return props.user && props.representatives && props.representatives.includes(toLowerCase(props.user.name));
  }

  function isPinnedByMe() {
    return isRepresentative() && props.topicIdPinnedByMe && props.topicIdPinnedByMe === props.topicId;
  }

  function confirm() {
    setDialogOpen(false);
    props.pinTopic(props.topicId);
  }

  function pinButton() {
    return (
      <>
        <ConfirmDialog
          text="You may only have one active pin at the same time."
          subText=" Topics with the most pins from representatives will be displayed at the top."
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={confirm}
        />
        <Tooltip title={isPinnedByMe() ? "Remove pin" : "Pin"}>
          <IconButton disabled={props.rateLimited} onClick={() => setDialogOpen(true)}>
            <PinDropIcon style={{ color: isPinnedByMe() ? COLOR_ORANGE : "" }} />
          </IconButton>
        </Tooltip>
      </>
    );
  }

  return isRepresentative() && pinButton();
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    rateLimited: store.common.rateLimited,
    topicIdPinnedByMe: store.government.topicIdPinnedByMe,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    pinTopic: (topicId: string) => dispatch(pinTopic(topicId)),
    checkPinnedByRep: () => dispatch(checkPinnedTopicByRep()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PinButton);
