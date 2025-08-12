import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Switch,
  Grid,
  Tooltip,
  MenuItem
} from '@mui/material';

import { ColorBar } from '../colorBar';
import { COLOR_MAP } from '../colorBar/helper';

import ResetIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';

import './index.css';

export const ColormapOptions = ({
  currentMin,
  currentMax,
  minLimit,
  maxLimit,
  colorMap,
  setCurrVMAX,
  setCurrVMIN,
  setSelColorMap,
  setIsReverse,
}) => {

  // committed values (drive UI & outputs)
  const [minValue, setMinValue] = useState(currentMin);
  const [maxValue, setMaxValue] = useState(currentMax);

  // editable text inputs (don’t validate while typing)
  const [minInput, setMinInput] = useState(String(currentMin));
  const [maxInput, setMaxInput] = useState(String(currentMax));

  // slider display values during drag (don’t commit until mouseup)
  const [sliderVals, setSliderVals] = useState([minLimit, maxLimit]);

  // slider range is stable while dragging; expands only on commit
  const [range, setRange] = useState([
    Math.min(minLimit, currentMin),
    Math.max(maxLimit, currentMax),
  ]);

  const [reverse, setReverse] = useState(false);
  const baseMap = colorMap.includes('_r') ? colorMap.replaceAll('_r', '') : colorMap;
  const [selectedColorbar, setSelectedColorbar] = useState(baseMap);

  const [error, setError] = useState('');

  // sync when parent updates current range
  useEffect(() => {
    setMinValue(currentMin);
    setMaxValue(currentMax);
    setMinInput(String(currentMin));
    setMaxInput(String(currentMax));
    setSliderVals([currentMin, currentMax]);
    setRange((r) => ([
      Math.min(minLimit, r[0], currentMin),
      Math.max(maxLimit, r[1], currentMax),
    ]));
  }, [currentMin, currentMax, minLimit, maxLimit]);

  // Text inputs for slider range (validate on blur / Enter)
  const handleMinChange = (e) => {
    setError('');
    setMinInput(e.target.value);
  };
  const handleMaxChange = (e) => {
    setError('');
    setMaxInput(e.target.value);
  };

  const commitMin = () => {
    const v = parseFloat(minInput);
    if (!Number.isFinite(v)) {
      setMinInput(String(minValue));
      return;
    }
    if (v >= maxValue) {
      setError('Min must be less than Max.');
      return;
    }
    setError('');
    setMinValue(v);
    setSliderVals(([_, r]) => [v, r]);
    // expand range only if needed
    setRange(([lo, hi]) => [Math.min(lo, v, minLimit), Math.max(hi, maxValue)]);
    setCurrVMIN?.(v);
  };

  const commitMax = () => {
    const v = parseFloat(maxInput);
    if (!Number.isFinite(v)) {
      setMaxInput(String(maxValue));
      return;
    }
    if (v <= minValue) {
      setError('Max must be greater than Min.');
      return;
    }
    setError('');
    setMaxValue(v);
    setSliderVals(([l, _]) => [l, v]);
    setRange(([lo, hi]) => [Math.min(lo, minValue), Math.max(hi, v, maxLimit)]);
    setCurrVMAX?.(v);
  };

  const onKeyDownCommit = (e, which) => {
    if (e.key === 'Enter') {
      which === 'min' ? commitMin() : commitMax();
    }
  };

  // Slider (drag to adjust, commit on mouseup)
  const handleSliderChange = (_event, newValue) => {
    // during drag, only update local slider state
    const [l, r] = newValue;
    if (l === r) return;
    setError('');
    setSliderVals([l, r]);
    setMinInput(String(l));
    setMaxInput(String(r));
  };

  const handleSliderCommit = (_event, newValue) => {
    const [l, r] = newValue;
    if (l === r) return;
    setMinValue(l);
    setMaxValue(r);
    setCurrVMIN?.(l);
    setCurrVMAX?.(r);
    // Keep the displayed range stable; only expand if out-of-bounds
    setRange(([lo, hi]) => [Math.min(lo, l), Math.max(hi, r)]);
  };

  // handle reverse toggle
  const handleReverseChange = (event) => {
    setReverse(event.target.checked);
    setIsReverse?.(event.target.checked);
  };

  // handle colorbar selection
  const handleColorbarClick = (name) => {
    setSelectedColorbar(name);
    setSelColorMap?.(name);
  };

  // Reset everything to default values when the reset button is clicked
  const handleReset = () => {
    setMinValue(minLimit);
    setMinInput(String(minLimit));
    setCurrVMIN(minLimit);

    setMaxValue(maxLimit);
    setMaxInput(String(maxLimit));
    setCurrVMAX(maxLimit);

    setSliderVals([minLimit, maxLimit]);
    setRange([minLimit, maxLimit]);

    setSelectedColorbar(baseMap);
    setSelColorMap(baseMap);

    setReverse(false);
    setIsReverse(false);
  }

  return (
    <Box sx={{ p: 2, minWidth: 100, border: "1px solid #f5f5f5", borderRadius: 1, padding: "1rem" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography fontWeight="medium">Colormap Options</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Reverse
            </Typography>
            <Switch
              checked={reverse}
              onChange={handleReverseChange}
              size="small"
            />
          </Box>
          <Box>
            <IconButton size="small" onClick={handleReset}>
              <ResetIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Rescale */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" gutterBottom>
          Rescale
        </Typography>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={3}>
            <Tooltip title={minInput}>
              <TextField
                value={minInput}
                onChange={handleMinChange}
                onBlur={commitMin}
                onKeyDown={(e) => onKeyDownCommit(e, 'min')}
                size="small"
                type="number"
                inputProps={{ step: 1 }}
                fullWidth
              />
            </Tooltip>
          </Grid>

          <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Slider
              value={sliderVals}
              onChange={handleSliderChange}
              onChangeCommitted={handleSliderCommit}
              min={range[0]}
              max={range[1]}
              step={1}
              size="small"
              sx={{
                width: '100%',
                mx: '5px',
                '& .MuiSlider-rail': { height: 2 },
                '& .MuiSlider-track': { height: 2 },
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                  border: '2px solid currentColor',
                  backgroundColor: '#fff',
                },
              }}
              disableSwap
            />
          </Grid>

          <Grid item xs={3}>
            <Tooltip title={maxInput}>
              <TextField
                value={maxInput}
                onChange={handleMaxChange}
                onBlur={commitMax}
                onKeyDown={(e) => onKeyDownCommit(e, 'max')}
                size="small"
                type="number"
                inputMode="decimal"
                inputProps={{ step: 1 }}
                fullWidth
              />
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {!!error && (
        <Typography variant="caption" gutterBottom sx={{ display: 'block', color: 'red' }}>
          {error}
        </Typography>
      )}

      {/* Colorbar selection */}
      <Box>
        <Typography variant="body2" gutterBottom>
          Colorbar
        </Typography>
        <TextField
          select
          fullWidth
          size="small"
          value={selectedColorbar}
          onChange={(e) => handleColorbarClick(e.target.value)}
        >
          {Object.keys(COLOR_MAP)
            .filter((name) => !name.includes('_r'))
            .map((colorbarName) => (
              <MenuItem key={colorbarName} value={colorbarName} sx={{ display: 'block' }}>
                <Typography variant="body2">{colorbarName}</Typography>
                <Box mt={0.5}>
                  <ColorBar
                    VMIN={minValue}
                    VMAX={maxValue}
                    STEP={(maxValue - minValue) / 5 || 1}
                    colorMap={colorbarName}
                    skipStep
                    skipLabel
                  />
                </Box>
              </MenuItem>
            ))}
        </TextField>
      </Box>
    </Box>
  );
};
