import React from "react";
import Tutorial from "../../../shared/tutorial";
import TutorialButton from "../../../shared/buttons/tutorial-button";
import { step } from "../../../shared/tutorial-step";
import { ChromunityUser } from "../../../types";
import ApplicationState from "../../../core/application-state";
import { connect } from "react-redux";

interface Props {
  user: ChromunityUser;
}

const FullTopicTutorial: React.FunctionComponent<Props> = (props) => {

  function steps(): any[] {
    const steps: any[] = [
      step(
        ".first-step",
        <p>This is a topic. A topic contains hopefully some interesting subject to discuss with the community.</p>
      ),
      step(
        '[data-tut="star_btn"]',
        <>
          <p>If you like a topic, and are signed-in in, give it a star rating!</p>
          <p>Replies can also receive a star rating.</p>
        </>
      ),
    ];

    if (props.user != null) {
      steps.push(
        step(
          '[data-tut="subscribe_btn"]',
          <p>Subscribing to a post will keep you updated with notifications when someone replies to it.</p>
        )
      );

      steps.push(step('[data-tut="reply_btn"]', <p>Join in the conversation by sending a reply to the topic.</p>));

      steps.push(
        step(
          '[data-tut="report_btn"]',
          <p>
            If you find the topic inappropriate you can report it, sending a notice to representatives to have a look at
            it.
          </p>
        )
      );
    }

    return steps;
  }

  return (
    <>
        <Tutorial steps={steps()} />
        <TutorialButton />
      </>
  );
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(FullTopicTutorial);
