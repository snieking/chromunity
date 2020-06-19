import 'jsdom-global/register';
import React from "react";
import { shallow } from "enzyme";
import { AuthenticationStep } from "../../redux/account-types";
import VaultLoginPresentation from "./vault-login-presentation";
import ChromiaPageHeader from "../../../../shared/chromia-page-header";
import { CircularProgress } from '@material-ui/core';

describe("<VaultLogin />", () => {
  it("renders", () => {
    const wrapper = createWrapper(null);
    expect(wrapper.exists()).toBeTruthy();
  });

  it("should contain page header", () => {
    const wrapper = createWrapper(null);
    expect(wrapper.find(ChromiaPageHeader).length).toBe(1);
  });

});

function createWrapper(authenticationStep: AuthenticationStep, loading = true) {
  return shallow(
    <VaultLoginPresentation
      authenticationStep={authenticationStep}
      login={() => console.log("Signed in!")}
    />
  );
}
