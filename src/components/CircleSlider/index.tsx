/* eslint-disable react/no-array-index-key */
import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  PanResponder,
  View,
  GestureResponderEvent,
  StyleSheet,
  Text as RNText,
  Image,
} from 'react-native';
import Svg, { Path, LinearGradient, Defs, Stop } from 'react-native-svg';
import extractBrush from 'react-native-svg/lib/module/lib/extract/extractBrush';
import { CircularSliderProps } from './index.type';
import {
  calcIsRange,
  getActiveSliderPath,
  getCurrentAngle,
  getMarkerScalePath,
  getPointerPosition,
  getRealValue,
  getSliderPath,
  getTargetAngle,
} from './utils';
import { pointer } from './res';

const CircularSlider: React.FC<CircularSliderProps> = props => {
  const {
    outerRadius = 145,
    wrapperColor = '#181c25',
    sliderColor = '#FF4545',
    trackColor = '#2D3749',
    scaleColor = '#2D3749',
    activeScaleColor = '#FF4545',
    value = 0,
    min = 0,
    max = 100,
    trackWidth = 5, // 滑道宽度
    sliderWidth = 15, // 轨道宽度
    scaleLength = 10,
    scaleWidth = 2,
    responseWidth = 20,
    activeSliderDistance = 30,
    fontColor = '#FF4545',
    subFontColor = 'white',
    fontSize = 80,
    subFontSize = 24,
    subFontValue,
    onMove,
    onRelease,
    disabled = false,
  } = props;

  let moving = false; // 是否可以移动
  let currentAngle = 0; // 当前角度
  let prevLocationX = 0; // 上一个位置的x坐标
  let prevLocationY = 0; // 上一个位置的y坐标
  let prevAngle = 0; // 上一个角度
  let overMaxRange = false; // 是否超出最大角度
  let overMinRange = false; // 是否超出最小角度

  let animateId = 0;
  let isAnimating = false;
  const activeRef: any = useRef();
  const scaleRefs: any = useRef([]);

  const terminalAngle = -350; // 刻度线显示的最大角度

  const trackRadius = outerRadius - activeSliderDistance; // 内滑道圆的半径

  const sliderRadius: number = outerRadius - activeSliderDistance - sliderWidth / 2; // 内滑条圆的半径

  const scaleRadius = outerRadius - activeSliderDistance / 2; // 刻度中心所在圆的半径

  const outerScaleRadius: number = scaleRadius + scaleLength / 2; // 刻度外圈圆的半径
  const innerScaleRadius: number = scaleRadius - scaleLength / 2; // 刻度内圈圆的半径

  const innerRadius = outerRadius - activeSliderDistance - sliderWidth / 2;

  const pointerRadius: number = innerRadius - 12; // 内圈指针的圆的半径

  const markerScaleCount = max > 40 ? max / 2 : max;
  const markerScales: any[] = new Array(markerScaleCount + 1).fill(
    (item: any, index: number) => index
  ); // 显示刻度的数组

  const [angle, setAngle] = useState(0);
  const [data, setData] = useState(getRealValue(min, max, value));

  const [pointerX, setPointX] = useState(0);
  const [pointerY, setPointY] = useState(0);
  const [pointerTransform, setPointerTransform] = useState(0);

  // 开始更新路径
  const startUpdatingAnimation = () => {
    if (!isAnimating) {
      currentAngle = 0;
      isAnimating = true;
      playUpdatingAnimation();
    }
  };

  const updateActiveSliderPath = () => {
    // 更新路径
    activeRef.current?.setNativeProps({
      d: getActiveSliderPath(
        currentAngle,
        sliderRadius + +sliderWidth / 2,
        terminalAngle,
        outerRadius
      ),
    });

    // 更新刻度
    markerScales.forEach((item, index) => {
      const { hasSlidered } = getPathRelative(currentAngle, index);
      scaleRefs?.current?.[index]?.setNativeProps({
        stroke: hasSlidered
          ? disabled
            ? extractBrush(scaleColor)
            : extractBrush(activeScaleColor)
          : extractBrush(scaleColor),
      });
    });
  };

  const updatingActiveSliderPath = () => {
    const targetAngle = getTargetAngle(value, min, max, terminalAngle);
    updateActiveSliderPath();
    if (currentAngle <= targetAngle) {
      currentAngle = targetAngle;
      stopAnimation();
    }
  };

  const playUpdatingAnimation = () => {
    const targetAngle = getTargetAngle(value, min, max, terminalAngle);
    const step = targetAngle / (500 / 20);
    updatingActiveSliderPath();
    const stepTerminalAngle = currentAngle + step;

    if (stepTerminalAngle <= targetAngle) {
      currentAngle = targetAngle;
    } else {
      currentAngle = stepTerminalAngle;
    }

    if (isAnimating && currentAngle >= terminalAngle) {
      animateId = requestAnimationFrame(playUpdatingAnimation);
    } else {
      stopAnimation();
    }
  };

  useEffect(() => {
    setData(value);
    setPointerPosition();
  }, [value]);

  useEffect(() => {
    startUpdatingAnimation();
  }, []);

  // 刻度值处理
  const getPathRelative = (_angle: number, index: number) => {
    const step = terminalAngle / markerScaleCount;
    const lineAngle = index * step;

    // 角度均为负数进行比较
    const hasSlidered = _angle <= lineAngle;
    const isLineAngle = Math.abs(lineAngle - _angle) <= 0.0001;

    return { hasSlidered, lineAngle, isLineAngle };
  };

  const stopAnimation = () => {
    if (isAnimating) {
      cancelAnimationFrame(animateId);
    }
    isAnimating = false;
  };

  const setPointerPosition = () => {
    const { x, y, transform } = getPointerPosition(
      value,
      min,
      max,
      terminalAngle,
      pointerRadius,
      outerRadius
    );
    setPointX(x);
    setPointY(y);
    setPointerTransform(transform);
  };
  const stopMove = (realValue: number, isMax = false, isEnd: boolean, callback) => {
    stopAnimation();
    setAngle(isMax ? terminalAngle : currentAngle);
    callback(isMax ? max : realValue);
  };

  // 越界处理
  const setIsOverRange = (locationX: number, locationY: number) => {
    const _currentAngle = getCurrentAngle(locationX, locationY, outerRadius);
    if (prevLocationX && prevLocationY) {
      const dx = locationX - prevLocationX;
      const dy = locationY - prevLocationY;

      // 顺时针旋转越界
      if (
        (prevAngle !== undefined &&
          prevAngle <= -310 &&
          prevAngle >= terminalAngle &&
          dx >= 0 &&
          _currentAngle - prevAngle > 300) ||
        overMaxRange
      ) {
        if (!overMaxRange) {
          overMaxRange = true;
          currentAngle = -350;
          stopMove(max, true, false, onMove);
        }
      }
      // 解除顺时针旋转越界
      if (
        _currentAngle >= terminalAngle &&
        _currentAngle <= -310 &&
        dx <= 0 &&
        dy >= 0 &&
        overMaxRange
      ) {
        overMaxRange = false;
      }

      // 逆时针越界
      if (
        _currentAngle >= terminalAngle &&
        _currentAngle <= -310 &&
        dx <= 0 &&
        dy >= 0 &&
        overMaxRange
      ) {
        overMaxRange = false;
      }

      // 逆时针旋转越界
      if (
        (prevAngle !== undefined &&
          prevAngle <= 0 &&
          prevAngle >= -60 &&
          dx <= 0 &&
          prevAngle - _currentAngle > 300) ||
        overMinRange
      ) {
        if (!overMinRange) {
          overMinRange = true;
          currentAngle = 0;
          stopMove(min, false, false, onMove);
        }
      }

      // 解除逆时针越界
      if (_currentAngle <= 0 && _currentAngle >= -60 && dx >= 0 && dy >= 0 && overMinRange) {
        overMinRange = false;
      }
    }
  };

  // 移动处理
  const handleMove = (e: GestureResponderEvent, isEnd: boolean, func: any) => {
    const { locationX, locationY } = e.nativeEvent;
    if (!isEnd || moving) {
      setIsOverRange(locationX, locationY);
    } else {
      overMinRange = false;
      overMaxRange = false;
    }

    prevLocationX = locationX;
    prevLocationY = locationY;
    if (overMinRange || overMaxRange) {
      stopAnimation();
      return;
    }
    const moveAngle = Math.max(getCurrentAngle(locationX, locationY, outerRadius), terminalAngle);

    // 根据角度计算出的值
    const currentValue = min + (moveAngle * (max - min)) / terminalAngle;
    // 将该值进行四舍五入，获取到真正想要的整数值
    const realValue = Math.round(currentValue);
    currentAngle = Math.max((terminalAngle * (realValue - min)) / (max - min), terminalAngle);
    updateActiveSliderPath();
    prevAngle = currentAngle;
    if (currentAngle >= terminalAngle) {
      stopMove(realValue, false, isEnd, func);
    } else {
      stopMove(realValue, true, isEnd, func);
    }
  };

  const handleStartPanResponder = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const isRange = calcIsRange(locationX, locationY, trackRadius, outerRadius, responseWidth);

    if (isRange) {
      e.persist();
      return true;
    }
    return false;
  };

  const handleSetPanResponder = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const isRange = calcIsRange(locationX, locationY, trackRadius, outerRadius, responseWidth);
    const _currentAngle = getCurrentAngle(locationX, locationY, outerRadius);

    if (isRange) {
      e.persist();
      return true;
    }
    if (_currentAngle > 0 && _currentAngle < terminalAngle) {
      return false;
    }
    return false;
  };

  const handleTerminate = () => {
    moving = false;
  };

  // 手势移动
  const _onMove = (e: GestureResponderEvent) => {
    moving = true;
    handleMove(e, false, onMove);
  };

  // 手势点击
  const _onRelease = (e: GestureResponderEvent) => {
    handleMove(e, true, onRelease);
    moving = false;
  };

  // 手势系统
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: handleStartPanResponder,
        onMoveShouldSetPanResponder: handleSetPanResponder,
        onPanResponderTerminationRequest: () => !moving,

        onPanResponderMove: _onMove,
        onPanResponderRelease: _onRelease,

        // 当前有其他的东西成为响应器并且没有释放它。
        onPanResponderReject: handleTerminate,
        onPanResponderTerminate: handleTerminate,
      }),
    [moving]
  );

  const markerScalesJSX = () => {
    return markerScales.map((scale, i) => {
      const { hasSlidered, lineAngle } = getPathRelative(angle, i);
      return (
        <Path
          key={i}
          d={getMarkerScalePath(lineAngle, innerScaleRadius, outerScaleRadius, outerRadius)}
          strokeWidth={scaleWidth}
          fill="transparent"
          stroke={hasSlidered ? activeScaleColor : scaleColor}
          ref={node => {
            scaleRefs.current[i] = node;
          }}
        />
      );
    });
  };

  return (
    <View
      pointerEvents={disabled ? 'none' : 'box-only'}
      style={{
        width: outerRadius * 2,
        height: outerRadius * 2,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      {...panResponder.panHandlers}
    >
      <View
        style={{
          width: outerRadius * 2,
          height: outerRadius * 2,
          backgroundColor: wrapperColor,
          position: 'absolute',
          borderRadius: outerRadius * 2,
        }}
      />

      <Svg width={outerRadius * 2} height={outerRadius * 2}>
        <Defs>
          <LinearGradient id="grad_2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={trackColor} stopOpacity="1" />
            <Stop offset="1" stopColor={trackColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d={getSliderPath(0, trackRadius, outerRadius, terminalAngle)}
          strokeWidth={trackWidth}
          stroke="url(#grad_2)"
          fill="transparent"
        />
        {!disabled && (
          <Path
            style={{ zIndex: 999 }}
            d={getActiveSliderPath(
              angle,
              sliderRadius + sliderWidth / 2,
              terminalAngle,
              outerRadius
            )}
            strokeWidth={sliderWidth}
            fill="none"
            stroke={sliderColor}
            ref={activeRef}
          />
        )}

        {/** 刻度值 */}
        {markerScalesJSX()}
      </Svg>

      <View
        style={[
          styles.innerWrapper,
          {
            width: innerRadius * 2,
            height: innerRadius * 2,
            borderRadius: innerRadius * 2,
            top: outerRadius - innerRadius,
            left: outerRadius - innerRadius,
          },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.textWrapper, { opacity: disabled ? 0.25 : 1 }]}>
          <RNText style={[styles.mainValueText, { color: fontColor, fontSize }]}>{data}</RNText>
          <RNText
            style={{
              color: subFontColor,
              fontSize: subFontSize,
              fontWeight: '400',
              marginTop: -16,
              fontFamily: 'Helvetica',
            }}
          >
            {subFontValue}
          </RNText>
        </View>
      </View>
      {/* 指针 */}
      {!disabled && (
        <Image
          source={pointer}
          style={[
            styles.pointerStyle,
            {
              left: pointerX,
              top: pointerY,
              transform: [{ rotate: `${pointerTransform}deg` }],
              zIndex: 3,
            },
          ]}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  innerWrapper: {
    alignItems: 'center',
    backgroundColor: '#2D3749',
    flex: 1,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  mainValueText: {
    fontFamily: 'Helvetica',
    fontWeight: '600',
  },
  pointerStyle: {
    height: 12,
    position: 'absolute',
    width: 13,
  },

  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CircularSlider;
