import { styled as styledmui } from '@mui/material/styles';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';

import './index.css';

const drawerWidth = '30rem';

const Main = styledmui('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  /**
   * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
   * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
   * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
   * proper interaction with the underlying content.
   */
  position: 'relative',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
      },
    },
  ],
}));

const DrawerHeader = styledmui('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const HorizontalLayout = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 5px;
  margin-bottom: 5px;
`;

export function PersistentDrawerRight({ open, header, body }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Main open={open}>
        <DrawerHeader />
      </Main>
      <Drawer
        sx={{
          width: drawerWidth,
          marginRight: '5px',
          marginTop: '5px',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            marginRight: '5px',
            marginTop: '5px',
            height: 'calc(100vh - var(--colorbar-height) - 3.5%)', //colobar is up 3% from bottom
            borderRadius: '3px',
          },
        }}
        variant='persistent'
        anchor='right'
        open={open}
      >
        <DrawerHeader className='drawer-head'>
          <HorizontalLayout>{header}</HorizontalLayout>
        </DrawerHeader>
        {body}
      </Drawer>
    </Box>
  );
}
