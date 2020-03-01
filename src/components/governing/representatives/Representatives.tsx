import React from "react";

import { Container, Grid } from "@material-ui/core";
import RepresentativeCard from "./RepresentativeCard";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import { ChromunityUser } from "../../../types";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";
import Tutorial from "../../common/Tutorial";
import TutorialButton from "../../buttons/TutorialButton";
import { COLOR_CHROMIA_DARK } from "../../../theme";

interface Props {
  representatives: string[];
  user: ChromunityUser;
}

interface State {
  targetUsername: string;
}

class Representatives extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      targetUsername: ""
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
  }

  render() {
    return (
      <Container fixed>
        <ChromiaPageHeader text="Representatives" />
        <br />
        <Grid container spacing={1}>
          {this.props.representatives.map(name => (
            <RepresentativeCard name={name} key={name} />
          ))}
        </Grid>
        {this.renderTour()}
      </Container>
    );
  }

  handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ targetUsername: event.target.value });
  }

  renderTour() {
    return (
      <>
        <Tutorial steps={this.steps()} />
        <TutorialButton />
      </>
    );
  }

  steps(): any[] {
    const steps = [
      {
        selector: ".first-step",
        content: () => (
          <div style={{ color: COLOR_CHROMIA_DARK }}>
            <p>The current representatives are listed here.</p>
            <p>
              A representative has super-user powers until the next election wraps up, or the representative misbehaves
              and gets voted out by other representatives.
            </p>
          </div>
        )
      },
      {
        selector: ".second-step",
        content: () => (
          <div style={{ color: COLOR_CHROMIA_DARK }}>
            <p>A representative is tasked with representing the Chromunity, being a user that others can look up to.</p>
            <p>
              A representative moderates the community by removing toxic posts, a representative also has the power to
              suspend users who doesn't behave.
            </p>
          </div>
        )
      },
      {
        selector: ".third-step",
        content: () => (
          <div style={{ color: COLOR_CHROMIA_DARK }}>
            <p>With great powers, comes great responsibilities. Therefore, representatives are always accountable.</p>
            <p>
              A governing log is publicly available here on Chromunity so that if a representative misbehaves, it will
              be visible and other representatives can take action.
            </p>
          </div>
        )
      }
    ];

    return steps;
  }
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives,
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(Representatives);
