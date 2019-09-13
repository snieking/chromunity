import React from "react";

import { Button, Card, CardContent, Container, Grid, TextField } from "@material-ui/core";
import { getRepresentatives } from "../../../blockchain/RepresentativesService";
import RepresentativeCard from "./RepresentativeCard";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import { adminAddRepresentative, adminRemoveRepresentative } from "../../../blockchain/AdminService";
import { ChromunityUser } from "../../../types";
import { getUser } from "../../../util/user-util";
import { pageView } from "../../../GoogleAnalytics";

export interface RepresentativesState {
  representatives: string[];
  targetUsername: string;
  user: ChromunityUser;
}

class Representatives extends React.Component<{}, RepresentativesState> {
  constructor(props: any) {
    super(props);
    this.state = {
      representatives: [],
      targetUsername: "",
      user: getUser()
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
  }

  componentDidMount(): void {
    getRepresentatives().then((representatives: string[]) =>
      this.setState({
        representatives: representatives
      })
    );

    pageView();
  }

  render() {
    return (
      <Container fixed>
        <ChromiaPageHeader text="Representatives" />
        <Grid container spacing={1}>
          {this.state.representatives.map(name => (
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

export default Representatives;
