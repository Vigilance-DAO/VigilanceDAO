import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AppBar, Box, Typography, Toolbar, Button, Stack } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useMoralis } from "react-moralis";
import { useChain } from "react-moralis";

function Navigation() {
    const { initialize, web3, isAuthenticated, isAuthenticating, logout, authenticate } = useMoralis()
    const { switchNetwork, chainId, chain, account } = useChain();

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
        {name: 'Report', link: '/report'},
        {name: 'Cases', link: '/cases'}
    ];

    const manageMoralis = async () => {
        console.log('manageMoralis', {isAuthenticated})
        if(isAuthenticated) {
            await logout()
        } else {
            await authenticate()
            await initialize()
        }
    }

    useEffect(() => {
        // 0x13881
        // 0x89
        console.log('chainId', chainId)
        console.log({account, isAuthenticated, isAuthenticating})
        if(chainId!='0x13881') {
            switchNetwork('0x13881')
            // if(!isAuthenticated && !isAuthenticating)
            //     authenticate()
        }
    }, [chainId])

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
                            
                            <Button
                                variant="contained"
                                onClick={()=>{manageMoralis()}}
                                >
                                {isAuthenticated ? `${account?.substring(0, 4)}...${account?.substring(account.length-4, account.length)}` : "Connect"}
                            </Button>
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