import React from "react";
import { Socials } from "./socialTypes";
import { IconButton } from "@material-ui/core";
import TwitterLogo from "../../static/footer/TwitterLogo";
import * as config from "../../../config";

interface Props {
  socials: Socials;
}

const SocialBar: React.FunctionComponent<Props> = (props) => {
  const renderTwitter = () =>
    props.socials.twitter ? (
      <IconButton href={props.socials.twitter}>
        <TwitterLogo />
      </IconButton>
    ) : null;

  return config.features.userSocialsEnabled ? <div>{renderTwitter()}</div> : null;
};

export default SocialBar;
