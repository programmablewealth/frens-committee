import { ethers } from "ethers";

const axios = require('axios');
const _ = require('lodash');

const tokenMapping = (ticker) => {
  const tokenMapping = {
    GHST: 'aavegotchi',
    QUICK: 'quick',
    USDC: 'usd-coin',
    ETH: 'ethereum',
    MATIC: 'matic-network',
  };

  return tokenMapping[ticker];
}

export const fetchTokenPrices = async (tokensTickers) => {
  let coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=';
  tokensTickers.map((token, index) => {
    if (index == (tokensTickers.length - 1)) {
      coingeckoUrl += `${tokenMapping(token)}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
    } else {
      coingeckoUrl += `${tokenMapping(token)}%2C`;
    }
  });

  const result = await axios.get(
    coingeckoUrl,
  );

  return result.data;
};
