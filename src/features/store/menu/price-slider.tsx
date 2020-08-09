import React from 'react';
import { Slider, makeStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import ApplicationState from '../../../core/application-state';
import { updatePriceRangeFilter } from '../redux/store-actions';
import { nFormatter } from '../../../shared/util/util';

interface Props {
  min: number;
  max: number;
  updatePriceRangeFilter: typeof updatePriceRangeFilter;
}

const useStyles = makeStyles({
  root: {
    width: '80%',
    margin: '0 auto',
  },
});

const maxPrice = 10000;
const minPrice = 0;

const PriceSlider: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  const handleChange = (event: any, newValue: number | number[]) => {
    const newValues = newValue as number[];
    props.updatePriceRangeFilter({ min: newValues[0], max: newValues[1] });
  };

  return (
    <div className={classes.root}>
      <Slider
        value={[props.min, props.max]}
        onChange={handleChange}
        valueLabelDisplay="auto"
        aria-labelledby="range-slider"
        min={minPrice}
        max={maxPrice}
        step={100}
        valueLabelFormat={(x) => nFormatter(x, 1)}
      />
    </div>
  );
};

const mapStateToProps = (state: ApplicationState) => {
  return {
    min: state.store.minPrice,
    max: state.store.maxPrice,
  };
};

const mapDispatchToProps = {
  updatePriceRangeFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(PriceSlider);
