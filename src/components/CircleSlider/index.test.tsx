import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import CircleSlider from './index';

describe('<CircleSlider />', () => {
  it('render CircleSlider', () => {
    const wrapper = shallow(
      <CircleSlider
        outerRadius={145}
        wrapperColor="#23242e"
        fontSize={108}
        fontColor="white"
        subFontColor="white"
        subFontValue="current 18℃"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
