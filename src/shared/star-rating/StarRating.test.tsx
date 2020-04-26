import React from "react";
import StarRatingPresentation from "./StarRatingPresentation";
import { shallow } from "enzyme";
import { IconButton } from "@material-ui/core";
import { StarRate, StarBorder } from "@material-ui/icons";

describe("<StarRating />", () => {
  const ratedBy = ["U1", "U2", "U3", "U4", "U5", "U6"];

  it("should render", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it("should not render <IconButton /> if no toggleRating", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} />);
    expect(wrapper.find(IconButton).exists()).toBeFalsy();
  });

  it("should render <IconButton /> if toggleRating provided", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} toggleRating={() => null} />);
    expect(wrapper.find(IconButton).exists()).toBeTruthy();
  });

  it("should have <StarRate /> if rated by me", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={true} toggleRating={() => null} />);
    const starRate = wrapper.find(StarRate);
    expect(starRate.exists()).toBeTruthy();
  });

  it("should have <StarBorder /> if not rated by me", () => {
    const wrapper = shallow(<StarRatingPresentation ratedBy={ratedBy} ratedByMe={false} toggleRating={() => null} />);
    const starBorder = wrapper.find(StarBorder);
    expect(starBorder.exists()).toBeTruthy();
  });
});
