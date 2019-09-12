import * as React from "react";

import { RepresentativeReport } from "../../../types";
import { Card, CardContent, createStyles, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { parseContent } from "../../../util/text-parsing";
import { ReportOff } from "@material-ui/icons";
import { handleReport } from "../../../blockchain/RepresentativesService";
import { getUser, isRepresentative } from "../../../util/user-util";
import Timestamp from "../../common/Timestamp";
import { COLOR_RED } from "../../../theme";

export interface ReportCardProps {
  report: RepresentativeReport;
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
        {user != null && isRepresentative() ? (
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

export default ReportCard;
