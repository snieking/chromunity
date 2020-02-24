import React from "react";

import { Container, Grid } from "@material-ui/core";
import RepresentativeCard from "./RepresentativeCard";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import { ChromunityUser } from "../../../types";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";

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
      </Container>
    );
  }

  handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ targetUsername: event.target.value });
  }
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives,
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(Representatives);
