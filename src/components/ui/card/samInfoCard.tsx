import { useEffect, useState } from 'react';
import moment from 'moment';
import { Box, CardContent, CardMedia, Typography, Grid } from '@mui/material';
import {
  StacItemInfoCard,
  StacItemInfoCardProps,
  HorizontalLayout,
  CaptionValue,
} from './stacItemInfoCard';

import { TruncatedCopyText } from '../truncatedText';
import { capitalizeFirstLetter } from '../../../utils';

interface SamInfoCardProps extends StacItemInfoCardProps {
  hoveredVizid: string;
  cardRef?: React.MutableRefObject<HTMLDivElement | null> | undefined;
}

export const SamInfoCard = ({
  stacItem,
  onClick,
  onHover,
  hovered,
  clicked,
  hoveredVizid,
  VMAX,
  VMIN,
  colorMap,
  assets,
  cardRef,
}: SamInfoCardProps): JSX.Element => {
  const [startDatetime, setStartDatetime] = useState<string>('');
  const [endDatetime, setEndDatetime] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [targetName, setTargetName] = useState<string>('');
  const [targetType, setTargetType] = useState<string>('');
  const [targetAltitude, setTargetAltitude] = useState<string>('');
  const [minValue, setMinValue] = useState<number | string>('N/A');
  const [maxValue, setMaxValue] = useState<number | string>('N/A');
  const [hov, setHov] = useState<boolean>(false);

  const formatNumber = (input: number | string) => {
    const num = Number(input);
    if (isNaN(num)) return input.toString();

    if (Math.abs(num) >= 1e5) {
      return num.toExponential(2);
    }
    return Number(num.toFixed(3)).toString();
  };

  const extractDateTime = (input: string): string => {
    // id: is in Format: <data-type>_<target_id>_<datetime>_<filter-status>_<ghg-type>. e.g. "oco3-co2_volcano0010_2025-03-30T232216Z_unfiltered_xco2"

    const parts = input.split('_');

    if (parts.length < 3) return 'null';
    const datetimePart = parts.slice(-3)[0];

    if (!datetimePart) return 'null';

    const momentObj = moment.utc(datetimePart, 'YYYY-MM-DDTHHmmss[Z]', true);
    if (momentObj.isValid()) {
      return momentObj.format('MM/DD/YYYY, HH:mm:ss [UTC]');
    }
    return 'null';
  };

  useEffect(() => {
    setHov(stacItem.id === hoveredVizid);
  }, [hoveredVizid, stacItem.id]);

  useEffect(() => {
    let startDatetime: string = extractDateTime(stacItem.id);
    let endDatetime: string = stacItem.properties.end_datetime;
    let targetId: string = stacItem.properties.target_id;
    let targetName: string = stacItem.properties.target_name;
    let targetType: string = stacItem.properties.target_type;
    let targetAltitude: string = stacItem.properties.target_altitude;
    let minValue: number | string = 'N/A';
    let maxValue: number | string = 'N/A';


    if (assets) {
      minValue =
        stacItem.assets?.[assets]?.['raster:bands']?.[0]?.statistics?.minimum ?? 'N/A';
      maxValue =
        stacItem.assets?.[assets]?.['raster:bands']?.[0]?.statistics?.maximum ?? 'N/A';
    }

    setStartDatetime(startDatetime);
    setEndDatetime(endDatetime);
    setTargetId(targetId);
    setTargetName(targetName);
    setTargetType(targetType);
    setTargetAltitude(targetAltitude);
    setMinValue(minValue);
    setMaxValue(maxValue);

  }, [stacItem]);

  return (
    <div ref={cardRef}>
      <StacItemInfoCard
        stacItem={stacItem}
        onClick={onClick}
        onHover={onHover}
        hovered={hov}
        clicked={clicked}
        VMAX={VMAX}
        VMIN={VMIN}
        colorMap={colorMap}
        assets={assets}
      >
        <>
          <Box sx={{ marginTop: '20px', width: '100%' }}>
            {/* Target Group */}
            <Typography variant="body2" sx={{ mb: 0.5, color: 'var(--main-blue)' }}>SAM Details</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
              {/* Left Group: 75% width, column layout */}
              <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <CaptionValue caption="SAM ID">{targetId}</CaptionValue>
                <CaptionValue caption="SAM Name">
                  <TruncatedCopyText text={targetName} maxLength={35} />
                </CaptionValue>
              </Box>

              {/* Right Group: 25% width, column layout */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <CaptionValue caption="SAM Type">
                  {targetType ? capitalizeFirstLetter(targetType) : 'N/A'}
                </CaptionValue>
                <CaptionValue caption="SAM Altitude">
                  {Number(targetAltitude) ? targetAltitude + ' m' : 'N/A'}
                </CaptionValue>
              </Box>
            </Box>

            {/* Visualization Group */}
            <Typography variant="body2" sx={{ mt: 3, mb: 0.5, color: 'var(--main-blue)' }}>Visualization Details</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0, width: '100%' }}>
              {/* Acquisition Time */}
              <Box sx={{ flex: 1 }}>
                <CaptionValue caption="Acquisition Time">
                  {moment.utc(startDatetime).format('MM/DD/YYYY, HH:mm:ss') + ' UTC'}
                </CaptionValue>
              </Box>

              {/* Min and Max Values */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <CaptionValue caption="Min Value">
                    {formatNumber(minValue as number)}
                  </CaptionValue>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <CaptionValue caption="Max Value">
                    {formatNumber(maxValue as number)}
                  </CaptionValue>
                </Box>
              </Box>
            </Box>
          </Box>

        </>
      </StacItemInfoCard>
    </div>
  );
};
