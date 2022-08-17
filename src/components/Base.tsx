import {AppBar, Box, Button, CssBaseline, ThemeProvider, Toolbar, Typography} from "@mui/material";
import {muiColorTheme} from "./Theme";
import {useNavigate} from "react-router-dom";

export default function Base(props: any) {
    const navigate = useNavigate();

    return (
        <ThemeProvider theme={muiColorTheme}>
            <Box sx={{display: 'flex'}}>
                <CssBaseline/>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography component="h1" variant="h6">
                            vmmgr
                        </Typography>
                        {/*<Button*/}
                        {/*    variant="outlined"*/}
                        {/*    sx={{my: 1, mx: 0.5}}*/}
                        {/*    style={{*/}
                        {/*        color: "#fff",*/}
                        {/*        borderColor: "#fff"*/}
                        {/*    }}*/}
                        {/*    onClick={() => navigate("/dashboard")}*/}
                        {/*>*/}
                        {/*    Dashboard*/}
                        {/*</Button>*/}
                    </Toolbar>
                </AppBar>
                {props.children}
            </Box>
        </ThemeProvider>
    )
}
