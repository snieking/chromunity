import React from "react";
import { Socials } from "./socialTypes";
import { IconButton } from "@material-ui/core";
import TwitterLogo from "../../common/logos/TwitterLogo";
import * as config from "../../../config";
import LinkedInLogo from "../../common/logos/LinkedInLogo";

interface Props {
  socials: Socials;
}

const SocialBar: React.FunctionComponent<Props> = (props) => {
  const renderTwitter = () =>
    props.socials.twitter ? (
      <IconButton href={`https://twitter.com/${props.socials.twitter}`}>
        <TwitterLogo />
      </IconButton>
    ) : null;

    const renderLinkedIn = () =>
    props.socials.linkedin ? (
      <IconButton href={`https://linkedin.com/in/${props.socials.linkedin}`}>
        <LinkedInLogo />
      </IconButton>
    ) : null;

  return config.features.userSocialsEnabled ? <div>{renderTwitter()}{renderLinkedIn()}</div> : null;
};

export default SocialBar;
