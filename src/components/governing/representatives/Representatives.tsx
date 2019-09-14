import React from "react";

import { Button, Card, CardContent, Container, Grid, TextField } from "@material-ui/core";
import RepresentativeCard from "./RepresentativeCard";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import { adminAddRepresentative, adminRemoveRepresentative } from "../../../blockchain/AdminService";
import { ChromunityUser } from "../../../types";
import { getUser } from "../../../util/user-util";
import { pageView } from "../../../GoogleAnalytics";
import { ApplicationState } from "../../../redux/Store";
import { loadRepresentatives } from "../../../redux/actions/RepresentativesActions";
import { connect } from "react-redux";

interface Props {
  representatives: string[];
  loadRepresentatives: typeof loadRepresentatives;
}

interface State {
  targetUsername: string;
  user: ChromunityUser;
}

class Representatives extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      targetUsername: "",
      user: getUser()
    };

    this.props.loadRepresentatives();
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
  }

  componentDidMount(): void {
    pageView();
  }

  render() {
    return (
      <Container fixed>
        <ChromiaPageHeader text="Representatives" />
        <Grid container spacing={1}>
          {this.props.representatives.map(name => (
            <RepresentativeCard name={name} key={name} />
          ))}
        </Grid>
        {this.renderAdminFunctions()}
      </Container>
    );
  }

  renderAdminFunctions() {
    const user: ChromunityUser = this.state.user;
    if (user != null && user.name === "admin") {
      return (
        <div>
          <br />
          <Card>
            <CardContent>
              <TextField
                autoFocus
                margin="dense"
                id="username"
                label="Username"
                onChange={this.handleUsernameChange}
                value={this.state.targetUsername}
                variant="outlined"
              />
              <br />
              <Button
                onClick={() =>
                  adminRemoveRepresentative(user, this.state.targetUsername).then(() => window.location.reload())
                }
                variant="outlined"
              >
                Remove representative
              </Button>
              <Button
                onClick={() =>
                  adminAddRepresentative(user, this.state.targetUsername).then(() => window.location.reload())
                }
                variant="outlined"
              >
                Add representative
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ targetUsername: event.target.value });
  }
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.representatives.representatives
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    loadRepresentatives: () => dispatch(loadRepresentatives())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Representatives);
