import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import TokenPrices from './components/TokenPrices';
import FrensRates from './components/FrensRates';
import Ownership from './components/Ownership';

require('dotenv').config();

ReactDOM.render(
  <React.StrictMode>
    <TokenPrices />
    <FrensRates />
    <Ownership />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
