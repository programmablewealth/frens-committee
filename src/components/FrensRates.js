import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import aavegotchiContractAbi from '../abi/diamond.json';
import ghstStakingContractAbi from '../abi/StakingFacet.json';
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

    console.log(this.aavegotchiContract);
    console.log(this.stakingContract);
  }

  async componentDidMount() {
    let ghstWethRate = await this.stakingContract.methods.ghstWethRate().call();
    let ghstUsdcRate = await this.stakingContract.methods.ghstUsdcRate().call();
    let poolTokensRate = await this.stakingContract.methods.poolTokensRate().call();

    console.log(ghstWethRate, ghstUsdcRate, poolTokensRate);

    this.setState({ rates: { ghstWethRate, ghstUsdcRate, poolTokensRate, ghstRate: 1 } });
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
        { field: 'rate', headerName: 'Current Frens Rate', width: 220 },
      ];

      let rows = [];
      rows.push({ id: 'GHST', rate: this.state.rates.ghstRate });
      rows.push({ id: 'GHST QUICK LP', rate: this.state.rates.poolTokensRate });
      rows.push({ id: 'GHST USDC LP', rate: this.state.rates.ghstUsdcRate });
      rows.push({ id: 'GHST WETH LP', rate: this.state.rates.ghstWethRate });

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
