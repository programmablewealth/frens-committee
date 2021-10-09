import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveStakingStats, retrieveStakingStatsWithBlock } from '../util/StakingUtil';

import { connectToMatic } from '../util/MaticClient';

import { ethers } from "ethers";

class StakingStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  async componentDidMount() {
    const maticPOSClient = connectToMatic();
    let blockNumber = await maticPOSClient.web3Client.web3.eth.getBlockNumber();
    let prevDayBlockNumber = blockNumber - (30 * 60 * 24); // 2 second block times = 30 blocks per minutes = 180 blocks per hour
    console.log(blockNumber);

    retrieveStakingStats()
      .then((stats) => {
        console.log('retrieveStakingStats', stats);
        retrieveStakingStatsWithBlock(prevDayBlockNumber)
          .then((statsWithBlock) => {
            console.log('retrieveStakingStatsWithBlock', statsWithBlock);

            let delta = {};
            delta.circulatingFrens = parseInt(ethers.utils.formatEther(stats.circulatingFrens)) - parseInt(ethers.utils.formatEther(statsWithBlock.circulatingFrens));
            delta.totalUniqueStaker = parseInt(stats.totalUniqueStaker) - parseInt(statsWithBlock.totalUniqueStaker);

            this.setState({ stats, statsWithBlock, delta, blockNumber, prevDayBlockNumber });
          });
      });
  }

  render() {
    return(
      <div>
        {this.state.stats && this.state.delta &&
          <div>
            <h3>Staking Stats</h3>
            <ul>
              {/*<li>Circulating Frens: {this.state.stats.circulatingFrens}</li>*/}
              <li><a href={`https://polygonscan.com/block/${this.state.blockNumber}`}>Current</a> Circulating Frens: {parseInt(ethers.utils.formatEther(this.state.stats.circulatingFrens)).toLocaleString()}</li>
              <li><a href={`https://polygonscan.com/block/${this.state.prevDayBlockNumber}`}>24 Hour</a> Delta Circulating Frens: {this.state.delta.circulatingFrens.toLocaleString()}</li>
              <li><a href={`https://polygonscan.com/block/${this.state.blockNumber}`}>Current</a> Total Unique Stakers: {parseInt(this.state.stats.totalUniqueStaker).toLocaleString()}</li>
              <li><a href={`https://polygonscan.com/block/${this.state.prevDayBlockNumber}`}>24 Hour</a> Delta Total Unique Stakers: {this.state.delta.totalUniqueStaker.toLocaleString()}</li>
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
