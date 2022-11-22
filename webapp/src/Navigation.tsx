import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AppBar, Box, Typography, Toolbar, Button, Stack } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

function Navigation() {
    const { address, isConnected } = useAccount()
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    })
    const { disconnect } = useDisconnect()

    const darkTheme = createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#fff',
          },
          secondary: {
            main: '#000000'
          }
        },
    });
    const navItems = [
        {name: 'Home', link: '/'},
        {name: 'Cases', link: '/cases'}
    ];

    



    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ display: 'flex' }}>
                <AppBar component="nav" sx={{borderBottom: '1px solid #ebebeb', backgroundColor: '#f1f1f1'}} elevation={0}>
                    <Toolbar>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{
                                width: '100%', 
                                fontWeight: 'bold', 
                                marginTop: '20px',
                                borderBottom: '1px solid #ebebeb',
                                paddingBottom: '20px'
                            }}
                        >
                            <img src="./icon128.png" style={{height: '45px', verticalAlign: 'middle',
                                marginRight: '10px', marginTop: '-5px'}}/>
                            {/* <NavLink className="navbar-brand" to="/"> */}
                                Vigilance DAO
                            {/* </NavLink> */}
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={2}
                            >
                            {navItems.map((item) => (
                            <Button key={item.name} href={item.link} sx={{ color: 'black' }}>
                                {item.name}
                            </Button>
                            ))}
                            {
                                isConnected ? <Button variant="contained" onClick={()=>disconnect()}>disconnect</Button>
                            :
                            <Button
                            variant="contained"
                            onClick={()=>connect()}
                            >
                            Connect
                            </Button>

                            }
                            
                            
                        </Stack>
                        {/* <div>
                            <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/">
                                Home
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/report">
                                Report
                                </NavLink>
                            </li>
                            </ul>
                        </div> */}
                    </Toolbar>
                </AppBar>
            </Box>
        </ThemeProvider>
  );
}

export default Navigation;