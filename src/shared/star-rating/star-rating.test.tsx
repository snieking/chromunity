import React from "react";
import StarRatingPresentation from "./star-rating-presentation";
import { shallow } from "enzyme";
import { IconButton } from "@material-ui/core";
import { StarRate, StarBorder } from "@material-ui/icons";

describe("<StarRating />", () => {
  const ratedBy = ["U1", "U2", "U3", "U4", "U5", "U6"];

  it("should render", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} disabled={false} />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it("should not render <IconButton /> if no toggleRating", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} disabled={false} />);
    expect(wrapper.find(IconButton).exists()).toBeFalsy();
  });

  it("should render <IconButton /> if toggleRating provided", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} toggleRating={() => null} disabled={false} />);
    expect(wrapper.find(IconButton).exists()).toBeTruthy();
  });

  it("should render a disabled <IconButton /> if disabled prop", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} toggleRating={() => null} disabled={true} />);
    expect(wrapper.find(IconButton).props()).toHaveProperty("disabled", true);
  });

  it("should render a non-disabled <IconButton />", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} toggleRating={() => null} disabled={false} />);
    expect(wrapper.find(IconButton).props()).toHaveProperty("disabled", false);
  });

  it("should have <StarRate /> if rated by me", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={true} toggleRating={() => null} disabled={false} />);
    const starRate = wrapper.find(StarRate);
    expect(starRate.exists()).toBeTruthy();
  });

  it("should have <StarBorder /> if not rated by me", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} toggleRating={() => null} disabled={false} />);
    const starBorder = wrapper.find(StarBorder);
    expect(starBorder.exists()).toBeTruthy();
  });
});
