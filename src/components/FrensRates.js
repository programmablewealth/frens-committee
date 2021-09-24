import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import aavegotchiContractAbi from '../abi/diamond.json';
import ghstStakingContractAbi from '../abi/StakingFacet.json';
import uniswapV2PairAbi from '../abi/UniswapV2Pair.json';
import ghstAbi from '../abi/ghst.json';
import { connectToMatic } from '../util/MaticClient';
import { connectToEth } from '../util/EthClient';


import { frenPrice } from '../util/TicketUtil';
import { fetchTokenPrices } from '../util/TokenPriceUtil';

import { ethers } from "ethers";

const _ = require('lodash');
const axios = require('axios');

// https://info.dfyn.network/token/0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7
// add GHST MUST pair from COMETH SWAP

class FrensRates extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rates: {}
    };

    const maticPOSClient = connectToMatic();
    const ethProvider = connectToEth();

    console.log('ethProvider', ethProvider);

    this.aavegotchiContract = new maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, '0x86935F11C86623deC8a25696E1C19a8659CbF95d');
    this.stakingContract = new maticPOSClient.web3Client.web3.eth.Contract(ghstStakingContractAbi, '0xA02d547512Bb90002807499F05495Fe9C4C3943f');

    this.ghstQuickPairContract = new maticPOSClient.web3Client.web3.eth.Contract(uniswapV2PairAbi, '0x8b1fd78ad67c7da09b682c5392b65ca7caa101b9');
    this.ghstUsdcPairContract = new maticPOSClient.web3Client.web3.eth.Contract(uniswapV2PairAbi, '0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4');
    this.ghstWethPairContract = new maticPOSClient.web3Client.web3.eth.Contract(uniswapV2PairAbi, '0xccb9d2100037f1253e6c1682adf7dc9944498aff');
    this.ghstMaticPairContract = new maticPOSClient.web3Client.web3.eth.Contract(uniswapV2PairAbi, '0xf69e93771f11aecd8e554aa165c3fe7fd811530c');

    this.uniswapGHSTEthPairContract = new ethers.Contract('0xab659dee3030602c1af8c29d146facd4aed6ec85', uniswapV2PairAbi, ethProvider);

    this.ghstContract = new maticPOSClient.web3Client.web3.eth.Contract(ghstAbi, '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7');

    console.log(this.aavegotchiContract);
    console.log(this.stakingContract);
    console.log(this.ghstQuickPairContract, this.ghstUsdcPairContract, this.ghstWethPairContract);
    console.log(this.ghstContract);

    console.log('uniswap', this.uniswapGHSTEthPairContract);
    console.log('sushiswap', this.ghstMaticPairContract);
  }

  async componentDidMount() {
    let ghstWethRate = await this.stakingContract.methods.ghstWethRate().call();
    let ghstUsdcRate = await this.stakingContract.methods.ghstUsdcRate().call();
    let ghstQuickRate = await this.stakingContract.methods.poolTokensRate().call();

    let ghstQuickReserves = await this.ghstQuickPairContract.methods.getReserves().call();
    let ghstQuickSupply = await this.ghstQuickPairContract.methods.totalSupply().call();

    let ghstUsdcReserves = await this.ghstUsdcPairContract.methods.getReserves().call();
    let ghstUsdcSupply = await this.ghstUsdcPairContract.methods.totalSupply().call();

    let ghstWethReserves = await this.ghstWethPairContract.methods.getReserves().call();
    let ghstWethSupply = await this.ghstWethPairContract.methods.totalSupply().call();

    let ghstStaked = await this.ghstContract.methods.balanceOf('0xa02d547512bb90002807499f05495fe9c4c3943f').call();

    let ghstEthUniswapReserves = await this.uniswapGHSTEthPairContract.getReserves();
    let ghstEthUniswapSupply = await this.uniswapGHSTEthPairContract.totalSupply();

    let ghstMaticReserves = await this.ghstMaticPairContract.methods.getReserves().call();
    let ghstMaticSupply = await this.ghstMaticPairContract.methods.totalSupply().call();

    console.log(ghstWethRate, ghstUsdcRate, ghstQuickRate);
    console.log(ghstQuickReserves, ghstUsdcReserves, ghstWethReserves);
    console.log(ghstStaked);
    console.log('uniswap', 'reserves', ghstEthUniswapReserves, 'supply', ghstEthUniswapSupply);

    fetchTokenPrices(['GHST'])
      .then((tokenPrices) => {
        console.log('tokenPrices', tokenPrices);

        frenPrice()
          .then((ghstFrenPrice) => {
            console.log('ghstFrenPrice', ghstFrenPrice);
            // let usdFrenPrice = ghstFrenPrice;
            this.setState({ rates: { ghstWethRate, ghstUsdcRate, ghstQuickRate, ghstRate: 1, ghstQuickReserves, ghstUsdcReserves, ghstWethReserves, ghstQuickSupply, ghstUsdcSupply, ghstWethSupply, ghstStaked, ghstEthUniswapReserves, ghstEthUniswapSupply, ghstMaticReserves, ghstMaticSupply, ghstFrenPrice, tokenPrices } });
          });
      });
  }

  renderRates() {
    if (Object.keys(this.state.rates).length > 0) {
      const columns = [
        {
          field: 'id',
          headerName: 'Staking',
          width: 200,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/stake-polygon`} target="_blank">
              {params.value}
            </a>
          )
        },
        {
          field: 'contract',
          headerName: 'Contract',
          width: 160,
          renderCell: (params: GridCellParams) => (
            <a href={`${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'currentRewards', headerName: 'Current FRENS', width: 180 },
        { field: 'reserve1', headerName: 'GHST Pooled', width: 180 },
        // { field: 'reserve2', headerName: 'Other Token Reserves', width: 220 },
        { field: 'totalSupply', headerName: 'Total LP Supply', width: 180 },
        { field: 'ghstPerUnit', headerName: 'GHST Per Unit', width: 180 },
        { field: 'realFrensRate', headerName: 'Real FRENS Rate', width: 220 },
        { field: 'targetFrensRate', headerName: 'Target FRENS Rate', width: 220 },
        { field: 'modifiedRewards', headerName: 'Modified FRENS', width: 180 },
      ];

      const emissionsColumns = [
        {
          field: 'id',
          headerName: 'Staking',
          width: 200,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/stake-polygon`} target="_blank">
              {params.value}
            </a>
          )
        },
        {
          field: 'contract',
          headerName: 'Contract',
          width: 340,
          renderCell: (params: GridCellParams) => (
            <a href={`${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'currentEmissions', headerName: 'Current FRENS Emissions', width: 260 },
        { field: 'currentEmissionsGhst', headerName: 'CFE (GHST)', width: 160 },
        { field: 'currentEmissionsUsd', headerName: 'CFE (USD)', width: 160 },
        { field: 'modifiedEmissions', headerName: 'Modified FRENS Emissions', width: 260 },
        { field: 'modifiedEmissionsGhst', headerName: 'MFE (GHST)', width: 160 },
        { field: 'modifiedEmissionsUsd', headerName: 'MFE (USD)', width: 160 },
      ];

      let rows = [];
      let emissionsRows = [];

      let totalSupply = 0;
      let ghstPerUnit = 0;
      let realFrensRate = 0;
      let targetFrensRate = 0;
      let modifiedRewards = 0;
      let currentEmissions = 0;
      let modifiedEmissions = 0;
      let currentEmissionsGhst = 0;
      let modifiedEmissionsGhst = 0;
      let currentEmissionsUsd = 0;
      let modifiedEmissionsUsd = 0;

      let cumulativeEmissions = {
        currentEmissions: 0,
        modifiedEmissions: 0,
        currentEmissionsGhst: 0,
        modifiedEmissionsGhst: 0,
        currentEmissionsUsd: 0,
        modifiedEmissionsUsd: 0,
      };

      currentEmissions = parseInt(ethers.utils.formatEther(this.state.rates.ghstStaked));
      modifiedEmissions = currentEmissions;
      currentEmissionsGhst = parseInt(currentEmissions * this.state.rates.ghstFrenPrice);
      modifiedEmissionsGhst = currentEmissionsGhst;
      currentEmissionsUsd = parseInt(currentEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd);
      modifiedEmissionsUsd = parseInt(modifiedEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd);
      cumulativeEmissions.currentEmissions += currentEmissions;
      cumulativeEmissions.modifiedEmissions += modifiedEmissions;
      cumulativeEmissions.currentEmissionsGhst += currentEmissionsGhst;
      cumulativeEmissions.modifiedEmissionsGhst += modifiedEmissionsGhst;

      rows.push({
        id: 'GHST',
        contract: 'https://polygonscan.com/address/0xa02d547512bb90002807499f05495fe9c4c3943f',
        currentRewards: this.state.rates.ghstRate,
        reserve1: parseFloat(ethers.utils.formatEther(this.state.rates.ghstStaked)).toLocaleString(),
        ghstPerUnit: 1,
        realFrensRate: (1).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}),
        targetFrensRate: (1).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}),
        modifiedRewards: (1).toLocaleString(),
      });

      emissionsRows.push({
        id: 'GHST',
        contract: 'https://polygonscan.com/address/0xa02d547512bb90002807499f05495fe9c4c3943f',
        currentEmissions: currentEmissions.toLocaleString(),
        currentEmissionsGhst: currentEmissionsGhst.toLocaleString(),
        modifiedEmissions: modifiedEmissions.toLocaleString(),
        modifiedEmissionsGhst: modifiedEmissionsGhst.toLocaleString(),
        currentEmissionsUsd: currentEmissionsUsd.toLocaleString(),
        modifiedEmissionsUsd: modifiedEmissionsUsd.toLocaleString()
      });

      totalSupply = parseFloat(ethers.utils.formatEther(this.state.rates.ghstQuickSupply));
      ghstPerUnit = (parseFloat(ethers.utils.formatEther(this.state.rates.ghstQuickReserves._reserve0)) * 2) / totalSupply;
      realFrensRate = parseFloat(this.state.rates.ghstQuickRate) / ghstPerUnit;
      targetFrensRate = 1.35;
      modifiedRewards = targetFrensRate * ghstPerUnit;
      currentEmissions = totalSupply * parseFloat(this.state.rates.ghstQuickRate);
      modifiedEmissions = totalSupply * modifiedRewards;
      currentEmissionsGhst = currentEmissions * this.state.rates.ghstFrenPrice;
      modifiedEmissionsGhst = modifiedEmissions * this.state.rates.ghstFrenPrice;
      currentEmissionsUsd = parseInt(currentEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd);
      modifiedEmissionsUsd = parseInt(modifiedEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd);
      cumulativeEmissions.currentEmissions += currentEmissions;
      cumulativeEmissions.modifiedEmissions += modifiedEmissions;
      cumulativeEmissions.currentEmissionsGhst += currentEmissionsGhst;
      cumulativeEmissions.modifiedEmissionsGhst += modifiedEmissionsGhst;

      rows.push({
        id: 'QUICKSWAP GHST QUICK LP',
        contract: 'https://info.quickswap.exchange/pair/0x8b1fd78ad67c7da09b682c5392b65ca7caa101b9',
        currentRewards: parseFloat(this.state.rates.ghstQuickRate).toLocaleString(),
        reserve1: parseFloat(ethers.utils.formatEther(this.state.rates.ghstQuickReserves._reserve0)).toLocaleString(),
        reserve2: parseFloat(ethers.utils.formatEther(this.state.rates.ghstQuickReserves._reserve1)).toLocaleString(),
        totalSupply: totalSupply.toLocaleString(),
        ghstPerUnit: ghstPerUnit.toLocaleString(),
        realFrensRate: realFrensRate.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}),
        targetFrensRate: targetFrensRate.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}),
        modifiedRewards: modifiedRewards.toLocaleString(),
      });

      emissionsRows.push({
        id: 'QUICKSWAP GHST QUICK LP',
        contract: 'https://info.quickswap.exchange/pair/0x8b1fd78ad67c7da09b682c5392b65ca7caa101b9',
        currentEmissions: parseInt(currentEmissions).toLocaleString(),
        modifiedEmissions: parseInt(modifiedEmissions).toLocaleString(),
        currentEmissionsGhst: parseInt(currentEmissionsGhst).toLocaleString(),
        modifiedEmissionsGhst: parseInt(modifiedEmissionsGhst).toLocaleString(),
        currentEmissionsUsd: currentEmissionsUsd.toLocaleString(),
        modifiedEmissionsUsd: modifiedEmissionsUsd.toLocaleString()
      });

      totalSupply = parseFloat(ethers.utils.formatEther(this.state.rates.ghstUsdcSupply));
      ghstPerUnit = (parseFloat(ethers.utils.formatEther(this.state.rates.ghstUsdcReserves._reserve1)) * 2) / totalSupply;
      realFrensRate = parseFloat(this.state.rates.ghstUsdcRate) / ghstPerUnit;
      targetFrensRate = 1.1;
      modifiedRewards = targetFrensRate * ghstPerUnit;
      currentEmissions = totalSupply * parseFloat(this.state.rates.ghstUsdcRate);
      modifiedEmissions = totalSupply * modifiedRewards;
      currentEmissionsGhst = currentEmissions * this.state.rates.ghstFrenPrice;
      modifiedEmissionsGhst = modifiedEmissions * this.state.rates.ghstFrenPrice;
      currentEmissionsUsd = parseInt(currentEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd);
      modifiedEmissionsUsd = parseInt(modifiedEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd);
      cumulativeEmissions.currentEmissions += currentEmissions;
      cumulativeEmissions.modifiedEmissions += modifiedEmissions;
      cumulativeEmissions.currentEmissionsGhst += currentEmissionsGhst;
      cumulativeEmissions.modifiedEmissionsGhst += modifiedEmissionsGhst;

      rows.push({
        id: 'QUICKSWAP GHST USDC LP',
        contract: 'https://info.quickswap.exchange/pair/0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4',
        currentRewards: parseFloat(this.state.rates.ghstUsdcRate).toLocaleString(),
        reserve1: parseFloat(ethers.utils.formatEther(this.state.rates.ghstUsdcReserves._reserve1)).toLocaleString(),
        reserve2: parseFloat(ethers.utils.formatUnits(this.state.rates.ghstUsdcReserves._reserve0, 'mwei')).toLocaleString(),
        totalSupply: totalSupply.toLocaleString(),
        ghstPerUnit: ghstPerUnit.toLocaleString(),
        realFrensRate: realFrensRate.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}),
        targetFrensRate: targetFrensRate.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}),
        modifiedRewards: modifiedRewards.toLocaleString(),
      });

      emissionsRows.push({
        id: 'QUICKSWAP GHST USDC LP',
        contract: 'https://info.quickswap.exchange/pair/0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4',
        currentEmissions: parseInt(currentEmissions).toLocaleString(),
        modifiedEmissions: parseInt(modifiedEmissions).toLocaleString(),
        currentEmissionsGhst: parseInt(currentEmissionsGhst).toLocaleString(),
        modifiedEmissionsGhst: parseInt(modifiedEmissionsGhst).toLocaleString(),
        currentEmissionsUsd: currentEmissionsUsd.toLocaleString(),
        modifiedEmissionsUsd: modifiedEmissionsUsd.toLocaleString()
      });

      totalSupply = parseFloat(ethers.utils.formatEther(this.state.rates.ghstWethSupply));
      ghstPerUnit = (parseFloat(ethers.utils.formatEther(this.state.rates.ghstWethReserves._reserve0)) * 2) / totalSupply;
      realFrensRate = parseFloat(this.state.rates.ghstWethRate) / ghstPerUnit;
      targetFrensRate = 1.2;
      modifiedRewards = targetFrensRate * ghstPerUnit;
      currentEmissions = totalSupply * parseFloat(this.state.rates.ghstWethRate);
      modifiedEmissions = totalSupply * modifiedRewards;
      currentEmissionsGhst = currentEmissions * this.state.rates.ghstFrenPrice;
      modifiedEmissionsGhst = modifiedEmissions * this.state.rates.ghstFrenPrice;
      currentEmissionsUsd = parseInt(currentEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd);
      modifiedEmissionsUsd = parseInt(modifiedEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd);
      cumulativeEmissions.currentEmissions += currentEmissions;
      cumulativeEmissions.modifiedEmissions += modifiedEmissions;
      cumulativeEmissions.currentEmissionsGhst += currentEmissionsGhst;
      cumulativeEmissions.modifiedEmissionsGhst += modifiedEmissionsGhst;
      cumulativeEmissions.currentEmissionsUsd = cumulativeEmissions.currentEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd;
      cumulativeEmissions.modifiedEmissionsUsd = cumulativeEmissions.modifiedEmissionsGhst * this.state.rates.tokenPrices.aavegotchi.usd;

      rows.push({
        id: 'QUICKSWAP GHST WETH LP',
        contract: 'https://info.quickswap.exchange/pair/0xccb9d2100037f1253e6c1682adf7dc9944498aff',
        currentRewards: parseFloat(this.state.rates.ghstWethRate).toLocaleString(),
        reserve1: parseFloat(ethers.utils.formatEther(this.state.rates.ghstWethReserves._reserve0)).toLocaleString(),
        reserve2: parseFloat(ethers.utils.formatEther(this.state.rates.ghstWethReserves._reserve1)).toLocaleString(),
        totalSupply: totalSupply.toLocaleString(),
        ghstPerUnit: ghstPerUnit.toLocaleString(),
        realFrensRate: realFrensRate.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}),
        targetFrensRate: targetFrensRate.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}),
        modifiedRewards: modifiedRewards.toLocaleString(),
      });

      emissionsRows.push({
        id: 'QUICKSWAP GHST WETH LP',
        contract: 'https://info.quickswap.exchange/pair/0xccb9d2100037f1253e6c1682adf7dc9944498aff',
        currentEmissions: parseInt(currentEmissions).toLocaleString(),
        modifiedEmissions: parseInt(modifiedEmissions).toLocaleString(),
        currentEmissionsGhst: parseInt(currentEmissionsGhst).toLocaleString(),
        modifiedEmissionsGhst: parseInt(modifiedEmissionsGhst).toLocaleString(),
        currentEmissionsUsd: currentEmissionsUsd.toLocaleString(),
        modifiedEmissionsUsd: modifiedEmissionsUsd.toLocaleString()
      });

      totalSupply = parseFloat(ethers.utils.formatEther(this.state.rates.ghstMaticSupply));
      ghstPerUnit = (parseFloat(ethers.utils.formatEther(this.state.rates.ghstMaticReserves._reserve1)) * 2) / totalSupply;

      rows.push({
        id: 'SUSHISWAP GHST MATIC LP',
        contract: 'https://analytics-polygon.sushi.com/pairs/0xf69e93771f11aecd8e554aa165c3fe7fd811530c',
        currentRewards: 0,
        reserve1: parseFloat(ethers.utils.formatEther(this.state.rates.ghstMaticReserves._reserve1)).toLocaleString(),
        reserve2: parseFloat(ethers.utils.formatEther(this.state.rates.ghstMaticReserves._reserve0)).toLocaleString(),
        totalSupply: totalSupply.toLocaleString(),
        ghstPerUnit: ghstPerUnit.toLocaleString(),
      });

      totalSupply = parseFloat(ethers.utils.formatEther(this.state.rates.ghstEthUniswapSupply));
      ghstPerUnit = (parseFloat(ethers.utils.formatEther(this.state.rates.ghstEthUniswapReserves._reserve0)) * 2) / totalSupply;

      rows.push({
        id: 'UNISWAP GHST WETH LP',
        contract: 'https://v2.info.uniswap.org/pair/0xab659dee3030602c1af8c29d146facd4aed6ec85',
        currentRewards: 0,
        reserve1: parseFloat(ethers.utils.formatEther(this.state.rates.ghstEthUniswapReserves._reserve0)).toLocaleString(),
        reserve2: parseFloat(ethers.utils.formatEther(this.state.rates.ghstEthUniswapReserves._reserve1)).toLocaleString(),
        totalSupply: totalSupply.toLocaleString(),
        ghstPerUnit: ghstPerUnit.toLocaleString(),
      });

      return (
        <div>
          <h2>Actual vs Target Frens Rates</h2>
          <div style={{ height: '400px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
          <h2>Daily Emissions</h2>
          <p>FRENS Emissions are calculated in GHST by assuming the FRENS can be converted to tickets and sold at the current <a href='https://aavegotchistats.com/floor'>ticket floor price</a> of {(this.state.rates.ghstFrenPrice).toFixed(6)} GHST / fren</p>
          <div style={{ height: '300px', width: '100%' }}>
            <DataGrid rows={emissionsRows} columns={emissionsColumns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
          <p>Cumulative Current Daily Emissions: {parseInt(cumulativeEmissions.currentEmissions).toLocaleString()} FRENS which equates to {parseInt(cumulativeEmissions.currentEmissionsGhst).toLocaleString()} GHST or {parseInt(cumulativeEmissions.currentEmissionsUsd).toLocaleString()} USD</p>
          <p>Cumulative Modified Daily Emissions: {parseInt(cumulativeEmissions.modifiedEmissions).toLocaleString()} FRENS which equates to {parseInt(cumulativeEmissions.modifiedEmissionsGhst).toLocaleString()} GHST or {parseInt(cumulativeEmissions.modifiedEmissionsUsd).toLocaleString()} USD</p>
        </div>
      );
    } else {
      return (
        <p>Loading staking balances from smart contracts...</p>
      );
    }
  }

  render() {
    return(
      <div>
        {this.renderRates()}
      </div>
    )
  }
}

export default FrensRates;
