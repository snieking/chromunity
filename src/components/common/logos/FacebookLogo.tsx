import React from "react";
import { Theme } from "@material-ui/core";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";
import { COLOR_CHROMIA_LIGHT, COLOR_STEEL_BLUE, COLOR_CHROMIA_DARK_LIGHTER, COLOR_OFF_WHITE } from "../../../theme";

interface Props {
  theme: Theme;
}

const FacebookLogo: React.FunctionComponent<Props> = (props: React.PropsWithChildren<Props>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={25}
      height={25}
      viewBox="0 0 256 256"
      version="1.1"
      preserveAspectRatio="xMidYMid"
    >
      <g>
        <path
          d="M241.871,256.001 C249.673,256.001 256,249.675 256,241.872 L256,14.129 C256,6.325 249.673,0 241.871,0 L14.129,0 C6.324,0 0,6.325 0,14.129 L0,241.872 C0,249.675 6.324,256.001 14.129,256.001 L241.871,256.001"
          fill={props.theme.palette.type === "dark" ? COLOR_CHROMIA_LIGHT : COLOR_STEEL_BLUE}
        />
        <path
          d="M176.635,256.001 L176.635,156.864 L209.912,156.864 L214.894,118.229 L176.635,118.229 L176.635,93.561 C176.635,82.375 179.742,74.752 195.783,74.752 L216.242,74.743 L216.242,40.188 C212.702,39.717 200.558,38.665 186.43,38.665 C156.932,38.665 136.738,56.67 136.738,89.736 L136.738,118.229 L103.376,118.229 L103.376,156.864 L136.738,156.864 L136.738,256.001 L176.635,256.001"
          fill={props.theme.palette.type === "dark" ? COLOR_CHROMIA_DARK_LIGHTER : COLOR_OFF_WHITE}
        />
      </g>
    </svg>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    theme: store.styling.theme,
  };
};

export default connect(mapStateToProps)(FacebookLogo);
