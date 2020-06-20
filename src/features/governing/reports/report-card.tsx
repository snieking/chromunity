import * as React from 'react';

import { Card, CardContent, Typography } from '@material-ui/core';
import { RepresentativeReport } from '../../../types';
import { parseContent } from '../../../shared/util/text-parsing';
import Timestamp from '../../../shared/timestamp';

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
              __html: parseContent(props.report.text),
            }}
          />
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
