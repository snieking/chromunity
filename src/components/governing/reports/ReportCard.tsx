import * as React from "react";

import { ChromunityUser, RepresentativeReport } from "../../../types";
import { Card, CardContent, createStyles, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { parseContent } from "../../../util/text-parsing";
import { ReportOff } from "@material-ui/icons";
import { handleReport } from "../../../blockchain/RepresentativesService";
import Timestamp from "../../common/Timestamp";
import { COLOR_RED } from "../../../theme";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";
import { toLowerCase } from "../../../util/util";

const useStyles = makeStyles(
  createStyles({
    iconRed: { color: COLOR_RED }
  })
);

interface ReportCardProps {
  report: RepresentativeReport;
  representatives: string[];
  user: ChromunityUser;
}

const ReportCard: React.FunctionComponent<ReportCardProps> = (props: ReportCardProps) => {
  const classes = useStyles(props);

  return (
    <Card key={props.report.id}>
      <CardContent>
        <Timestamp milliseconds={props.report.timestamp} />
        {props.user != null && props.representatives.includes(props.user.name.toLocaleLowerCase()) ? (
          <IconButton
            aria-label="Report"
            onClick={() => handleReport(props.user, props.report.id).then(() => window.location.reload())}
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
    representatives: store.government.representatives.map(rep => toLowerCase(rep)),
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(ReportCard);
