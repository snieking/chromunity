import * as React from "react";

import { RepresentativeReport } from "../../../types";
import { Card, CardContent, Typography } from "@material-ui/core";
import { parseContent } from "../../../util/text-parsing";
import Timestamp from "../../common/Timestamp";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";

interface ReportCardProps {
  report: RepresentativeReport;
}

const ReportCard: React.FunctionComponent<ReportCardProps> = (props: ReportCardProps) => {
  return (
    <Card key={props.report.id}>
      <CardContent>
        <Timestamp milliseconds={props.report.timestamp} />
        <Typography variant="subtitle1" component="span">
          <span
            dangerouslySetInnerHTML={{
              __html: parseContent(props.report.text)
            }}
          />
        </Typography>
      </CardContent>
    </Card>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {

  };
};

export default connect(mapStateToProps, null)(ReportCard);
