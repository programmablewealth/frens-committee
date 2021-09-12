import React, { Component } from 'react';

class TokenPrices extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tokens: ['GHST', 'QUICK', 'USDC', 'ETH', 'MATIC'],
      tokenMapping: {
        GHST: 'aavegotchi',
        QUICK: 'quick',
        USDC: 'usd-coin',
        ETH: 'ethereum',
        MATIC: 'matic-network',
      },
      prices: {}
    };
  }

  componentDidMount() {
    let coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=';
    this.state.tokens.map((token, index) => {
      if (index == (this.state.tokens.length - 1)) {
        coingeckoUrl += `${this.state.tokenMapping[token]}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
      } else {
        coingeckoUrl += `${this.state.tokenMapping[token]}%2C`;
      }
    });

    console.log(coingeckoUrl);

    fetch(coingeckoUrl)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          this.setState({
            prices: result
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }

  renderTokenPrices() {
    if (Object.keys(this.state.prices).length > 0) {
      let tokenPrices = this.state.tokens.map(function(token, index){
        let mappedToken = this.state.tokenMapping[token];
        let price = this.state.prices[mappedToken];
        let priceInGhst = parseFloat((price.usd/this.state.prices.aavegotchi.usd).toFixed(2));
        return(
          <li key={`token-price-${token}`}>{token}: {price.usd} USD, {priceInGhst} GHST</li>
        );
      }, this);

      return(
        <div>
          <p>Prices obtained from CoinGecko API</p>
          <ul>
            {tokenPrices}
          </ul>
        </div>
      );
    } else {
      return(
        <div>
          <p>Loading token prices from CoinGecko API</p>
        </div>
      );
    }
  }

  render() {
    return(
      <div>
        <h2>Token Prices</h2>
        {this.renderTokenPrices()}
      </div>
    );
  }

}

export default TokenPrices;
