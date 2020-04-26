import React from "react";
import { IconButton } from "@material-ui/core";
import CodeIcon from "@material-ui/icons/Code";
import Tooltip from "@material-ui/core/Tooltip";

interface Props {
  addText: Function;
}

const AddCodeBlockButton: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <>
      <Tooltip title="Code Block">
        <IconButton onClick={() => props.addText("```\n// Insert your code block here.\n```")}>
          <CodeIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default AddCodeBlockButton;
