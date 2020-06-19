import React from "react";
import { toggleTutorial } from "./redux/CommonActions";
import Tour from 'reactour'
import { connect } from "react-redux";
import ApplicationState from "../core/application-state";
import { Theme } from "@material-ui/core";
import { COLOR_SOFT_PINK, COLOR_STEEL_BLUE } from "../theme";


interface Props {
  steps: any[];
  theme: Theme;
  tutorial: boolean;
  toggleTutorial: typeof toggleTutorial;
}

const Tutorial: React.FunctionComponent<Props> = (props: React.PropsWithChildren<Props>) => {

  return (
    <Tour steps={props.steps}
      isOpen={props.tutorial}
      onRequestClose={props.toggleTutorial}
      accentColor={props.theme.palette.type === "dark" ? COLOR_SOFT_PINK : COLOR_STEEL_BLUE}
    />
  )
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    tutorial: store.common.tutorial,
    theme: store.styling.theme
  }
};

const mapDispatchToProps = {
  toggleTutorial
};

export default connect(mapStateToProps, mapDispatchToProps)(Tutorial);
