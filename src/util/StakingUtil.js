const axios = require('axios');
const _ = require('lodash');

export const retrieveStakingStats = async () => {
  let query = `{
    stakingStats(first: 1) {
      id
      circulatingFrens
      circulatingTickets
      totalMintedTickets
      totalBurnedTicketsForRaffles
      totalUniqueStaker
  		totalMintedFrens
      totalBurnedTicketsForRaffles
    }
  }`;

  const stats = await axios.post(
    'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-subgraph-alpha',
    {
      query: query
    }
  );

  return stats.data.data.stakingStats[0];
};

const stakingEntrantsQuery = (skip) => {
  let query = `{
    entrants(
      first: 1000,
      skip: ${skip},
      where: {
        frens_gt: 0
      }
      orderBy: frens,
      orderDirection: desc
    ) {
      id
      address
      frens
      pools {
        id
        staked
      }
    }
  }`;

  return query;
}

export const retrieveTopFrensHolders = async () => {
  let data = [];
  for (let i = 0; i < 5; i++) {
    const stakers = await axios.post(
      'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-subgraph-alpha',
      {
        query: stakingEntrantsQuery(i * 1000)
      }
    );

    data = [...data, ...stakers.data.data.entrants];
  }


  return data;
};
