import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveStakingStats } from '../util/StakingUtil';

import { ethers } from "ethers";

class StakingStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  async componentDidMount() {
    retrieveStakingStats()
      .then((stats) => {
        console.log('retrieveStakingStats', stats);

        this.setState({ stats });
      });
  }

  render() {
    return(
      <div>
        {this.state.stats &&
          <div>
            <h3>Staking Stats</h3>
            <ul>
              {/*<li>Circulating Frens: {this.state.stats.circulatingFrens}</li>*/}
              <li>Circulating Frens: {parseInt(ethers.utils.formatEther(this.state.stats.circulatingFrens)).toLocaleString()}</li>
              <li>Total Unique Stakers: {parseInt(this.state.stats.totalUniqueStaker).toLocaleString()}</li>
              {/*<li>Total Minted Frens: {this.state.stats.totalMintedFrens}</li>
              <li>Circulating Tickets: {this.state.stats.circulatingTickets}</li>
              <li>Total Minted Tickets: {this.state.stats.totalMintedTickets}</li>
              <li>Total Burned Tickets for Raffles: {this.state.stats.totalBurnedTicketsForRaffles}</li>*/}
            </ul>
            <p>Sourced from the <a href='https://thegraph.com/hosted-service/subgraph/froid1911/aavegotchi-subgraph-alpha'>Aavegotchi Subgraph</a></p>
          </div>
        }
      </div>
    )
  }
}

export default StakingStats;
