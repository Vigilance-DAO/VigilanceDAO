import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Navigation from './Navigation';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Report from './pages/report/Report';
import { MoralisProvider } from "react-moralis";
import Cases from './pages/cases/Cases';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <MoralisProvider appId={process.env.REACT_APP_MORALIS_APP_ID || ''} serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL || ''}>
    <React.StrictMode>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/report" element={<Report />} />
          <Route path="/cases" element={<Cases />} />
        </Routes>
      </Router>
    </React.StrictMode>
  </MoralisProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
