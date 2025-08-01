import { rgb } from "d3";

export const ZOOM_LEVEL_MARGIN = 8;

export const PopularMapMarkerColors = [
  rgb(0, 146, 188),
  rgb(204, 79, 57),
  rgb(24, 115, 204),
  rgb(40, 164, 40),
  rgb(110, 34, 180),
  rgb(204, 132, 0),
  rgb(204, 172, 0),
  rgb(0, 165, 167),
  rgb(204, 16, 118),
  rgb(85, 72, 164),
  rgb(176, 16, 48),
];

export const MarkerColorMapping = {
  volcano: rgb(244, 91, 91),
  validation: rgb(241, 174, 39),
  fossil: rgb(78, 138, 222),
  calibration: rgb(113, 123, 59),
  desert: rgb(83, 174, 121),
  sif_high: rgb(141, 58, 174),
  sif_low: rgb(231, 108, 227),
};