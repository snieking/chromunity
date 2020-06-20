import React from 'react';

import { Container, Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import RepresentativeCard from './representative-card';
import ChromiaPageHeader from '../../../shared/chromia-page-header';
import { ChromunityUser } from '../../../types';
import ApplicationState from '../../../core/application-state';
import Tutorial from '../../../shared/tutorial';
import TutorialButton from '../../../shared/buttons/tutorial-button';
import representativesTutorialSteps from './tutorial-steps';

interface Props {
  representatives: string[];
  user: ChromunityUser;
}

class Representatives extends React.Component<Props> {
  renderTour() {
    return (
      <>
        <Tutorial steps={representativesTutorialSteps()} />
        <TutorialButton />
      </>
    );
  }

  render() {
    return (
      <Container fixed>
        <ChromiaPageHeader text="Representatives" />
        <br />
        <Grid container spacing={1}>
          {this.props.representatives.map((name) => (
            <RepresentativeCard user={this.props.user} name={name} key={name} />
          ))}
        </Grid>
        {this.renderTour()}
      </Container>
    );
  }
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives,
    user: store.account.user,
  };
};

export default connect(mapStateToProps, null)(Representatives);
