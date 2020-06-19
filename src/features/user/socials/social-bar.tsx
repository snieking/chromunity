import React from "react";
import { Socials } from "./social-types";
import { IconButton } from "@material-ui/core";
import TwitterLogo from "../../../shared/logos/twitter-logo";
import LinkedInLogo from "../../../shared/logos/linkedin-logo";
import GitHubLogo from "../../../shared/logos/github-logo";
import FacebookLogo from "../../../shared/logos/facebook-logo";

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

  const renderFacebook = () =>
    props.socials.facebook ? (
      <IconButton href={`https://facebook.com/${props.socials.facebook}`}>
        <FacebookLogo />
      </IconButton>
    ) : null;

  const renderGithub = () =>
    props.socials.github ? (
      <IconButton href={`https://github.com/${props.socials.github}`}>
        <GitHubLogo />
      </IconButton>
    ) : null;

  return (
    <div>
      {renderTwitter()}
      {renderLinkedIn()}
      {renderFacebook()}
      {renderGithub()}
    </div>
  );
};

export default SocialBar;
