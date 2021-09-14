import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import aavegotchiContractAbi from '../abi/diamond.json';
import ghstStakingContractAbi from '../abi/StakingFacet.json';
import uniswapV2PairAbi from '../abi/UniswapV2Pair.json';
import { connectToMatic } from '../util/MaticClient';

import { ethers } from "ethers";

const _ = require('lodash');
const axios = require('axios');

class FrensRates extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rates: {}
    };

    const maticPOSClient = connectToMatic();
    this.aavegotchiContract = new maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, '0x86935F11C86623deC8a25696E1C19a8659CbF95d');
    this.stakingContract = new maticPOSClient.web3Client.web3.eth.Contract(ghstStakingContractAbi, '0xA02d547512Bb90002807499F05495Fe9C4C3943f');

    this.ghstQuickPairContract = new maticPOSClient.web3Client.web3.eth.Contract(uniswapV2PairAbi, '0x8b1fd78ad67c7da09b682c5392b65ca7caa101b9');
    this.ghstUsdcPairContract = new maticPOSClient.web3Client.web3.eth.Contract(uniswapV2PairAbi, '0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4');
    this.ghstWethPairContract = new maticPOSClient.web3Client.web3.eth.Contract(uniswapV2PairAbi, '0xccb9d2100037f1253e6c1682adf7dc9944498aff');

    console.log(this.aavegotchiContract);
    console.log(this.stakingContract);
    console.log(this.ghstQuickPairContract, this.ghstUsdcPairContract, this.ghstWethPairContract);
  }

  async componentDidMount() {
    let ghstWethRate = await this.stakingContract.methods.ghstWethRate().call();
    let ghstUsdcRate = await this.stakingContract.methods.ghstUsdcRate().call();
    let ghstQuickRate = await this.stakingContract.methods.poolTokensRate().call();

    let ghstQuickReserves = await this.ghstQuickPairContract.methods.getReserves().call();
    let ghstUsdcReserves = await this.ghstUsdcPairContract.methods.getReserves().call();
    let ghstWethReserves = await this.ghstWethPairContract.methods.getReserves().call();

    console.log(ghstWethRate, ghstUsdcRate, ghstQuickRate);
    console.log(ghstQuickReserves, ghstUsdcReserves, ghstWethReserves);

    this.setState({ rates: { ghstWethRate, ghstUsdcRate, ghstQuickRate, ghstRate: 1, ghstQuickReserves, ghstUsdcReserves, ghstWethReserves } });
  }

  renderRates() {
    if (Object.keys(this.state.rates).length > 0) {
      const columns = [
        {
          field: 'id',
          headerName: 'Staking',
          width: 220,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/stake-polygon`} target="_blank">
              {params.value}
            </a>
          )
        },
        {
          field: 'pair',
          headerName: 'Pair',
          width: 400,
          renderCell: (params: GridCellParams) => (
            <a href={`https://info.quickswap.exchange/pair/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'rate', headerName: 'Current Frens Rate', width: 220 },
        { field: 'reserve1', headerName: 'GHST Reserves', width: 220 },
        { field: 'reserve2', headerName: 'Other Token Reserves', width: 220 },
      ];

      let rows = [];
      rows.push({ id: 'GHST', rate: this.state.rates.ghstRate });

      rows.push({
        id: 'GHST QUICK LP',
        pair: '0x8b1fd78ad67c7da09b682c5392b65ca7caa101b9',
        rate: parseInt(this.state.rates.ghstQuickRate).toLocaleString(),
        reserve1: parseInt(ethers.utils.formatEther(this.state.rates.ghstQuickReserves._reserve0)).toLocaleString(),
        reserve2: parseInt(ethers.utils.formatEther(this.state.rates.ghstQuickReserves._reserve1)).toLocaleString()
      });

      rows.push({
        id: 'GHST USDC LP',
        pair: '0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4',
        rate: parseInt(this.state.rates.ghstUsdcRate).toLocaleString(),
        reserve1: parseInt(ethers.utils.formatEther(this.state.rates.ghstUsdcReserves._reserve1)).toLocaleString(),
        reserve2: parseInt(ethers.utils.formatUnits(this.state.rates.ghstUsdcReserves._reserve0, 'mwei')).toLocaleString()
      });

      rows.push({
        id: 'GHST WETH LP',
        pair: '0xccb9d2100037f1253e6c1682adf7dc9944498aff',
        rate: parseInt(this.state.rates.ghstWethRate).toLocaleString(),
        reserve1: parseInt(ethers.utils.formatEther(this.state.rates.ghstWethReserves._reserve0)).toLocaleString(),
        reserve2: parseInt(ethers.utils.formatEther(this.state.rates.ghstWethReserves._reserve1)).toLocaleString()
      });

      return (
        <div>
          <div style={{ height: '300px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    } else {
      return (
        <p>Loading portals and frens balances...</p>
      );
    }
  }

  render() {
    return(
      <div>
        <h2>Current Frens Rates</h2>
        {this.renderRates()}
      </div>
    )
  }
}

export default FrensRates;
