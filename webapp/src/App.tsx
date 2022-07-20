import React from 'react';
import './App.css';
import AppBar from '@mui/material/AppBar';
import { Button, Typography } from "@mui/material";

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Typography
            variant="h3"
            component="div"
        >
          An Internet org
        </Typography>
        <Typography
            variant="h3"
            component="div"
        >
          for a safer internet
        </Typography>
        <Typography
            variant="h5"
            component="div"
        >
          powered by blockchain
        </Typography>
        <br/>
        <Button variant="contained">Download Chrome extension</Button>
      </header>
    </div>
  );
}

export default App;
