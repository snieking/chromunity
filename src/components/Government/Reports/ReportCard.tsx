import * as React from 'react';

import {RepresentativeReport} from "../../../types";
import {Card, CardContent, IconButton, Tooltip, Typography} from "@material-ui/core";
import {parseContent} from "../../../util/text-parsing";
import {timeAgoReadable} from "../../../util/util";
import {ReportOff} from '@material-ui/icons';
import {handleReport} from '../../../blockchain/RepresentativesService';
import {getUser, isRepresentative} from '../../../util/user-util';

export interface ReportCardProps {
    report: RepresentativeReport;
}

const ReportCard: React.SFC<ReportCardProps> = (props: ReportCardProps) => {
    return (
        <Card key={props.report.id} className="gov-card">
            <CardContent>
                <Typography className="timestamp right" variant="body2" component="span">
                    {timeAgoReadable(props.report.timestamp)}
                </Typography>
                {isRepresentative() ?
                    <Tooltip title="Remove report">
                        <IconButton
                            aria-label="Report"
                            onClick={() => handleReport(getUser(), props.report.id).then(() => window.location.reload())}
                        >
                            <ReportOff className="red-color"/>
                        </IconButton>
                    </Tooltip>
                    : <div></div>
                }
                <Typography variant="subtitle1" color="textSecondary" component="span">
                    <span dangerouslySetInnerHTML={{__html: parseContent(props.report.text)}}/>
                </Typography>
            </CardContent>
        </Card>
    );
}

export default ReportCard;