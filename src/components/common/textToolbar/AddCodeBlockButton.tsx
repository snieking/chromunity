import React from "react";
import { IconButton } from "@material-ui/core";
import CodeIcon from '@material-ui/icons/Code';

interface Props {
  addText: Function;
}

const AddCodeBlockButton: React.FunctionComponent<Props> = (props: Props) => {
  return <>
    <IconButton onClick={() => props.addText("```\n// Insert your code block here.\n```")}>
      <CodeIcon />
    </IconButton>
  </>;
};

export default AddCodeBlockButton;