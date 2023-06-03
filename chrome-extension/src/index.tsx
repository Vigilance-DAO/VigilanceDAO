import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { hydrate, render } from 'react-dom';


// const rootElement = document.getElementById("root");

// if (rootElement?.hasChildNodes()) {
//   hydrate(<App />, rootElement);
// } else {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  // render(<App />, rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
// }

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
