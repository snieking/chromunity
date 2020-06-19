import * as React from "react";
import { RepresentativeReport } from "../../../types";
import { Container } from "@material-ui/core";
import { updateReportsLastRead } from "../../../core/services/representatives-service";
import ReportCard from "./report-card";
import ChromiaPageHeader from "../../../shared/chromia-page-header";
import { connect } from "react-redux";
import ApplicationState from "../../../core/application-state";

interface Props {
  reports: RepresentativeReport[];
}

class Reports extends React.Component<Props> {

  componentDidMount() {
    updateReportsLastRead(Date.now());
  }

  render() {
    return (
      <Container>
        <ChromiaPageHeader text="Reports" />
        {this.props.reports.map(report => (
          <ReportCard key={report.id} report={report} />
        ))}
      </Container>
    );
  }
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    reports: store.government.reports
  };
};

export default connect(mapStateToProps, null)(Reports);
