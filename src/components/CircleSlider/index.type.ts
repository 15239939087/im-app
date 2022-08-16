export type CircularSliderProps = {
  /** *************************** Base ************************************** */
  /** 外圆的半径 */
  outerRadius?: number;
  /** 内圆的半径 */
  innerRadius?: number;
  /** 刻度值的宽度 */
  scaleWidth?: number;
  /** 滑道的宽度 */
  trackWidth?: number;
  /** 刻度值的长度 */
  scaleLength?: number;
  /** 手势响应的向内最大宽度 */
  responseWidth?: number;
  /** 激活轨道的宽度 */
  sliderWidth?: number;
  /** 激活轨道距离最外层的距离 默认30 */
  activeSliderDistance?: number;
  /** 当前值 */
  value?: number;
  /** 次要字体 */
  subFontValue?: string;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;

  /** *************************** action ************************************** */
  /** 离开响应 */
  onRelease?: (value: number) => any;
  /** 移动响应 */
  onMove?: (value: number) => any;

  /** *************************** style ************************************** */
  /** 背景颜色  */
  wrapperColor?: string;
  /** 滑轨颜色  */
  trackColor?: string;
  /** 滑条颜色  */
  sliderColor?: string;
  /** 刻度值颜色  */
  scaleColor?: string;
  /** 激活状态的刻度值颜色  */
  activeScaleColor?: string;
  /** 主文字颜色  */
  fontColor?: string;
  /** 主文字大小 */
  fontSize?: number;
  /** 次文字颜色  */
  subFontColor?: string;
  /** 次文字大小 */
  subFontSize?: number;
  /** 是否禁用 */
  disabled?: boolean;
};
