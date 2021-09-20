import { ethers } from "ethers";

export const connectToEth = () => {
  const apiKeys = JSON.parse(process.env.REACT_APP_RPC_CONFIG);
  const parentProvider = `https://mainnet.infura.io/v3/${apiKeys.infura}`;

  const provider = new ethers.providers.InfuraProvider("mainnet", apiKeys.infura);

  console.log('provider', provider);

  return provider;
};
