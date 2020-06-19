import React from "react";
import ChromiaPageHeader from "../../shared/chromia-page-header";
import { RepresentativeAction } from "../../types";
import {
  getAllRepresentativeActionsPriorToTimestamp,
  updateLogbookLastRead,
} from "../../core/services/representatives-service";
import { Card, CardContent, Container, Typography } from "@material-ui/core";
import LoadMoreButton from "../../shared/buttons/load-more-button";
import { parseContent } from "../../shared/util/text-parsing";
import Timestamp from "../../shared/timestamp";
import { connect } from "react-redux";
import { setQueryPending } from "../../shared/redux/common-actions";

interface GovLogState {
  actions: RepresentativeAction[];
  couldExistOlderActions: boolean;
}

interface Props {
  setQueryPending: typeof setQueryPending;
}

const actionsPageSize = 25;

class GovLog extends React.Component<Props, GovLogState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      actions: [],
      couldExistOlderActions: false,
    };

    this.retrieveActions = this.retrieveActions.bind(this);
  }

  componentDidMount() {
    this.retrieveActions();
    updateLogbookLastRead(Date.now());
  }

  render() {
    return (
      <Container>
        <ChromiaPageHeader text="Logbook" />
        {this.state.actions.map((action) => this.representativeActionCard(action))}
        {this.renderLoadMoreButton()}
      </Container>
    );
  }

  representativeActionCard(action: RepresentativeAction) {
    return (
      <Card key={action.id}>
        <CardContent>
          <Timestamp milliseconds={action.timestamp} />
          <Typography variant="subtitle1" component="p">
            <span dangerouslySetInnerHTML={{ __html: parseContent(action.action) }} />
          </Typography>
        </CardContent>
      </Card>
    );
  }

  retrieveActions() {
    this.props.setQueryPending(true);
    const timestamp: number =
      this.state.actions.length !== 0 ? this.state.actions[this.state.actions.length - 1].timestamp : Date.now();

    getAllRepresentativeActionsPriorToTimestamp(timestamp, actionsPageSize)
      .then((actions) => {
        this.setState((prevState) => ({
          actions: Array.from(new Set(prevState.actions.concat(actions))),
          isLoading: false,
          couldExistOlderActions: actions.length >= actionsPageSize,
        }));
      })
      .catch(() => this.setState({ couldExistOlderActions: false }))
      .finally(() => this.props.setQueryPending(false));
  }

  renderLoadMoreButton() {
    if (this.state.couldExistOlderActions) {
      return <LoadMoreButton onClick={this.retrieveActions} />;
    }
  }
}

const mapDispatchToProps = {
  setQueryPending
};

export default connect(null, mapDispatchToProps)(GovLog);
