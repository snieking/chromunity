import React from "react";
import { toggleTutorial } from "./redux/CommonActions";
import Tour from 'reactour'
import { connect } from "react-redux";
import { ApplicationState } from "../../store";
import { Theme } from "@material-ui/core";
import { COLOR_PURPLE, COLOR_STEEL_BLUE } from "../../theme";
import { ChromunityUser } from "../../types";


interface Props {
  steps: any[];
  theme: Theme;
  user: ChromunityUser;
  tutorial: boolean;
  toggleTutorial: typeof toggleTutorial;
}

const Tutorial: React.FunctionComponent<Props> = (props: React.PropsWithChildren<Props>) => {

  return (
    <Tour steps={props.steps}
          isOpen={props.user && props.tutorial}
          onRequestClose={props.toggleTutorial}
          accentColor={props.theme.palette.type === "dark" ? COLOR_PURPLE : COLOR_STEEL_BLUE}
    />
  )
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    tutorial: store.common.tutorial,
    theme: store.styling.theme,
    user: store.account.user
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    toggleTutorial: () => dispatch(toggleTutorial())
  }
};

export default connect(mapStateToProps, mapDispatchToProps) (Tutorial);