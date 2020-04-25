import { Theme } from "@material-ui/core";
import React from "react";
import { ApplicationState } from "../../core/store";
import { connect } from "react-redux";
import { COLOR_CHROMIA_LIGHT, COLOR_STEEL_BLUE } from "../../theme";

interface Props {
  theme: Theme;
}

const LinkedInLogo: React.FunctionComponent<Props> = (props: React.PropsWithChildren<Props>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={25}
      height={23}
      viewBox="0 0 64 64"
      version="1.1"
      preserveAspectRatio="xMidYMid"
    >
      <g>
        <path
          d="M1.15 21.7h13V61h-13zm46.55-1.3c-5.7 0-9.1 2.1-12.7 6.7v-5.4H22V61h13.1V39.7c0-4.5 2.3-8.9 7.5-8.9s8.3 4.4 8.3 8.8V61H64V38.7c0-15.5-10.5-18.3-16.3-18.3zM7.7 2.6C3.4 2.6 0 5.7 0 9.5s3.4 6.9 7.7 6.9 7.7-3.1 7.7-6.9S12 2.6 7.7 2.6z"
          fill={props.theme.palette.type === "dark" ? COLOR_CHROMIA_LIGHT : COLOR_STEEL_BLUE}
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

export default connect(mapStateToProps)(LinkedInLogo);
