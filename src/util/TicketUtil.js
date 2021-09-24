import { ethers } from "ethers";

const axios = require('axios');
const _ = require('lodash');

const ticketQuery = (rarityLevel) => {
  let query = `erc1155Listings(
    first: 1, orderBy: priceInWei, orderDirection: asc,
    where:{
      category: 3, rarityLevel: ${rarityLevel}, cancelled: false, sold: false,
      id_not_in: [126114, 125427, 131410, 124729, 124657, 123839, 121753]
    }
  )`;

  return query;
}


export const frenPrice = async () => {
  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: `{
        common: ${ticketQuery(0)} {
          priceInWei
        },
        uncommon: ${ticketQuery(1)} {
          priceInWei
        },
        rare: ${ticketQuery(2)} {
          priceInWei
        },
        legendary: ${ticketQuery(3)} {
          priceInWei
        },
        mythical: ${ticketQuery(4)} {
          priceInWei
        },
        godlike: ${ticketQuery(5)} {
          priceInWei
        },
        drop: ${ticketQuery(6)} {
          priceInWei
        },
      }`
    }
  );

  let ticketData = result.data.data;
  let floorPricePerFren = Number.MAX_SAFE_INTEGER;

  let ticketFrenPrice = {
    common: 50,
    uncommon: 250,
    rare: 500,
    legendary: 2500,
    mythical: 10000,
    godlike: 50000,
    drop: 10000
  };

  Object.keys(ticketData).map((rarity) => {
    if (ticketData[rarity].length > 0) {
      console.log(rarity, ticketData[rarity]);
      let ticketPrice = ethers.utils.formatEther(ticketData[rarity][0].priceInWei);
      let pricePerFren = ticketPrice / ticketFrenPrice[rarity];
      if (pricePerFren < floorPricePerFren) {
        floorPricePerFren = pricePerFren;
      }
    }
  })

  return floorPricePerFren;
};
