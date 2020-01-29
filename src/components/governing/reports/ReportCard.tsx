import * as React from "react";

import { RepresentativeReport } from "../../../types";
import { Card, CardContent, createStyles, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { parseContent } from "../../../util/text-parsing";
import { ReportOff } from "@material-ui/icons";
import { handleReport } from "../../../blockchain/RepresentativesService";
import { getUser } from "../../../util/user-util";
import Timestamp from "../../common/Timestamp";
import { COLOR_RED } from "../../../theme";
import { ApplicationState } from "../../../redux/Store";
import { loadRepresentatives } from "../../../redux/actions/GovernmentActions";
import { connect } from "react-redux";
import { toLowerCase } from "../../../util/util";

export interface ReportCardProps {
  report: RepresentativeReport;
  representatives: string[];
  loadRepresentatives: typeof loadRepresentatives;
}

const useStyles = makeStyles(
  createStyles({
    iconRed: { color: COLOR_RED }
  })
);

const ReportCard: React.FunctionComponent<ReportCardProps> = (props: ReportCardProps) => {
  const classes = useStyles(props);
  const user = getUser();

  return (
    <Card key={props.report.id}>
      <CardContent>
        <Timestamp milliseconds={props.report.timestamp} />
        {user != null && props.representatives.includes(user.name.toLocaleLowerCase()) ? (
          <IconButton
            aria-label="Report"
            onClick={() => handleReport(user, props.report.id).then(() => window.location.reload())}
          >
            <Tooltip title="Remove report">
              <ReportOff className={classes.iconRed} />
            </Tooltip>
          </IconButton>
        ) : (
          <div />
        )}
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
    representatives: store.government.representatives.map(rep => toLowerCase(rep))
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    loadRepresentatives: () => dispatch(loadRepresentatives())
  }
};

export default connect(mapStateToProps, mapDispatchToProps) (ReportCard);
