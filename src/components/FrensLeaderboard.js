import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveTopFrensHolders } from '../util/StakingUtil';

import { ethers } from "ethers";

const _ = require('lodash');
const axios = require('axios');

class FrensLeaderboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      frensHolders: []
    };
  }

  async componentDidMount() {
    retrieveTopFrensHolders()
      .then((frensHolders) => {
          console.log(frensHolders);

          let rows = [...frensHolders];
          for (var r = 0; r < rows.length; r++) {
            rows[r].frens = parseInt(ethers.utils.formatEther(rows[r].frens));

            let ghstPool = _.find(rows[r].pools, ['id', `GHST_${rows[r].id}`]);
            if (ghstPool == undefined) {
              rows[r].stakedGHST = 0;
            } else {
              rows[r].stakedGHST = parseInt(ethers.utils.formatEther(ghstPool.staked));
            }

            let ghstQuick = _.find(rows[r].pools, ['id', `GHST-QUCIK_${rows[r].id}`]);
            if (ghstQuick == undefined) {
              rows[r].ghstQuick = 0;
            } else {
              rows[r].ghstQuick = parseInt(ethers.utils.formatEther(ghstQuick.staked));
            }

            let ghstUsdc = _.find(rows[r].pools, ['id', `GHST-USDC_${rows[r].id}`]);
            if (ghstUsdc == undefined) {
              rows[r].ghstUsdc = 0;
            } else {
              rows[r].ghstUsdc = parseFloat(ethers.utils.formatEther(ghstUsdc.staked));
            }

            let ghstWeth = _.find(rows[r].pools, ['id', `GHST-WETH_${rows[r].id}`]);
            if (ghstWeth == undefined) {
              rows[r].ghstWeth = 0;
            } else {
              rows[r].ghstWeth = parseFloat(ethers.utils.formatEther(ghstWeth.staked));
            }
          }

          this.setState({frensHolders: rows})
      });
  }

  renderLeaderboard() {
    if (this.state.frensHolders.length > 0) {
      const columns = [
        {
          field: 'id',
          headerName: 'Address',
          width: 360,
          renderCell: (params: GridCellParams) => (
            <a href={`https://polygonscan.com/address/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        {
          field: 'frens', headerName: 'FRENS', width: 250,
          renderCell: (params: GridCellParams) => (
            params.value.toLocaleString()
          )
        },
        {
          field: 'stakedGHST', headerName: 'Staked GHST', width: 250,
          renderCell: (params: GridCellParams) => (
            params.value.toLocaleString()
          )
        },
        {
          field: 'ghstQuick', headerName: 'Staked GHST-QUICK', width: 250,
          renderCell: (params: GridCellParams) => (
            params.value.toLocaleString()
          )
        },
        {
          field: 'ghstUsdc', headerName: 'Staked GHST-USDC', width: 250,
          renderCell: (params: GridCellParams) => (
            params.value.toLocaleString()
          )
        },
        {
          field: 'ghstWeth', headerName: 'Staked GHST-WETH', width: 250,
          renderCell: (params: GridCellParams) => (
            params.value.toLocaleString()
          )
        }
      ];

      return (
        <div>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={this.state.frensHolders} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    } else {
      return (
        <p>Loading portals and FRENS balances...</p>
      );
    }
  }

  render() {
    return(
      <div>
        <h2>FRENS Leaderboard</h2>
        <p>Sourced from the <a href='https://thegraph.com/hosted-service/subgraph/froid1911/aavegotchi-subgraph-alpha'>Aavegotchi Subgraph</a></p>
        {this.renderLeaderboard()}
      </div>
    )
  }
}

export default FrensLeaderboard;
