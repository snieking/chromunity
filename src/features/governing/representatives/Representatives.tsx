import React from "react";

import { Container, Grid } from "@material-ui/core";
import RepresentativeCard from "./RepresentativeCard";
import ChromiaPageHeader from "../../../shared/ChromiaPageHeader";
import { ChromunityUser } from "../../../types";
import ApplicationState from "../../../core/application-state";
import { connect } from "react-redux";
import Tutorial from "../../../shared/Tutorial";
import TutorialButton from "../../../shared/buttons/TutorialButton";
import representativesTutorialSteps from "./tutorial-steps";

interface Props {
  representatives: string[];
  user: ChromunityUser;
}

class Representatives extends React.Component<Props> {

  render() {
    return (
      <Container fixed>
        <ChromiaPageHeader text="Representatives" />
        <br />
        <Grid container spacing={1}>
          {this.props.representatives.map(name => (
            <RepresentativeCard user={this.props.user} name={name} key={name} />
          ))}
        </Grid>
        {this.renderTour()}
      </Container>
    );
  }

  renderTour() {
    return (
      <>
        <Tutorial steps={representativesTutorialSteps()} />
        <TutorialButton />
      </>
    );
  }
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives,
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(Representatives);
