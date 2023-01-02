import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material'
import {muiColorTheme} from './Theme'
import {useNavigate} from 'react-router-dom'

export default function Base(props: any) {
  const navigate = useNavigate()

  const clickListPage = () => {
    navigate('/')
  }

  const clickCreatePage = () => {
    navigate('/create')
  }

  return (
    <ThemeProvider theme={muiColorTheme}>
      <Box sx={{display: 'center'}}>
        <CssBaseline/>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" sx={{my: 2}}>
              vmmgr
            </Typography>
            <Box sx={{flexGrow: 1}}/>
            <Box sx={{display: {xs: 'none', sm: 'block'}}}>
              <Button
                key={'list'}
                onClick={clickListPage}
                sx={{color: '#fff'}}
              >
                List
              </Button>
              <Button
                key={'create'}
                onClick={clickCreatePage}
                sx={{color: '#fff'}}
              >
                Create
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        {props.children}
      </Box>
    </ThemeProvider>
  )
}
