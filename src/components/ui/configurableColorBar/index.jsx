import { useEffect, useState } from "react";

import {  
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';

// import hamburger icon and close icon
import HamburgerMenu from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import { ColormapOptions } from './colormapOptions';
import { ColorBar } from '../colorBar';

import './index.css';

/*
 * ConfigurableColorBar component for displaying and customizing a color scale.
 * Includes controls for adjusting the range (VMIN/VMAX), selecting a colormap,
 * and toggling reverse mode.
 *
 * @param {string} id - Unique identifier for this color bar instance.
 * @param {number} VMINLimit - Absolute minimum value allowed for the color scale.
 * @param {number} VMAXLimit - Absolute maximum value allowed for the color scale.
 * @param {string} colorMap - Initial colormap name (e.g., 'magma', 'viridis', 'turbo', optionally with '_r' for reverse).
 * @param {function} setVMIN - Callback to update the committed minimum value in the parent component.
 * @param {function} setVMAX - Callback to update the committed maximum value in the parent component.
 * @param {function} setColorMap - Callback to update the colormap in the parent component.
 * @param {string} [unit=''] - Optional unit label displayed under the color bar.
 */
export const ConfigurableColorBar = ({ 
    id,
    VMINLimit,
    VMAXLimit,
    colorMap,
    setVMIN,
    setVMAX,
    setColorMap,
    unit='',
  }) => {
  const [localVMIN, setLocalVMIN] = useState(VMINLimit);
  const [localVMAX, setLocalVMAX] = useState(VMAXLimit);

  const [currColorMap, setCurrColorMap] = useState(colorMap);
  const [selColorMap, setSelColorMap] = useState(colorMap);
  const [isReversed, setIsReverse] = useState(false);

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // key == dataProduct
    // id == dataProduct + selectedCycloneId
    let colorMap = selColorMap;
    if (isReversed) colorMap += "_r";
    setCurrColorMap(colorMap);
    setColorMap(colorMap);
    setVMIN(localVMIN);
    setVMAX(localVMAX);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localVMIN, localVMAX, selColorMap, isReversed])

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      className="configurable-colorbar-container"
    >
      <AccordionSummary
        expandIcon={expanded ? <CloseIcon /> : <HamburgerMenu />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginRight: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>
              {currColorMap.replace(/_r/g, '')}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>
              {isReversed ? 'Reversed' : ''}
            </span>
          </div>
          
          <ColorBar
            VMIN={localVMIN}
            VMAX={localVMAX}
            colorMap={currColorMap}
            STEP={(localVMAX-localVMIN)/5}
          />
          
          { unit && <div style={{ textAlign: 'center'}}>
            <Typography style={{ fontSize: '.9rem', color: '#666', marginTop: '0.5rem' }}>{unit}</Typography>
          </div> }
         
        </div>
      </AccordionSummary>
      <AccordionDetails className="configurable-colorbar-details">
        <ColormapOptions
          localVMin={localVMIN}
          localVMax={localVMAX}
          minLimit={VMINLimit}
          maxLimit={VMAXLimit}
          colorMap={colorMap}
          setLocalVMAX={setLocalVMAX}
          setLocalVMIN={setLocalVMIN}
          setSelColorMap={setSelColorMap}
          setIsReverse={setIsReverse}
        />
      </AccordionDetails>
    </Accordion>
  )
}
