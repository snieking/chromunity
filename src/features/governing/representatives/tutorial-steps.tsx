import React from "react";
import { COLOR_CHROMIA_DARK } from "../../../theme";

const representativesTutorialSteps = () => {
  const steps = [
    {
      selector: ".first-step",
      content: () => (
        <div style={{ color: COLOR_CHROMIA_DARK }}>
          <p>The current representatives are listed here.</p>
          <p>
            A representative has super-user powers until the next election wraps up, or the representative misbehaves
            and gets voted out by other representatives.
          </p>
        </div>
      )
    },
    {
      selector: ".second-step",
      content: () => (
        <div style={{ color: COLOR_CHROMIA_DARK }}>
          <p>A representative is tasked with representing the Chromunity, being a user that others can look up to.</p>
          <p>
            A representative moderates the community by removing toxic posts, a representative also has the power to
            suspend users who doesn't behave.
          </p>
        </div>
      )
    },
    {
      selector: ".third-step",
      content: () => (
        <div style={{ color: COLOR_CHROMIA_DARK }}>
          <p>With great powers, comes great responsibilities. Therefore, representatives are always accountable.</p>
          <p>
            A governing log is publicly available here on Chromunity so that if a representative misbehaves, it will
            be visible and other representatives can take action.
          </p>
        </div>
      )
    }
  ];

  return steps;
}

export default representativesTutorialSteps;
