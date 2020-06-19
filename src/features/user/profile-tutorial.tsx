import React from "react";
import Tutorial from "../../shared/tutorial";
import TutorialButton from "../../shared/buttons/tutorial-button";
import { step } from "../../shared/tutorial-step";

const ProfileTutorial: React.FunctionComponent = () => {
  function steps() {
    return [
      step(".first-step", <p>This is a user page. Here you get an overview of the user and it's recent activity.</p>),
      step(
        '[data-tut="actions_stats"]',
        <p>
          How many followers the user has is displayed here. If you are logged in, clickable actions is also shown here.
        </p>
      ),
      step('[data-tut="bottom_stats"]', <p>More statistics of the user is displayed here.</p>),
      step('[data-tut="topics_nav"]', <p>Recent topics created by the user is listed here.</p>),
      step('[data-tut="replies_nav"]', <p>Recent replies on topics made by the user is listed here.</p>),
      step('[data-tut="channels_nav"]', <p>Channels that the user is following is listed here.</p>),
    ];
  }

  return (
    <>
      <Tutorial steps={steps()} />
      <TutorialButton />
    </>
  );
};

export default ProfileTutorial;
