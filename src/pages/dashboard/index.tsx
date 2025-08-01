/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Typography, Tooltip } from '@mui/material';
import styled from 'styled-components';

import {
  MainMap,
  MarkerFeature,
  VisualizationLayers,
  ConfigurableColorBar,
  LoadingSpinner,
  PersistentDrawerRight,
  Title,
  MapControls,
  MapZoom,
  Dropdown,
  VizItemTimeline,
  MapLegend,
  BlankInfoCard,
  SamInfoCard
} from '../../components/index.js';

import { SAM, VizItem } from '../../dataModel';
import { Oco3DataFactory } from '../../oco3DataFactory';

import './index.css';

const TITLE: string = 'OCO-3 Carbon Dioxide Snapshot Area Maps';
const DESCRIPTION: string = `OCO-3’s Snapshot Area Mapping (SAM) mode is a unique mode of operation that allows OCO-3 on the ISS to quickly scan large areas (80 km x 80 km) and collect data over specific targets, like urban areas, megacities and volcanoes. Shown here are SAMs of atmospheric CO2, processed with the ACOS CO2 retrieval algorithm version 11R.`;

const HorizontalLayout = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 12px;
`;

interface DashboardProps {
  dataFactory: React.MutableRefObject<Oco3DataFactory | null>;
  zoomLocation: number[];
  setZoomLocation: React.Dispatch<React.SetStateAction<number[]>>;
  zoomLevel: number | null;
  setZoomLevel: React.Dispatch<React.SetStateAction<number | null>>;
  loadingData: boolean;
}

export function Dashboard({
  dataFactory,
  zoomLocation,
  setZoomLocation,
  zoomLevel,
  setZoomLevel,
  loadingData,
}: DashboardProps) {
  // states for data
  const [targets, setTargets] = useState<VizItem[]>([]);
  const [hoveredVizLayerId, setHoveredVizLayerId] = useState<string>(''); // vizItem_id of the visualization item which was hovered over
  const [activeVizLayerId, setActiveVizLayerId] = useState<string>(''); // vizItem_id of the visualization item which was clicked on
  const [filteredVizItems, setFilteredVizItems] = useState<VizItem[]>([]); // visualization items for the selected region with the filter applied
  const [visualizationLayers, setVisualizationLayers] = useState<VizItem[]>([]); //all visualization items for the selected region (marker) // TODO: make it take just one instead of a list.
  const [selectedSams, setSelectedSams] = useState<VizItem[]>([]); // this represents the sams, when a target is selected.
  //color map
  const [VMAX, setVMAX] = useState<number>(420);
  const [VMIN, setVMIN] = useState<number>(400);
  const [colormap, setColormap] = useState<string>('viridis');
  const [assets, setAssets] = useState<string>('xco2');
  // targets based on target type
  const [targetTypes, setTargetTypes] = useState<string[]>([]);
  const [selectedTargetType, setSelectedTargetType] = useState<string[]>([]);

  // states for components/controls
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  // ref. to scroll to the hovered card within the drawer
  const cardRef = useRef<HTMLDivElement>(null);

  // callback handler functions
  // Note: these callback handler function needs to be initilaized only once.
  // so using useCallback hook.
  const handleSelectedMarker = useCallback((vizItemId: string) => {
    if (!vizItemId || !dataFactory.current) return;
    let targetId: string =
      dataFactory.current?.getTargetIdFromStacIdSAM(vizItemId);
    let candidateSams: SAM[] =
      dataFactory.current?.getVizItemsOnMarkerClicked(targetId) || [];

    let placeHolderSam: SAM = candidateSams[0];
    placeHolderSam.geometry.coordinates = [
      [placeHolderSam.properties.target_location.coordinates],
    ];

    setVisualizationLayers([placeHolderSam]);
    setSelectedSams(candidateSams);
    let location: number[] = [
      Number(candidateSams[0].geometry.coordinates[0][0][0]),
      Number(candidateSams[0].geometry.coordinates[0][0][1]),
    ];
    setZoomLocation(location);
    setZoomLevel(null); // take the default zoom level
    setOpenDrawer(true);
    setHoveredVizLayerId(vizItemId);
    setActiveVizLayerId(vizItemId);
  }, []);

  const handleSelectedVizLayer = useCallback((vizItemId: string) => {
    if (!vizItemId) return;
    setActiveVizLayerId(vizItemId);
  }, []);

  const handleResetHome = useCallback(() => {
    if (!dataFactory.current) return;
    // Get all Targets. Here everything is wrt vizItem/SAM, so get a representational SAM.
    let repTargets: SAM[] = dataFactory.current?.getVizItemForMarker() || [];
    setTargets(repTargets);
    setVisualizationLayers([]);
    setSelectedSams([]);
    setFilteredVizItems(repTargets);
    setHoveredVizLayerId('');
    setActiveVizLayerId('');
    setOpenDrawer(false);
    setZoomLevel(4);
    setZoomLocation([-98.771556, 32.967243]);
  }, []);

  const handleSelectedTargetTypes = useCallback((targetTypes: string[]) => {
    setSelectedTargetType(targetTypes);

    if (!targetTypes || targetTypes.length === 0) {
      let repTargets: SAM[] = dataFactory.current?.getVizItemForMarker() || [];
      setTargets(repTargets);
      return;
    }

    if (!dataFactory.current) return;
    let repTargets: SAM[] =
      dataFactory.current?.getVizItemForMarkerByTargetTypes(targetTypes) || [];
    setTargets(repTargets);
  }, []);

  const handleTimelineTimeChange = useCallback((vizItemId: string) => {
    if (!dataFactory.current) return;
    // from the vizItemId, find the target id.
    let changedVizItem: VizItem | undefined =
      dataFactory.current?.getVizItemByVizId(vizItemId);
    if (changedVizItem) setVisualizationLayers([changedVizItem]);
    setHoveredVizLayerId(vizItemId);
    setActiveVizLayerId(vizItemId);
  }, []);

  const handleHoverOverSelectedSams = useCallback((vizItemId: string) => {
    setHoveredVizLayerId(vizItemId);
  }, []);

  // Component Effects
  useEffect(() => {
    if (!dataFactory.current) return;
    // Get all Targets. Here everything is wrt vizItem/SAM, so get a representational SAM.
    let repTargets: SAM[] = dataFactory.current?.getVizItemForMarker() || [];
    setTargets(repTargets);

    let targetTypesLocal: string[] =
      dataFactory?.current.getTargetTypes() || [];
    setTargetTypes([...targetTypesLocal]);

    // also few extra things for the application state. We can receive it from collection json.
    const VMIN = 400;
    const VMAX = 420;
    const colormap: string = 'viridis';
    setVMIN(VMIN);
    setVMAX(VMAX);
    setColormap(colormap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataFactory.current]);

  // JSX
  return (
    <Box className='fullSize'>
      <div id='dashboard-map-container'>
        <MainMap>
          <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
          <MapControls
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            handleResetHome={handleResetHome}
            handleResetToSelectedRegion={() => { }}
          />
          <MarkerFeature
            vizItems={targets}
            onClickOnMarker={handleSelectedMarker}
          ></MarkerFeature>
          <VisualizationLayers
            vizItems={visualizationLayers}
            VMIN={VMIN}
            VMAX={VMAX}
            colormap={colormap}
            assets={assets}
            onClickOnLayer={handleSelectedVizLayer}
            onHoverOverLayer={setHoveredVizLayerId}
          />
        </MainMap>

        <div className="flex-left-column">
          <Paper className='title-container'>
            <Title title={TITLE} description={DESCRIPTION} />
            {/* <div className='title-content'>
                  <HorizontalLayout>
                    <Search
                      vizItems={targets}
                      onSelectedVizItemSearch={handleSelectedVizItemSearch}
                      placeHolderText={'Search by vizItem ID and substring'}
                    ></Search>
                  </HorizontalLayout>
                  <HorizontalLayout>
                    <FilterByDate
                      vizItems={targets}
                      onFilteredVizItems={setFilteredVizItems}
                    />
                  </HorizontalLayout>
                </div> */}
            <div className='title-content'>
              {selectedSams.length ? (
                <HorizontalLayout>
                  <VizItemTimeline
                    vizItems={selectedSams}
                    onVizItemSelect={handleTimelineTimeChange}
                    activeItemId={activeVizLayerId}
                    onVizItemHover={handleHoverOverSelectedSams}
                    hoveredItemId={hoveredVizLayerId}
                    title='Timeline'
                  />
                </HorizontalLayout>
              ) : (
                <></>
              )}
            </div>
          </Paper>
          <div className='legend-container'>
            {targetTypes.length > 0 && (
              <MapLegend
                title={'SAM Type'}
                description={'Click one or more SAM Type to filter.'}
                items={targetTypes}
                onSelect={handleSelectedTargetTypes}
              />
            )}
            {VMAX && (
              <ConfigurableColorBar
                id='configurable-color-bar'
                VMAXLimit={420}
                VMINLimit={400}
                colorMap={colormap}
                setColorMap={setColormap}
                setVMIN={setVMIN}
                setVMAX={setVMAX}
                unit='Measurement Unit'
              />
            )}
          </div>
        </div>

        <PersistentDrawerRight
          open={openDrawer}
          cardRef={cardRef}
          header={
            selectedSams.length > 0 ? (
            <>
              <Typography
                variant='h6'
                component='div'
                fontWeight='bold'
                className='drawer-head-content'
              >
                SAMs
              </Typography>
              <Tooltip
                title={
                  visualizationLayers.length
                    ? visualizationLayers[0].properties.target_name
                    : ''
                }
              >
                <Typography
                  variant="h6"
                  component="div"
                  fontWeight="bold"
                  className="drawer-head-content"
                  sx={{
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '75%',
                    display: 'block',
                  }}
                >
                  {visualizationLayers.length &&
                    visualizationLayers[0].properties.target_name}
                </Typography>
              </Tooltip>
            </>
            ): (
             <Typography
                variant='h6'
                component='div'
                fontWeight='bold'
                className='drawer-head-content'
              >
                No SAM selected
              </Typography>
            )
          }
          body={
            selectedSams.length > 0 ? (
              selectedSams.map((vizItem: VizItem) => (
                <SamInfoCard
                  key={vizItem.id}
                  stacItem={vizItem}
                  onClick={handleTimelineTimeChange}
                  onHover={handleHoverOverSelectedSams}
                  hovered={false}
                  clicked={false}
                  hoveredVizid={hoveredVizLayerId}
                  VMAX={VMAX}
                  VMIN={VMIN}
                  assets={assets}
                  colorMap={colormap}
                  cardRef={vizItem?.id === hoveredVizLayerId ? cardRef : undefined}
                />
              ))
            ) : (
              <BlankInfoCard
                illustration={`${process.env.PUBLIC_URL}/map_pointer.svg`}
                message="Select a SAM to view details"
              />
            )}
        />
      </div>
      {loadingData && <LoadingSpinner />}
    </Box>
  );
}
