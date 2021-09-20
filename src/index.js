import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import TokenPrices from './components/TokenPrices';
import FrensRates from './components/FrensRates';
import Ownership from './components/Ownership';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

require('dotenv').config();

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <div>
        <h1>Aavegotchi Frens Taaskforce Analytics</h1>
        <div>
          <a href="/">Frens Rates</a> <a href="/supply">Frens Supply</a>
        </div>
        <Switch>
          <Route path="/supply">
            <Ownership />
          </Route>

          <Route path="/">
            <div>
              <TokenPrices />
              <FrensRates />
            </div>
          </Route>
        </Switch>

        <div>
          <a href="https://github.com/programmablewealth/frens-committee">source code</a>
        </div>
      </div>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
