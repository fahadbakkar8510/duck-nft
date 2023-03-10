/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import { ethers } from 'ethers';
import { ChainId } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { emptyDuckData, OWNERSHIP_TOKEN_ID, BURN_WINDOW, contractAbi } from './constants';
import proofs from '../data/proofs.json';
import { MachineConfig, MachineState, Motd } from '../types/types';

const staticDuckData = Object.values(proofs).map((proof, index) => {
  return { id: index, ...proof, ...emptyDuckData };
});

const { REACT_APP_MACHINE_CONTRACT_ADDRESS: contractAddress = '', REACT_APP_INFURA_API_KEY, REACT_APP_CHAIN_ID, REACT_APP_ENV } = process.env;
const CHAIN_ID = REACT_APP_ENV === 'production' ? ChainId.Mainnet : ChainId.Rinkeby;
const CHAIN_NAME = CHAIN_ID === 1 ? 'mainnet' : 'rinkeby';

declare const window: any;
const injectedProvider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : undefined;
const infuraProvider = new ethers.providers.InfuraProvider(CHAIN_NAME, REACT_APP_INFURA_API_KEY);
const ethereumProvider = injectedProvider ? injectedProvider.getSigner() : infuraProvider;
export const contract = new Contract(contractAddress, contractAbi, ethereumProvider) as any;

const getMachineConfig = async () => {
  const duckMachineContract = new ethers.Contract(contractAddress, contractAbi, infuraProvider);
  const config = await duckMachineContract.machineConfig();
  return config;
};

const getMintedDucks = async () => {
  const duckMachineContract = new ethers.Contract(contractAddress, contractAbi, infuraProvider);
  const eventFilter = duckMachineContract.filters.DuckMinted();
  const events = await duckMachineContract.queryFilter(eventFilter);

  const burnedFilter = duckMachineContract.filters.CustomDuckBurned();
  const burnEvents = await duckMachineContract.queryFilter(burnedFilter);
  let parsedEvents;

  parsedEvents = events.filter((event) => {
    const burned = burnEvents.find((burnEvent) => burnEvent?.args?.duckId.toNumber() === event?.args?.tokenId.toNumber());
    return !burned;
  });

  if (events.length) {
    parsedEvents = await Promise.all(parsedEvents.map(async (event) => {
      const tokenId = parseInt(event?.args?.tokenId._hex);
      const salePrice = parseInt(event?.args?.price._hex);
      const duckType = event?.args?.duckType;
      const owner = await duckMachineContract.ownerOf(tokenId);
      const tokenURI = await duckMachineContract.tokenURI(tokenId);
      const tokenURIRes = await axios.get(tokenURI);
      const timestamp = await (await (event.getBlock())).timestamp;
      let webp;
      let metadata = {};
      if (tokenURIRes.statusText === 'OK') {
        webp = tokenURIRes.data.image;
        metadata = tokenURIRes.data;
      }
      return {
        id: tokenId,
        salePrice,
        isCustom: !!duckType,
        owner,
        webp,
        metadata,
        hatched: timestamp * 1000,
      };
    }));
  }
  return parsedEvents;
};

const getTotalSales = async () => {
  const mintedDucks = await getMintedDucks();
  const totalSales = mintedDucks.reduce((acc, val) => acc + val.salePrice, 0);
  return ethers.utils.formatEther(totalSales);
};

const getMintsCount = async () => {
  const mintedDucks = await getMintedDucks();
  const tozziDuckCount = mintedDucks.filter((duck) => !duck.isCustom).length;
  const customDuckCount = mintedDucks.filter((duck) => duck.isCustom).length;

  return {
    tozzi: tozziDuckCount,
    custom: customDuckCount,
  };
};

const fetchDucks = async () => {
  let mintedDuckIds: number[] = [];
  const ducksMinted = await getMintedDucks() ?? [];
  const formatedMintedDucks = ducksMinted.map((duck, index) => {
    const { id, salePrice, isCustom, owner, webp, hatched, metadata } = duck;
    const { proof } = staticDuckData[index];
    mintedDuckIds = [...mintedDuckIds, id];
    const status = metadata.attributes.find((a) => a.trait_type === 'Status');
    return {
      id,
      proof,
      webp: isCustom ? webp : staticDuckData.find((duck) => duck.id === id)?.webp,
      metadata,
      owner,
      salePrice,
      isCustom,
      hatched: hatched as number,
      burnable: (isCustom && hatched > 0) && (hatched + BURN_WINDOW) > Date.now() && status?.value === 'Probation',
    };
  });
  const mintedDucks = formatedMintedDucks.filter((duck) => duck.id !== OWNERSHIP_TOKEN_ID);
  const mintedTozziDucks = mintedDucks.filter((duck) => !duck.isCustom);
  const mintedCustomDucks = mintedDucks.filter((duck) => duck.isCustom);
  const nonMintedDucks = staticDuckData.filter((duck) => !mintedDucks.includes(duck.id));
  const ducks = nonMintedDucks.map((obj) => mintedTozziDucks.find((o) => o.id === obj.id) || obj);

  const finalDucks = [...ducks, ...mintedCustomDucks];
  return finalDucks;
};

const fetchMachineConfig = async (): Promise<MachineConfig> => {
  const machineConfig = await getMachineConfig();

  return {
    tozziMintStatus: parseInt(machineConfig.tozziDuckMintStatus),
    tozziMintPrice: ethers.utils.formatEther(machineConfig.tozziDuckPrice),
    customMintStatus: parseInt(machineConfig.customDuckMintStatus),
    customMintPrice: ethers.utils.formatEther(machineConfig.customDuckPrice),
    maxCustomDucks: parseInt(machineConfig.maxCustomDucks),
  };
};

const fetchMotd = async (): Promise<Motd> => {
  const blocksPerMonth = 172800;
  const currBlock = await infuraProvider.getBlockNumber();
  const duckMachineContract = new ethers.Contract(contractAddress, contractAbi, infuraProvider);
  const eventFilter = duckMachineContract.filters.MOTDSet();
  // Get MotD set in the past 30 days:
  const events = await duckMachineContract.queryFilter(eventFilter, currBlock - blocksPerMonth, currBlock);

  if (events.length) {
    // return most recent MotD
    const latestMessage = events[events.length - 1];
    const posted = (await infuraProvider.getBlock(latestMessage.blockNumber)).timestamp;
    return {
      posted: (new Date(posted * 1000)).toLocaleDateString(),
      owner: latestMessage.args?.owner,
      message: latestMessage.args?.message,
    };
  }
  return {};
};

const fetchMachineState = async (): Promise<MachineState> => {
  const duckMachineContract = new ethers.Contract(contractAddress, contractAbi, infuraProvider);
  const machineOwner = await duckMachineContract.ownerOf(OWNERSHIP_TOKEN_ID);
  const ownerEns = await infuraProvider.lookupAddress(machineOwner);
  const balance = await injectedProvider?.getBalance(contractAddress);
  const duckMintsCount = await getMintsCount();
  const machineConfig = await fetchMachineConfig();
  const motd = await fetchMotd();

  return {
    owner: machineOwner,
    ownerEns,
    tozziMints: duckMintsCount.tozzi,
    customMints: duckMintsCount.custom,
    balance: ethers.utils.formatEther(balance!),
    config: machineConfig,
    motd,
  };
};

export { fetchDucks, fetchMachineConfig, fetchMachineState };
