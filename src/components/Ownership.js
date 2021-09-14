import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveH1Portals, retrieveH2Portals, retrieveH1OpenPortals, retrieveH2OpenPortals, retrieveSacrificedGotchis, retrieveErc721ListingsByTokenIds } from '../util/Graph';

import aavegotchiContractAbi from '../abi/diamond.json';
import ghstStakingContractAbi from '../abi/StakingFacet.json';
import { connectToMatic } from '../util/MaticClient';

import { ethers } from "ethers";

const _ = require('lodash');
const axios = require('axios');

class Ownership extends Component {
  constructor(props) {
    super(props);

    this.state = {
      h1Portals: [],
      h1SacrificedGotchis: [],

      h2Portals: [],
      h2SacrificedGotchis: [],

      owners: [],

      frens: {},

      loading: true,
    };

    const maticPOSClient = connectToMatic();
    this.aavegotchiContract = new maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, '0x86935F11C86623deC8a25696E1C19a8659CbF95d');
    this.stakingContract = new maticPOSClient.web3Client.web3.eth.Contract(ghstStakingContractAbi, '0xA02d547512Bb90002807499F05495Fe9C4C3943f');

    console.log(this.aavegotchiContract);
    console.log(this.stakingContract);
  }

  async componentDidMount() {
    retrieveH1Portals()
      .then((h1Portals) => {
        retrieveH2Portals()
          .then(async (h2Portals) => {
            let h1UniqueOwners = {};
            let h2UniqueOwners = {};
            let allUniqueOwners = {};
            let kinshipUniqueOwners = {};
            let experienceUniqueOwners = {};
            _.reject(h1Portals, ['owner.id', '0x0000000000000000000000000000000000000000']).map((portal) => {
              if (h1UniqueOwners[portal.owner.id]) {
                h1UniqueOwners[portal.owner.id]++;
              } else {
                h1UniqueOwners[portal.owner.id] = 1;
              }

              if (allUniqueOwners[portal.owner.id]) {
                allUniqueOwners[portal.owner.id]++;
              } else {
                allUniqueOwners[portal.owner.id] = 1;
              }

              if (portal.gotchi != null) {
                if (kinshipUniqueOwners[portal.owner.id]) {
                  kinshipUniqueOwners[portal.owner.id] += parseInt(portal.gotchi.kinship);
                } else {
                  kinshipUniqueOwners[portal.owner.id] = parseInt(portal.gotchi.kinship);
                }

                if (experienceUniqueOwners[portal.owner.id]) {
                  experienceUniqueOwners[portal.owner.id] += parseInt(portal.gotchi.experience);
                } else {
                  experienceUniqueOwners[portal.owner.id] = parseInt(portal.gotchi.experience);
                }
              }
            });

            _.reject(h2Portals, ['owner.id', '0x0000000000000000000000000000000000000000']).map((portal) => {
              if (h2UniqueOwners[portal.owner.id]) {
                h2UniqueOwners[portal.owner.id]++;
              } else {
                h2UniqueOwners[portal.owner.id] = 1;
              }

              if (allUniqueOwners[portal.owner.id]) {
                allUniqueOwners[portal.owner.id]++;
              } else {
                allUniqueOwners[portal.owner.id] = 1;
              }

              if (portal.gotchi != null) {
                if (kinshipUniqueOwners[portal.owner.id]) {
                  kinshipUniqueOwners[portal.owner.id] += parseInt(portal.gotchi.kinship);
                } else {
                  kinshipUniqueOwners[portal.owner.id] = parseInt(portal.gotchi.kinship);
                }

                if (experienceUniqueOwners[portal.owner.id]) {
                  experienceUniqueOwners[portal.owner.id] += parseInt(portal.gotchi.experience);
                } else {
                  experienceUniqueOwners[portal.owner.id] = parseInt(portal.gotchi.experience);
                }
              }
            });

            let owners = Object.keys(allUniqueOwners).map((id) => ({
              id,
              portalCount: allUniqueOwners[id],
              h1PortalCount: h1UniqueOwners[id] ? h1UniqueOwners[id] : 0,
              h2PortalCount: h2UniqueOwners[id] ? h2UniqueOwners[id] : 0,
              kinship: kinshipUniqueOwners[id] ? kinshipUniqueOwners[id] : 0,
              experience: experienceUniqueOwners[id] ? experienceUniqueOwners[id] : 0,
            }));

            owners = _.orderBy(owners, ['portalCount'], ['desc']);

            console.log('owners', owners);


            let h1Owners = Object.keys(h1UniqueOwners).map(id => ({ id, portalCount: h1UniqueOwners[id] }));
            h1Owners = _.orderBy(h1Owners, ['portalCount'], ['desc']);
            console.log('h1Owners', h1Owners);

            let h2Owners = Object.keys(h2UniqueOwners).map(id => ({ id, portalCount: h2UniqueOwners[id] }));
            h2Owners = _.orderBy(h2Owners, ['portalCount'], ['desc']);
            console.log('h2Owners', h2Owners);

            let allOwners = Object.keys(allUniqueOwners).map(id => ({ id, portalCount: allUniqueOwners[id] }));
            allOwners = _.orderBy(allOwners, ['portalCount'], ['desc']);
            console.log('allOwners', allOwners);

            let kinshipOwners = Object.keys(kinshipUniqueOwners).map(id => ({ id, kinship: kinshipUniqueOwners[id] }));
            kinshipOwners = _.orderBy(kinshipOwners, ['kinship'], ['desc']);
            console.log('kinshipOwners', kinshipOwners);

            let experienceOwners = Object.keys(experienceUniqueOwners).map(id => ({ id, experience: experienceUniqueOwners[id] }));
            experienceOwners = _.orderBy(experienceOwners, ['experience'], ['desc']);
            console.log('experienceOwners', experienceOwners);

            console.log('h1Portals', h1Portals, 'h2Portals', h2Portals );
            console.log('allOwners', allOwners);
            this.setState({ h1Portals, h2Portals, owners, loading: false });

            let addresses = Object.keys(allUniqueOwners);
            let addressList = [];
            let promisesList = [];
            let delta = 80;

            for (let start = 0; start < addresses.length; start += delta) {
              let end = Math.min(addresses.length + 1, start + delta);

              let a = addresses.slice(start, end);
              addressList.push(a);

              let p = await this.stakingContract.methods.bulkFrens(a).call();
              promisesList.push(p);
            }

            const _this = this;
            Promise.all([promisesList]).then((values) => {
              console.log('promise all', values);
              let frens = {};
              for (var v = 0; v < values[0].length; v++) {
                for (var i = 0; i < addressList[v].length; i++) {
                  let address = addressList[v][i];
                  var f = values[0][v][i];
                  frens[address] = parseInt(ethers.utils.formatEther(f));
                }
              }
              _this.setState({ frens });
            });

          });
      });
  }

  renderOwners() {
    if (this.state.owners.length > 0 && Object.keys(this.state.frens).length > 0) {
      const columns = [
        {
          field: 'id',
          headerName: 'Owner',
          width: 360,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/aavegotchis/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'portalCount', headerName: 'Owned Portals', width: 220 },
        { field: 'h1PortalCount', headerName: 'H1 Portals', width: 220 },
        { field: 'h2PortalCount', headerName: 'H2 Portals', width: 220 },
        { field: 'kinship', headerName: 'Total Kinship', width: 220 },
        { field: 'experience', headerName: 'Total Experience', width: 220 },
        { field: 'frens', headerName: 'Total Frens', width: 400 },
      ];

      let rows = [...this.state.owners];
      for (var r = 0; r < rows.length; r++) {
        rows[r].frens = this.state.frens[rows[r].id];
      }

      return (
        <div>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={this.state.owners} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
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
        <h2>Portal Owner's Fren Balances</h2>
        {this.renderOwners()}
      </div>
    )
  }
}

export default Ownership;
