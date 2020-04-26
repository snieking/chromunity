import React from "react";
import { Radio } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

interface Props {
  text: string;
  voteHandler: (option: string) => void;
}

const PollOption: React.FunctionComponent<Props> = props => {
  return (
    <>
      <Radio
        checked={false}
        onChange={() => props.voteHandler(props.text)}
        value={props.text}
        name={props.text}
        inputProps={{ "aria-label": props.text }}
      />
      <Typography id={props.text} component="span">
        {props.text}
      </Typography>
      <br/>
    </>
  );
};

export default PollOption;
