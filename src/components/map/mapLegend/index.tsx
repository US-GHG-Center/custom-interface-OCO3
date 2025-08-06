import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  ButtonBase,
} from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import ClearAllIcon from '@mui/icons-material/ClearAll';

import { getMarkerColor } from '../utils';
import { titleCase } from '../../../utils';

import './index.css';


interface MapLegendProps {
  items: string[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  title: string;
  description: string;
  numColumns?: number | null;
}

export const MapLegend: React.FC<MapLegendProps> = ({ items, selectedIds, onSelect, title = '', description = '', numColumns = null }) => {
  const [computedColumns, setComputedColumns] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleSelect = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    onSelect(newSelected);
  };

  const clearFilter = () => {
    onSelect([]);
  };

  useEffect(() => {
    if (numColumns) {
      setComputedColumns(numColumns);
      return;
    }

    // Dynamically calculate the number of columns based on container width
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width < 200) setComputedColumns(1);
      else if (width < 500) setComputedColumns(2);
      else setComputedColumns(3);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
    };
  }, []);

  const markerColumnLayout = '1fr '.repeat(computedColumns).trim();

  return (
    <div ref={containerRef}>
      <Box p={2} borderRadius={3} width="100%" bgcolor="background.paper" className="map-legend-container">
        <Box display="flex" alignItems="left" flexDirection={'column'}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography className='map-legend-title'>{title}</Typography>
            <Tooltip title="Clear Filter">
              <ButtonBase className="clear-filter-button" onClick={clearFilter} sx={{ color: 'text.secondary' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Clear filters </Typography><ClearAllIcon fontSize="medium" />
              </ButtonBase>
            </Tooltip>
          </Box>
          <Typography className='map-legend-description'>
            {description}
          </Typography>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={markerColumnLayout}
          gap={1}
          maxHeight={150}
          overflow="scroll"
        >
          {items.map((category) => {
            const selected = selectedIds.includes(category);
            return (
              <ButtonBase
                disableRipple
                key={category}
                onClick={() => toggleSelect(category)}
                className={`marker-category-button ${selected ? 'selected' : ''}`}
              >
                <RoomIcon htmlColor={getMarkerColor(category)} sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                  {titleCase(category)}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </div>
  );
};
