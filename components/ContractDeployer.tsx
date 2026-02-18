'use client';

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  FileCode2,
  Wallet,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Zap,
  Hash,
  Clock,
  Box,
  Share2,
  User,
  Plus,
  Sparkles,
  Trophy,
  Crown,
  Rocket,
  Gem,
  Star,
  Flame,
  X,
  Download,
  Twitter,
  MessageCircle
} from 'lucide-react';
import { sdk } from '@farcaster/miniapp-sdk';
import { encodeFunctionData, decodeEventLog, createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';

// Type for Farcaster user context
interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

// Type for deployed contract history
interface DeployedContract {
  address: string;
  contractType: string;
  contractName: string;
  txHash: string;
  timestamp: number;
  inputValue?: string;
  gasSpent?: string; // In Wei
}

// Factory Contract Addresses
// Base Mainnet: 0xE94d001ae44ff0887FB0136D7DDbFa9d1332EEd3
// Base Sepolia: 0x21E3Bf30a9cf163407cC25197E1152C80490a02E
const FACTORY_CONTRACT_ADDRESSES = {
  mainnet: '0xE94d001ae44ff0887FB0136D7DDbFa9d1332EEd3',
  testnet: '0x21E3Bf30a9cf163407cC25197E1152C80490a02E',
} as const;

// Network configuration
const NETWORKS = {
  mainnet: {
    name: 'Base Mainnet',
    chainId: '0x2105', // 8453
    chainIdNumber: 8453,
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    factoryAddress: FACTORY_CONTRACT_ADDRESSES.mainnet,
  },
  testnet: {
    name: 'Base Sepolia',
    chainId: '0x14a34', // 84532
    chainIdNumber: 84532,
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    factoryAddress: FACTORY_CONTRACT_ADDRESSES.testnet,
  },
} as const;

type NetworkType = keyof typeof NETWORKS;

// Factory Contract ABI
const FACTORY_ABI = [
  {
    "inputs": [{"internalType": "bytes", "name": "bytecode", "type": "bytes"}],
    "name": "deployContractWithParams",
    "outputs": [{"internalType": "address", "name": "deployedAddress", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "deployedAddress", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "deployer", "type": "address"},
      {"indexed": true, "internalType": "bytes32", "name": "salt", "type": "bytes32"}
    ],
    "name": "ContractDeployed",
    "type": "event"
  }
] as const;

// Click Counter Contract ABI
const CLICK_COUNTER_ABI = [
  {
    inputs: [],
    name: 'click',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'clickCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getClickCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserClickCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMyClickCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// REAL CONTRACT TEMPLATES - Compiled with Solidity 0.8.19 via Hardhat
const CONTRACT_TEMPLATES = {
  string: {
    name: "String Storage",
    description: "Store and retrieve a string value",
    bytecode: "0x608060405234801561001057600080fd5b5060405161041238038061041283398101604081905261002f91610058565b600061003b82826101aa565b5050610269565b634e487b7160e01b600052604160045260246000fd5b6000602080838503121561006b57600080fd5b82516001600160401b038082111561008257600080fd5b818501915085601f83011261009657600080fd5b8151818111156100a8576100a8610042565b604051601f8201601f19908116603f011681019083821181831017156100d0576100d0610042565b8160405282815288868487010111156100e857600080fd5b600093505b8284101561010a57848401860151818501870152928501926100ed565b600086848301015280965050505050505092915050565b600181811c9082168061013557607f821691505b60208210810361015557634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156101a557600081815260208120601f850160051c810160208610156101825750805b601f850160051c820191505b818110156101a15782815560010161018e565b5050505b505050565b81516001600160401b038111156101c3576101c3610042565b6101d7816101d18454610121565b8461015b565b602080601f83116001811461020c57600084156101f45750858301515b600019600386901b1c1916600185901b1785556101a1565b600085815260208120601f198616915b8281101561023b5788860151825594840194600190910190840161021c565b50858210156102595787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b61019a806102786000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80633fa4f24514610030575b600080fd5b61003861004e565b60405161004591906100dc565b60405180910390f35b6000805461005b9061012a565b80601f01602080910402602001604051908101604052809291908181526020018280546100879061012a565b80156100d45780601f106100a9576101008083540402835291602001916100d4565b820191906000526020600020905b8154815290600101906020018083116100b757829003601f168201915b505050505081565b600060208083528351808285015260005b81811015610109578581018301518582016040015282016100ed565b506000604082860101526040601f19601f8301168501019250505092915050565b600181811c9082168061013e57607f821691505b60208210810361015e57634e487b7160e01b600052602260045260246000fd5b5091905056fea26469706673582212201896186d8023c8890809ba2e34d529de3be16e577695c0d06d7912de42e0a71c64736f6c63430008130033",
    abi: [
      {
        "inputs": [{"internalType": "string", "name": "_value", "type": "string"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "value",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    hasInput: true,
    inputType: "string",
    inputLabel: "Initial String Value",
    inputPlaceholder: "Enter a string to store...",
    icon: FileCode2
  },
  calculator: {
    name: "Calculator",
    description: "Store a number and perform arithmetic",
    bytecode: "0x608060405234801561001057600080fd5b506040516101dc3803806101dc83398101604081905261002f91610037565b600055610050565b60006020828403121561004957600080fd5b5051919050565b61017d8061005f6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063165c4a16146100515780633ef5e445146100765780636537214714610089578063771602f714610092575b600080fd5b61006461005f3660046100d2565b6100a5565b60405190815260200160405180910390f35b6100646100843660046100d2565b6100ba565b61006460005481565b6100646100a03660046100d2565b6100c6565b60006100b1828461010a565b90505b92915050565b60006100b18284610121565b60006100b18284610134565b600080604083850312156100e557600080fd5b50508035926020909101359150565b634e487b7160e01b600052601160045260246000fd5b80820281158282048414176100b4576100b46100f4565b818103818111156100b4576100b46100f4565b808201808211156100b4576100b46100f456fea2646970667358221220363dc859aae181dcf18cff8e03199d10b99a6dd9da525db9313bf2bc1d51b12f64736f6c63430008130033",
    abi: [
      {
        "inputs": [{"internalType": "uint256", "name": "_initial", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "result",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "a", "type": "uint256"},
          {"internalType": "uint256", "name": "b", "type": "uint256"}
        ],
        "name": "add",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "a", "type": "uint256"},
          {"internalType": "uint256", "name": "b", "type": "uint256"}
        ],
        "name": "subtract",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "a", "type": "uint256"},
          {"internalType": "uint256", "name": "b", "type": "uint256"}
        ],
        "name": "multiply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "pure",
        "type": "function"
      }
    ],
    hasInput: true,
    inputType: "number",
    inputLabel: "Initial Number",
    inputPlaceholder: "Enter initial value (e.g. 100)",
    icon: Hash
  },
  counter: {
    name: "Simple Counter",
    description: "A counter starting at zero",
    bytecode: "0x608060405234801561001057600080fd5b5060c98061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306661abd146037578063d09de08a146051575b600080fd5b603f60005481565b60405190815260200160405180910390f35b60576059565b005b600080549080606683606d565b9190505550565b600060018201608c57634e487b7160e01b600052601160045260246000fd5b506001019056fea2646970667358221220a02110a9a84ab223d1690a10c39cb0c3bca1e90e51d76ed4e57cbeca5e4c8c5264736f6c63430008130033",
    abi: [
      {
        "inputs": [],
        "name": "count",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "increment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    hasInput: false,
    icon: Zap
  },
  greeter: {
    name: "Greeter",
    description: "Store a greeting message on-chain",
    bytecode: "0x608060405234801561000f575f5ffd5b5060405161047938038061047983398101604081905261002e91610054565b5f6100398282610193565b5050610251565b634e487b7160e01b5f52604160045260245ffd5b5f60208284031215610064575f5ffd5b81516001600160401b03811115610079575f5ffd5b8201601f81018413610089575f5ffd5b80516001600160401b038111156100a2576100a2610040565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d0576100d0610040565b6040528181528282016020018610156100e7575f5ffd5b8160208401602083015e5f91810160200191909152949350505050565b600181811c9082168061011857607f821691505b60208210810361013657634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561018e578282111561018e57805f5260205f20601f840160051c602085101561016757505f5b90810190601f840160051c035f5b8181101561018a575f83820155600101610175565b5050505b505050565b81516001600160401b038111156101ac576101ac610040565b6101c0816101ba8454610104565b8461013c565b6020601f8211600181146101f2575f83156101db5750848201515b5f19600385901b1c1916600184901b17845561024a565b5f84815260208120601f198516915b828110156102215787850151825560209485019460019092019101610201565b508482101561023e57868401515f19600387901b60f8161c191681555b505060018360011b0184555b5050505050565b61021b8061025e5f395ff3fe608060405234801561000f575f5ffd5b5060043610610034575f3560e01c8063cfae321714610038578063ef690cc014610056575b5f5ffd5b61004061005e565b60405161004d9190610178565b60405180910390f35b6100406100ed565b60605f805461006c906101ad565b80601f0160208091040260200160405190810160405280929190818152602001828054610098906101ad565b80156100e35780601f106100ba576101008083540402835291602001916100e3565b820191905f5260205f20905b8154815290600101906020018083116100c657829003601f168201915b5050505050905090565b5f80546100f9906101ad565b80601f0160208091040260200160405190810160405280929190818152602001828054610125906101ad565b80156101705780601f1061014757610100808354040283529160200191610170565b820191905f5260205f20905b81548152906001019060200180831161015357829003601f168201915b505050505081565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b600181811c908216806101c157607f821691505b6020821081036101df57634e487b7160e01b5f52602260045260245ffd5b5091905056fea26469706673582212204e93a7aa214a8558cb02ccb2a58260467c45ec5737bd1111fd637b31e3600ca964736f6c63430008210033",
    abi: [
      {
        "inputs": [{"internalType": "string", "name": "_greeting", "type": "string"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "greet",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "greeting",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    hasInput: true,
    inputType: "string",
    inputLabel: "Greeting Message",
    inputPlaceholder: "Hello, Base!",
    icon: MessageCircle
  },
  messageboard: {
    name: "Message Board",
    description: "Post a public message on-chain",
    bytecode: "0x608060405234801561000f575f5ffd5b5060405161041b38038061041b83398101604081905261002e91610066565b5f61003982826101a5565b5050600180546001600160a01b03191633179055610263565b634e487b7160e01b5f52604160045260245ffd5b5f60208284031215610076575f5ffd5b81516001600160401b0381111561008b575f5ffd5b8201601f8101841361009b575f5ffd5b80516001600160401b038111156100b4576100b4610052565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100e2576100e2610052565b6040528181528282016020018610156100f9575f5ffd5b8160208401602083015e5f91810160200191909152949350505050565b600181811c9082168061012a57607f821691505b60208210810361014857634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156101a057828211156101a057805f5260205f20601f840160051c602085101561017957505f5b90810190601f840160051c035f5b8181101561019c575f83820155600101610187565b5050505b505050565b81516001600160401b038111156101be576101be610052565b6101d2816101cc8454610116565b8461014e565b6020601f821160018114610204575f83156101ed5750848201515b5f19600385901b1c1916600184901b17845561025c565b5f84815260208120601f198516915b828110156102335787850151825560209485019460019092019101610213565b508482101561025057868401515f19600387901b60f8161c191681555b505060018360011b0184555b5050505050565b6101ab806102705f395ff3fe608060405234801561000f575f5ffd5b5060043610610034575f3560e01c8063a6c3e6b914610038578063e21f37ce14610068575b5f5ffd5b60015461004b906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b61007061007d565b60405161005f9190610108565b5f80546100899061013d565b80601f01602080910402602001604051908101604052809291908181526020018280546100b59061013d565b80156101005780601f106100d757610100808354040283529160200191610100565b820191905f5260205f20905b8154815290600101906020018083116100e357829003601f168201915b505050505081565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b600181811c9082168061015157607f821691505b60208210810361016f57634e487b7160e01b5f52602260045260245ffd5b5091905056fea2646970667358221220d11c89199455c2af06f4a9bee84dff54ee555e5781d75de41e683019f7d84b7764736f6c63430008210033",
    abi: [
      {
        "inputs": [{"internalType": "string", "name": "_message", "type": "string"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "message",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    hasInput: true,
    inputType: "string",
    inputLabel: "Your Message",
    inputPlaceholder: "Gm from Base!",
    icon: Box
  },
  numberstore: {
    name: "Number Store",
    description: "Store any number on-chain",
    bytecode: "0x6080604052348015600e575f5ffd5b5060405160c938038060c98339810160408190526029916045565b5f556050565b5f60208284031215603e575f5ffd5b5051919050565b607f806100585f395ff3fe6080604052348015600e575f5ffd5b50600436106026575f3560e01c80638381f58a14602a575b5f5ffd5b60305f5481565b60405190815260200160405180910390f3fea26469706673582212204d7bc59b5165bd2ec651f84c96bc5971613b1d0ee8d6829fdcb3bbc1fc20f05b64736f6c63430008210033",
    abi: [
      {
        "inputs": [{"internalType": "uint256", "name": "_number", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "number",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    hasInput: true,
    inputType: "number",
    inputLabel: "Your Lucky Number",
    inputPlaceholder: "Enter any number (e.g. 42)",
    icon: Hash
  }
};

const STORAGE_KEY = 'base-deployer-contracts';
const SHOW_HISTORY_KEY = 'base-deployer-show-history';
const ACHIEVEMENTS_KEY = 'base-deployer-achievements';
const REFERRAL_KEY = 'base-deployer-referral';
const NETWORK_KEY = 'base-deployer-network';

// Achievement system
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  milestone: number;
  unlocked: boolean;
  unlockedAt?: number;
}

// Helper function to format ETH balance
const formatBalance = (weiAmount: string, priceInUsd: number = 2500) => {
  try {
    const wei = BigInt(weiAmount);
    const eth = Number(wei) / 1e18;
    
    return {
      wei: weiAmount,
      eth: eth.toFixed(6),
      ethShort: eth.toFixed(4),
      usd: (eth * priceInUsd).toFixed(2)
    };
  } catch (e) {
    return { wei: '0', eth: '0', ethShort: '0', usd: '0' };
  }
};

// Helper function to format gas costs
const formatGasSpent = (weiAmount: string, priceInUsd: number = 2500) => {
  try {
    const wei = BigInt(weiAmount);
    const eth = Number(wei) / 1e18;
    
    return {
      wei: weiAmount,
      eth: eth.toFixed(6),
      ethShort: eth.toFixed(4),
      usd: (eth * priceInUsd).toFixed(2) // Real-time ETH price
    };
  } catch (e) {
    return { wei: '0', eth: '0', ethShort: '0', usd: '0' };
  }
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', name: 'First Deploy', description: 'Deploy your first contract', icon: Sparkles, milestone: 1, unlocked: false },
  { id: 'five', name: 'Power User', description: 'Deploy 5 contracts', icon: Zap, milestone: 5, unlocked: false },
  { id: 'ten', name: 'Contract Master', description: 'Deploy 10 contracts', icon: Trophy, milestone: 10, unlocked: false },
  { id: 'twenty', name: 'Deployment Legend', description: 'Deploy 20 contracts', icon: Crown, milestone: 20, unlocked: false },
  { id: 'fifty', name: 'Base Builder', description: 'Deploy 50 contracts', icon: Rocket, milestone: 50, unlocked: false },
  { id: 'hundred', name: 'Contract Deity', description: 'Deploy 100 contracts', icon: Gem, milestone: 100, unlocked: false },
  { id: 'twohundred', name: 'Mega Creator', description: 'Deploy 200 contracts', icon: Zap, milestone: 200, unlocked: false },
  { id: 'threehundred', name: 'Unstoppable Force', description: 'Deploy 300 contracts', icon: Rocket, milestone: 300, unlocked: false },
  { id: 'fivehundred', name: 'Blockchain Pioneer', description: 'Deploy 500 contracts', icon: Crown, milestone: 500, unlocked: false },
  { id: 'sevenhundredfifty', name: 'Web3 Visionary', description: 'Deploy 750 contracts', icon: Sparkles, milestone: 750, unlocked: false },
  { id: 'thousand', name: 'Legendary Builder', description: 'Deploy 1000 contracts', icon: Gem, milestone: 1000, unlocked: false },
];

function ContractDeployer() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<keyof typeof CONTRACT_TEMPLATES>('string');
  const [network, setNetwork] = useState<NetworkType>(() => {
    // Load network preference from localStorage, default to mainnet
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(NETWORK_KEY);
      return (stored === 'testnet' ? 'testnet' : 'mainnet') as NetworkType;
    }
    return 'mainnet';
  });
  const [deploying, setDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [successFading, setSuccessFading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'farcaster' | 'external' | null>(null);
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  const [achievementsPage, setAchievementsPage] = useState(1);
  const [sdkReady, setSdkReady] = useState(false);
  const [isAppAdded, setIsAppAdded] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [achievementClosing, setAchievementClosing] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralPoints, setReferralPoints] = useState<number>(0);
  const [verifyingContract, setVerifyingContract] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardSortBy, setLeaderboardSortBy] = useState<'contracts' | 'referrals' | 'clicks' | 'firstDeploy'>('contracts');
  const [leaderboardOrder, setLeaderboardOrder] = useState<'asc' | 'desc'>('desc');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const LEADERBOARD_PAGE_SIZE = 10;
  const [manualReferralCode, setManualReferralCode] = useState<string>('');
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralValidationError, setReferralValidationError] = useState<string | null>(null);
  const [referralValidated, setReferralValidated] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userReferralInfo, setUserReferralInfo] = useState<any>(null);
  const [loadingReferralInfo, setLoadingReferralInfo] = useState(false);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [clickCounterAddress] = useState<string>('0x2ed1C622E90955599837EE828B0b42DC0Dc1Cc60');
  const [clickCount, setClickCount] = useState<number>(0);
  const [clicking, setClicking] = useState(false);
  const [userClicks, setUserClicks] = useState<number>(0);
  const [totalGasSpent, setTotalGasSpent] = useState<string>('0'); // In Wei
  const [walletBalance, setWalletBalance] = useState<string>('0'); // In Wei
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [ethPrice, setEthPrice] = useState<number>(2500); // USD price of ETH
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceLastFetched, setPriceLastFetched] = useState<number>(0);
  const [walletHealthPage, setWalletHealthPage] = useState(1);
  const [showWalletHealth, setShowWalletHealth] = useState(true);
  const [showNetworkSelection, setShowNetworkSelection] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);
  const [contractSortOrder, setContractSortOrder] = useState<'newest' | 'oldest'>('newest'); // Latest first by default
  const [showResume, setShowResume] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);

  // Load deployed contracts from backend and localStorage, migrate if needed
  useEffect(() => {
    const loadContracts = async () => {
      if (typeof window === 'undefined' || !account) {
        // If no account, just load from localStorage (for display before connection)
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setDeployedContracts(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse stored contracts:', e);
          }
        }
        return;
      }

      try {
        // Try to load from backend first
        const response = await fetch(`/api/user-data?wallet=${account}`);
        let backendContracts: DeployedContract[] = [];
        let backendAchievements: Achievement[] = [];
        
        if (response.ok) {
          const data = await response.json();
          backendContracts = data.contracts || [];
          backendAchievements = data.achievements || [];
          
          // Load achievements from backend if available
          if (backendAchievements.length > 0) {
            setAchievements(backendAchievements);
          }
          
          // Load referral points from backend
          if (data.referralPoints !== undefined) {
            setReferralPoints(data.referralPoints);
          }
          
          // Load clicks from backend
          if (data.clicks !== undefined) {
            setUserClicks(data.clicks);
          }
          
          // Check if user has been referred
          if (data.referredBy) {
            setReferredBy(data.referredBy);
            setReferralValidated(true);
          }
        }

        // Load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        let localContracts: DeployedContract[] = [];
        if (stored) {
          try {
            localContracts = JSON.parse(stored);
          } catch (e) {
            console.error('Failed to parse stored contracts:', e);
          }
        }

        // Merge contracts: combine both sources, remove duplicates by address
        const contractMap = new Map<string, DeployedContract>();
        
        // Add backend contracts first (they're the source of truth)
        backendContracts.forEach(contract => {
          if (contract.address) {
            contractMap.set(contract.address.toLowerCase(), contract);
          }
        });
        
        // Add local contracts (in case backend is missing some)
        localContracts.forEach(contract => {
          if (contract.address) {
            contractMap.set(contract.address.toLowerCase(), contract);
          }
        });
        
        const mergedContracts = Array.from(contractMap.values());
        
        // ALWAYS use backend as source of truth if it has data
        // Only merge local if backend is empty (first time user)
        let finalContracts: DeployedContract[] = [];
        if (backendContracts.length > 0) {
          // Backend has data - use it as source of truth, but merge any missing local contracts
          finalContracts = mergedContracts;
        } else if (localContracts.length > 0) {
          // Backend is empty but local has data - use local and migrate
          finalContracts = localContracts;
          console.log('Backend empty, migrating localStorage to backend...');
        } else {
          // Both empty
          finalContracts = [];
        }
        
        setDeployedContracts(finalContracts);
        
        // Fetch historical gas data for contracts that don't have it
        const contractsNeedingGasData = finalContracts.filter(c => !c.gasSpent && c.txHash);
        if (contractsNeedingGasData.length > 0) {
          console.log(`Fetching gas data for ${contractsNeedingGasData.length} historical contracts...`);
          
          const currentNetwork = network === 'mainnet' ? NETWORKS.mainnet : NETWORKS.testnet;
          
          // Fetch gas data for all contracts concurrently
          const gasDataPromises = contractsNeedingGasData.map(async (contract) => {
            try {
              const response = await fetch(currentNetwork.rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_getTransactionReceipt',
                  params: [contract.txHash],
                  id: 1
                })
              });
              
              const data = await response.json();
              if (data.result?.gasUsed && data.result?.effectiveGasPrice) {
                const gasUsedBigInt = BigInt(data.result.gasUsed);
                const gasPriceBigInt = BigInt(data.result.effectiveGasPrice);
                const gasSpent = (gasUsedBigInt * gasPriceBigInt).toString();
                
                return { txHash: contract.txHash, gasSpent };
              }
            } catch (e) {
              console.warn(`Could not fetch gas for ${contract.txHash}:`, e);
            }
            return null;
          });
          
          const gasDataResults = await Promise.all(gasDataPromises);
          const gasDataMap = new Map(gasDataResults.filter(r => r !== null).map(r => [r!.txHash, r!.gasSpent]));
          
          // Update contracts with fetched gas data
          if (gasDataMap.size > 0) {
            const updatedContracts = finalContracts.map(c => {
              if (gasDataMap.has(c.txHash) && !c.gasSpent) {
                return { ...c, gasSpent: gasDataMap.get(c.txHash) };
              }
              return c;
            });
            
            setDeployedContracts(updatedContracts);
            finalContracts = updatedContracts;
            
            // Update localStorage with new gas data
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContracts));
          }
        }
        
        // Calculate total gas spent
        const totalGas = finalContracts.reduce((sum, contract) => {
          if (contract.gasSpent) {
            try {
              return (BigInt(sum) + BigInt(contract.gasSpent)).toString();
            } catch (e) {
              console.warn('Could not parse gas for contract:', contract.gasSpent);
              return sum;
            }
          }
          return sum;
        }, '0');
        setTotalGasSpent(totalGas);
        
        // Load achievements - backend takes priority
        let finalAchievements: Achievement[] = [];
        if (backendAchievements.length > 0) {
          finalAchievements = backendAchievements;
        } else {
          // Load from localStorage if backend doesn't have them
          const achievementsStored = localStorage.getItem(ACHIEVEMENTS_KEY);
          if (achievementsStored) {
            try {
              finalAchievements = JSON.parse(achievementsStored);
            } catch (e) {
              console.error('Failed to parse stored achievements:', e);
              finalAchievements = ACHIEVEMENTS;
            }
          } else {
            finalAchievements = ACHIEVEMENTS;
          }
        }
        setAchievements(finalAchievements);
        
        // Check achievements based on contract count (without popup on load)
        checkAchievements(finalContracts.length, false);
        
        // ALWAYS sync to backend to ensure consistency across devices
        // This ensures both devices have the same data
        try {
          const syncResponse = await fetch('/api/user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: account,
              contracts: finalContracts,
              achievements: finalAchievements,
              fid: farcasterUser?.fid,
              username: farcasterUser?.username,
              displayName: farcasterUser?.displayName,
              pfpUrl: farcasterUser?.pfpUrl
            })
          });
          
          if (syncResponse.ok) {
            console.log('Data synced to backend successfully');
            // After successful sync, reload from backend to get the merged result
            const reloadResponse = await fetch(`/api/user-data?wallet=${account}`);
            if (reloadResponse.ok) {
              const reloadData = await reloadResponse.json();
              // Check if user has been referred
              if (reloadData.referredBy) {
                setReferredBy(reloadData.referredBy);
                setReferralValidated(true);
              }
              // Load referral points from backend
              if (reloadData.referralPoints !== undefined) {
                setReferralPoints(reloadData.referralPoints);
              }
              // Load clicks from backend
              if (reloadData.clicks !== undefined) {
                setUserClicks(reloadData.clicks);
              }
              // Load contracts from backend (always update, even if empty array)
              if (reloadData.contracts !== undefined) {
                setDeployedContracts(reloadData.contracts);
                // Update achievements based on contract count
                if (reloadData.achievements && reloadData.achievements.length > 0) {
                  setAchievements(reloadData.achievements);
                }
                checkAchievements(reloadData.contracts.length, false);
              }
            }
          }
        } catch (err) {
          console.error('Failed to sync data to backend:', err);
        }
        
        // Update localStorage with final data (for offline fallback)
        if (finalContracts.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalContracts));
        }
        if (finalAchievements.length > 0) {
          localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(finalAchievements));
        }
      } catch (error) {
        console.error('Error loading contracts:', error);
        // Fallback to localStorage only
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setDeployedContracts(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse stored contracts:', e);
          }
        }
      }
    };

    loadContracts();
    
    // Load show history preference (device-specific, stays in localStorage)
    if (typeof window !== 'undefined') {
      const showHistoryStored = localStorage.getItem(SHOW_HISTORY_KEY);
      if (showHistoryStored !== null) {
        setShowHistory(showHistoryStored === 'true');
      }
      
      // Load referral code
      const referralStored = localStorage.getItem(REFERRAL_KEY);
      if (referralStored) {
        setReferralCode(referralStored);
      }
      
      // Check for pending referral (will be tracked in separate useEffect)
      const pendingReferral = localStorage.getItem('pending-referral');
      if (pendingReferral && account && farcasterUser) {
        // Will be processed by useEffect below
      }
    }
  }, [account, farcasterUser]);

  // Track referral and give points
  // Validate referral code
  const validateReferralCode = async (code: string) => {
    if (!code || !code.startsWith('ref-')) {
      setReferralValidationError('Invalid referral code format. Must start with "ref-"');
      setReferralValidated(false);
      return false;
    }

    setValidatingReferral(true);
    setReferralValidationError(null);

    try {
      const response = await fetch(`/api/validate-referral?code=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (data.valid) {
        // Store validated referral code in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('pending-referral', JSON.stringify({
            referrerFid: data.fid,
            newUserFid: farcasterUser?.fid ? String(farcasterUser.fid) : null
          }));
        }
        setReferralValidated(true);
        setReferralValidationError(null);
        setManualReferralCode(code);
        return true;
      } else {
        setReferralValidationError(data.error || 'Invalid referral code');
        setReferralValidated(false);
        return false;
      }
    } catch (err) {
      console.error('Failed to validate referral:', err);
      setReferralValidationError('Failed to validate referral code. Please try again.');
      setReferralValidated(false);
      return false;
    } finally {
      setValidatingReferral(false);
    }
  };

  // Handle manual referral code entry
  const handleManualReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReferralCode.trim()) {
      setReferralValidationError('Please enter a referral code');
      return;
    }
    await validateReferralCode(manualReferralCode.trim());
  };

  const trackReferral = async (referrerFid: string, newUserFid: string) => {
    if (!account) return;
    
    try {
      // Call API to track referral
      const response = await fetch('/api/track-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerFid,
          newUserFid,
          walletAddress: account,
          referrerUsername: farcasterUser?.username,
          referrerDisplayName: farcasterUser?.displayName,
          referrerPfpUrl: farcasterUser?.pfpUrl
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Give points to new user
        setReferralPoints(data.newUserPoints || 10);
        setReferredBy(referrerFid);
        const message = data.isBonus 
          ? 'You got 10 referral points! Referrer got 20 bonus points for 5th referral!'
          : 'You got 10 referral points!';
        setError(message);
        setTimeout(() => setError(null), 3000);
        // Clear manual referral code after successful tracking
        setManualReferralCode('');
        setReferralValidated(true);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pending-referral');
        }
      } else {
        setError(data.error || 'Failed to track referral');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Failed to track referral:', err);
      setError('Failed to track referral');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle profile click - fetch and show referral info
  const handleProfileClick = async () => {
    if (!farcasterUser?.fid) return;
    
    setLoadingReferralInfo(true);
    setShowProfileModal(true);
    
    try {
      const response = await fetch(`/api/user-referral-info?fid=${farcasterUser.fid}`);
      if (response.ok) {
        const data = await response.json();
        setUserReferralInfo(data);
      } else {
        // If endpoint doesn't exist, create default data
        setUserReferralInfo({
          referralCode: `ref-${farcasterUser.fid}`,
          referralCount: 0,
          totalPoints: 0,
          referredUsers: []
        });
      }
    } catch (err) {
      console.error('Failed to fetch referral info:', err);
      // Set default data on error
      setUserReferralInfo({
        referralCode: `ref-${farcasterUser.fid}`,
        referralCount: 0,
        totalPoints: 0,
        referredUsers: []
      });
    } finally {
      setLoadingReferralInfo(false);
    }
  };

  // Handle URL ref parameter - validate and store for tracking after first contract deployment
  useEffect(() => {
    if (typeof window === 'undefined' || !farcasterUser) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    
    if (refParam && refParam.startsWith('ref-')) {
      // Pre-fill the manual referral input
      setManualReferralCode(refParam);
      // Validate the referral code automatically
      validateReferralCode(refParam);
    }
  }, [farcasterUser]);

  // Fetch user's personal click count from contract and sync to Firebase
  const fetchClickCount = async () => {
    if (!clickCounterAddress) return;
    
    try {
      const currentNetwork = getCurrentNetwork();
      const chain = network === 'mainnet' ? base : baseSepolia;
      
      const publicClient = createPublicClient({
        chain,
        transport: http(currentNetwork.rpcUrl),
      });
      
      // If user is connected, fetch their personal count
      if (account) {
        const userCount = await publicClient.readContract({
          address: clickCounterAddress as `0x${string}`,
          abi: CLICK_COUNTER_ABI,
          functionName: 'getUserClickCount',
          args: [account as `0x${string}`],
        });
        const onChainClicks = Number(userCount);
        setClickCount(onChainClicks);
        
        // Sync on-chain clicks to Firebase (so leaderboard shows correct count)
        if (onChainClicks > 0 && farcasterUser?.fid) {
          try {
            await fetch('/api/user-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletAddress: account,
                clicks: onChainClicks,
                fid: farcasterUser.fid,
                username: farcasterUser.username,
                displayName: farcasterUser.displayName,
                pfpUrl: farcasterUser.pfpUrl
              })
            });
          } catch (err) {
            console.error('Failed to sync clicks to backend:', err);
          }
        }
      } else {
        // If not connected, set to 0
        setClickCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch click count:', err);
      // On error, set to 0
      setClickCount(0);
    }
  };

  // Fetch click count when address, account, or network changes
  useEffect(() => {
    if (clickCounterAddress) {
      fetchClickCount();
      // Refresh count every 10 seconds
      const interval = setInterval(fetchClickCount, 10000);
      return () => clearInterval(interval);
    }
  }, [clickCounterAddress, account, network]);

  // Fetch wallet balance when account changes
  useEffect(() => {
    if (account) {
      fetchWalletBalance(account);
      // Refresh balance every 30 seconds
      const interval = setInterval(() => fetchWalletBalance(account), 30000);
      return () => clearInterval(interval);
    }
  }, [account, network]);

  // Fetch ETH price on mount and refresh every 5 hours
  useEffect(() => {
    fetchEthPrice();
    // Refresh price every 5 hours (18000000 milliseconds)
    const interval = setInterval(() => fetchEthPrice(), 5 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle click counter button click
  const handleClickCounter = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!clickCounterAddress) {
      setError('Please set the click counter contract address first');
      return;
    }

    try {
      setClicking(true);
      setError(null);

      const currentNetwork = getCurrentNetwork();
      
      // Encode the click() function call
      const data = encodeFunctionData({
        abi: CLICK_COUNTER_ABI,
        functionName: 'click',
      });

      // Get provider using the same method as deployContract
      const provider = getProvider();
      if (!provider) {
        throw new Error('No wallet provider available');
      }

      // Send transaction
      const txParams = {
        from: account,
        to: clickCounterAddress,
        data: data,
        value: '0x0',
      };

      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      // Wait for transaction receipt
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 30;

      while (!receipt && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const currentNetwork = getCurrentNetwork();
          const receiptResponse = await fetch(currentNetwork.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getTransactionReceipt',
              params: [hash],
              id: 1,
            }),
          });
          const receiptData = await receiptResponse.json();
          if (receiptData.result) {
            receipt = receiptData.result;
          }
        } catch (err) {
          console.error('Error fetching receipt:', err);
        }
        attempts++;
      }

      if (receipt) {
        const status = receipt.status;
        const isSuccess = status === '0x1' || status === '0x01' || status === 1 || status === true;
        
        if (isSuccess) {
          // Refresh click count from on-chain
          const currentNetwork = getCurrentNetwork();
          const chain = network === 'mainnet' ? base : baseSepolia;
          const publicClient = createPublicClient({
            chain,
            transport: http(currentNetwork.rpcUrl),
          });
          
          let onChainClicks = 0;
          try {
            const userCount = await publicClient.readContract({
              address: clickCounterAddress as `0x${string}`,
              abi: CLICK_COUNTER_ABI,
              functionName: 'getUserClickCount',
              args: [account as `0x${string}`],
            });
            onChainClicks = Number(userCount);
            setClickCount(onChainClicks);
          } catch (err) {
            console.error('Failed to fetch updated click count:', err);
            onChainClicks = clickCount + 1; // Fallback to increment
          }
          
          // Save on-chain clicks to backend
          if (account && onChainClicks > 0) {
            try {
              await fetch('/api/user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  walletAddress: account,
                  clicks: onChainClicks,
                  fid: farcasterUser?.fid,
                  username: farcasterUser?.username,
                  displayName: farcasterUser?.displayName,
                  pfpUrl: farcasterUser?.pfpUrl
                })
              });
            } catch (err) {
              console.error('Failed to save clicks to backend:', err);
            }
          }
          
          setError('Clicked on-chain!');
          setTimeout(() => setError(null), 1000);
        } else {
          setError('Transaction failed');
          setTimeout(() => setError(null), 1000);
        }
      } else {
        setError('Transaction sent but receipt not found');
        setTimeout(() => setError(null), 1000);
      }
    } catch (err: any) {
      console.error('Failed to click:', err);
      setError(err.message || 'Failed to record click');
      setTimeout(() => setError(null), 1000);
    } finally {
      setClicking(false);
    }
  };


  // Check and unlock achievements (only show popup for newly unlocked)
  const checkAchievements = (count: number, showPopup: boolean = true) => {
    try {
      setAchievements(currentAchievements => {
        const updated = currentAchievements.map(achievement => {
          if (!achievement.unlocked && count >= achievement.milestone) {
            return {
              ...achievement,
              unlocked: true,
              unlockedAt: Date.now()
            };
          }
          return achievement;
        });
        
        // Only show popup if this is a new unlock (not on page load)
        if (showPopup) {
          const newlyUnlocked = updated.find(a => 
            a.unlocked && 
            !currentAchievements.find(oldA => oldA.id === a.id && oldA.unlocked)
          );
          
          if (newlyUnlocked) {
            // Use setTimeout to ensure state is updated
            setTimeout(() => {
              setNewAchievement(newlyUnlocked);
              setAchievementClosing(false);
              // Auto-hide after 2.5 seconds with fade out
              setTimeout(() => {
                setAchievementClosing(true);
                // Remove after fade-out animation completes (300ms)
                setTimeout(() => {
                  setNewAchievement(null);
                  setAchievementClosing(false);
                }, 300);
              }, 2500);
            }, 100);
          }
        }
        
        // Save to localStorage (fallback)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to save achievements to localStorage:', e);
          }
        }
        
        // Save to backend if account is available
        if (account) {
          setTimeout(async () => {
            try {
              const response = await fetch('/api/user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  walletAddress: account,
                  contracts: deployedContracts,
                  achievements: updated,
                  fid: farcasterUser?.fid,
                  username: farcasterUser?.username,
                  displayName: farcasterUser?.displayName,
                  pfpUrl: farcasterUser?.pfpUrl
                })
              });
              
              if (response.ok) {
                console.log('Achievements saved to backend');
                // Reload from backend to ensure consistency
                const reloadResponse = await fetch(`/api/user-data?wallet=${account}`);
                if (reloadResponse.ok) {
                  const reloadData = await reloadResponse.json();
                  if (reloadData.achievements) {
                    setAchievements(reloadData.achievements);
                  }
                }
              }
            } catch (err) {
              console.error('Failed to save achievements to backend:', err);
            }
          }, 200);
        }
        
        return updated;
      });
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  // Toggle show history and save to localStorage
  const toggleShowHistory = () => {
    const newValue = !showHistory;
    setShowHistory(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SHOW_HISTORY_KEY, String(newValue));
    }
  };

  // Save deployed contracts to localStorage and backend
  // deployerAddress: The actual address from the transaction (account abstraction address)
  //                  If not provided, falls back to the connected account
  const saveContract = async (contract: DeployedContract, deployerAddress?: string | null) => {
    const updated = [contract, ...deployedContracts];
    setDeployedContracts(updated);
    
    // Save to localStorage immediately (for instant UI update)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    
    // Check for new achievements (this will update achievements state)
    checkAchievements(updated.length);
    
    // Use the deployer address from transaction (account abstraction) or fallback to connected account
    // With Farcaster's account abstraction, the transaction's 'from' address is the user's account abstraction address
    // which is tied to their FID, ensuring proper tracking in the leaderboard
    const walletAddressToUse = deployerAddress || account;
    
    // Save to backend immediately (wait for it to complete)
    if (walletAddressToUse) {
      try {
        // Get current achievements state - we need to wait a bit for checkAchievements to update
        // So we'll fetch achievements from state after a short delay
        setTimeout(async () => {
          try {
            // Get the latest achievements from state
            const currentAchievements = achievements;
            
            // Save to backend using the actual deployer address (account abstraction address)
            const response = await fetch('/api/user-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  walletAddress: walletAddressToUse,
                  contracts: updated,
                  achievements: currentAchievements,
                  fid: farcasterUser?.fid,
                  username: farcasterUser?.username,
                  displayName: farcasterUser?.displayName,
                  pfpUrl: farcasterUser?.pfpUrl
                })
            });
            
            if (response.ok) {
              console.log('Contract saved to backend with deployer address:', walletAddressToUse);
              // Reload from backend to ensure we have the merged data
              const reloadResponse = await fetch(`/api/user-data?wallet=${walletAddressToUse}`);
              if (reloadResponse.ok) {
                const reloadData = await reloadResponse.json();
                if (reloadData.contracts) {
                  setDeployedContracts(reloadData.contracts);
                }
                if (reloadData.achievements) {
                  setAchievements(reloadData.achievements);
                }
                // Reload referral points after saving contract
                if (reloadData.referralPoints !== undefined) {
                  setReferralPoints(reloadData.referralPoints);
                }
              }
            }
          } catch (err) {
            console.error('Failed to save contract to backend:', err);
            // Don't fail the operation - localStorage is the fallback
          }
        }, 500);
      } catch (err) {
        console.error('Error in saveContract:', err);
      }
    }
  };

  // Contract source code mapping for verification
  const CONTRACT_SOURCE_CODE: Record<string, string> = {
    counter: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Counter {
    uint256 public count;
    
    function increment() public {
        count++;
    }
}`,
    string: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StringStorage {
    string public value;
    
    constructor(string memory _value) {
        value = _value;
    }
}`,
    calculator: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Calculator {
    uint256 public result;
    
    constructor(uint256 _initial) {
        result = _initial;
    }
    
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }
    
    function subtract(uint256 a, uint256 b) public pure returns (uint256) {
        return a - b;
    }
    
    function multiply(uint256 a, uint256 b) public pure returns (uint256) {
        return a * b;
    }
}`,
    greeter: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Greeter {
    string public greeting;
    
    constructor(string memory _greeting) {
        greeting = _greeting;
    }
    
    function greet() public view returns (string memory) {
        return greeting;
    }
}`,
    messageboard: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MessageBoard {
    string public message;
    address public author;
    
    constructor(string memory _message) {
        message = _message;
        author = msg.sender;
    }
}`,
    numberstore: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NumberStore {
    uint256 public number;
    
    constructor(uint256 _number) {
        number = _number;
    }
}`
  };

  // Verify contract on BaseScan (automatic with API key, fallback to manual)
  const verifyContractOnBaseScan = async (contractAddress: string, contractType: string, constructorArgs?: string) => {
    setVerifyingContract(contractAddress);
    try {
      const response = await fetch('/api/verify-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress,
          contractType,
          sourceCode: CONTRACT_SOURCE_CODE[contractType],
          constructorArgs
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setError('Contract verification submitted! Check BaseScan in a few minutes.');
        setTimeout(() => setError(null), 5000);
      } else {
        // If automatic verification fails, show manual option
        openManualVerification(contractAddress, contractType, constructorArgs);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      // If automatic verification fails, show manual option
      openManualVerification(contractAddress, contractType, constructorArgs);
    } finally {
      setVerifyingContract(null);
    }
  };

  // Open manual verification page on BaseScan
  const openManualVerification = (contractAddress: string, contractType: string, constructorArgs?: string) => {
    const sourceCode = CONTRACT_SOURCE_CODE[contractType];
    const currentNetwork = getCurrentNetwork();
    
    // Copy source code to clipboard
    navigator.clipboard.writeText(sourceCode).then(() => {
      // Open BaseScan verification page
      window.open(`${currentNetwork.blockExplorer}/address/${contractAddress}#code`, '_blank');
      
      setError('Source code copied! Paste it on BaseScan verification page.');
      setTimeout(() => setError(null), 5000);
    }).catch(() => {
      // If clipboard fails, just open the page
      window.open(`${currentNetwork.blockExplorer}/address/${contractAddress}#code`, '_blank');
      setError('Open BaseScan and paste the contract source code manually.');
      setTimeout(() => setError(null), 5000);
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const response = await fetch(
        `/api/leaderboard?sortBy=${leaderboardSortBy}&order=${leaderboardOrder}&limit=100`
      );
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Toggle leaderboard sort
  const toggleLeaderboardSort = (column: 'contracts' | 'referrals' | 'clicks' | 'firstDeploy') => {
    if (leaderboardSortBy === column) {
      setLeaderboardOrder(leaderboardOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setLeaderboardSortBy(column);
      setLeaderboardOrder('desc');
    }
    setLeaderboardPage(1); // Reset to first page when sorting changes
  };

  // Load leaderboard when opened or when sort changes (independent of wallet connection)
  useEffect(() => {
    if (showLeaderboard) {
      fetchLeaderboard();
    }
  }, [showLeaderboard, leaderboardSortBy, leaderboardOrder]);

  useEffect(() => {
    // Get Farcaster context (ready() is called at page level)
    const initSDK = async () => {
      setSdkReady(true);
      
      // Check for supported chains and capabilities
      try {
        const chains = await sdk.getChains();
        const capabilities = await sdk.getCapabilities();
        
        console.log('Supported chains:', chains);
        console.log('Supported capabilities:', capabilities);
        
        // Check if Base Sepolia (eip155:84532) is supported
        const supportsBaseSepolia = chains.includes('eip155:84532');
        const supportsBaseMainnet = chains.includes('eip155:8453');
        
        console.log('Base Sepolia supported:', supportsBaseSepolia);
        console.log('Base Mainnet supported:', supportsBaseMainnet);
        
        if (!supportsBaseSepolia && !supportsBaseMainnet) {
          console.warn('Neither Base Mainnet nor Base Sepolia are supported by this host');
        } else if (!supportsBaseSepolia) {
          console.warn('Base Sepolia testnet is not supported by this host. Only Base Mainnet is available.');
        }
        
        // Check for wallet capabilities
        const supportsWallet = capabilities.includes('wallet.getEthereumProvider');
        console.log('Wallet provider supported:', supportsWallet);
      } catch (chainError) {
        console.log('Chain detection error (may not be in Farcaster):', chainError);
      }
      
      // Try to get user context from Farcaster
      try {
        const context = await sdk.context;
        console.log('Farcaster context:', context);
        
        if (context?.user) {
          setIsInFarcaster(true);
          const user = {
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl
          };
          setFarcasterUser(user);
          console.log('Farcaster user:', context.user);
          
          // Generate referral code from FID
          const refCode = `ref-${user.fid}`;
          setReferralCode(refCode);
          
          // Save referral code to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(REFERRAL_KEY, refCode);
            
            // Check for referral in URL or from localStorage (set when opening shared link)
            const urlParams = new URLSearchParams(window.location.search);
            let refParam = urlParams.get('ref');
            
            // Also check localStorage for ref from shared Farcaster miniapp link
            if (!refParam && typeof window !== 'undefined') {
              refParam = localStorage.getItem('pending-referral-url');
              if (refParam) {
                localStorage.removeItem('pending-referral-url');
              }
            }
            
            // Store referral for later tracking (when account is available)
            if (refParam && refParam !== refCode) {
              const referrerFid = refParam.replace('ref-', '');
              if (referrerFid && referrerFid !== String(user.fid)) {
                // Store referral to track when account connects
                localStorage.setItem('pending-referral', JSON.stringify({
                  referrerFid,
                  newUserFid: String(user.fid)
                }));
              }
            }
          }
        }
        
        // Check if app is already added
        if (context?.client?.added) {
          setIsAppAdded(true);
        }
      } catch (contextError) {
        console.log('Farcaster context error (normal outside Farcaster):', contextError);
        setIsInFarcaster(false);
      }
    };

    initSDK();
    
    return () => {
      if (typeof window !== 'undefined' && window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const chain = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chain);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  };

  // Cache wrapped providers to avoid re-wrapping
  const providerCache = new WeakMap();
  
  // Get current network configuration
  const getCurrentNetwork = () => NETWORKS[network];

  // Fetch wallet balance
  const fetchWalletBalance = async (walletAddress: string) => {
    if (!walletAddress) return;
    
    setLoadingBalance(true);
    try {
      const currentNetwork = getCurrentNetwork();
      const response = await fetch(currentNetwork.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [walletAddress, 'latest'],
          id: 1
        })
      });
      
      const data = await response.json();
      if (data.result) {
        setWalletBalance(BigInt(data.result).toString());
      }
    } catch (error) {
      console.warn('Error fetching wallet balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Fetch real-time ETH price from cached API
  const fetchEthPrice = async () => {
    try {
      setLoadingPrice(true);
      const response = await fetch('/api/eth-price');
      const data = await response.json();
      
      if (data.price && typeof data.price === 'number') {
        setEthPrice(data.price);
        setPriceLastFetched(Date.now());
      }
    } catch (error) {
      console.warn('Error fetching ETH price:', error);
      // Keep using the current ethPrice on error
    } finally {
      setLoadingPrice(false);
    }
  };

  // Save network preference to localStorage
  const saveNetworkPreference = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
    if (typeof window !== 'undefined') {
      localStorage.setItem(NETWORK_KEY, newNetwork);
    }
  };

  // Switch network
  const switchNetwork = async (newNetwork: NetworkType) => {
    if (network === newNetwork) return;
    
    saveNetworkPreference(newNetwork);
    const targetNetwork = NETWORKS[newNetwork];
    
    if (!account) {
      // If not connected, just update the preference
      return;
    }

    const provider = getProvider();
    if (!provider) return;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });
      setChainId(targetNetwork.chainId);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added, add it
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetNetwork.chainId,
              chainName: targetNetwork.name,
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: [targetNetwork.rpcUrl],
              blockExplorerUrls: [targetNetwork.blockExplorer]
            }]
          });
          setChainId(targetNetwork.chainId);
        } catch (addError) {
          setError(`Failed to add ${targetNetwork.name}`);
          setTimeout(() => setError(null), 3000);
        }
      } else {
        setError(`Failed to switch to ${targetNetwork.name}`);
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const getProvider = () => {
    let provider: any;
    if (walletType === 'farcaster' && sdk?.wallet?.ethProvider) {
      provider = sdk.wallet.ethProvider;
    } else {
      provider = window.ethereum;
    }
    
    if (!provider) return null;
    
    // Check if already wrapped
    if (providerCache.has(provider)) {
      return providerCache.get(provider);
    }
    
    // Wrap provider.request to intercept eth_createAccessList
    if (provider.request) {
      const originalRequest = provider.request.bind(provider);
      const wrappedProvider = {
        ...provider,
        request: async (args: any) => {
          // Block ALL eth_createAccessList calls for contract creation
          if (args && args.method === 'eth_createAccessList') {
            const params = args.params && args.params[0];
            // Block if 'to' is missing, null, empty string, or undefined
            if (!params || !params.to || params.to === null || params.to === '' || params.to === undefined) {
              console.log('[Provider Interceptor] Blocked eth_createAccessList for contract creation');
              // Return empty access list immediately
              return Promise.resolve({ jsonrpc: '2.0', id: args.id || 1, result: [] });
            }
          }
          return originalRequest(args);
        }
      };
      
      // Cache the wrapped provider
      providerCache.set(provider, wrappedProvider);
      return wrappedProvider;
    }
    
    return provider;
  };

  const switchToCurrentNetwork = async () => {
    const currentNetwork = getCurrentNetwork();
    const provider = getProvider();
    if (!provider) return false;
    
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: currentNetwork.chainId }],
      });
      setChainId(currentNetwork.chainId);
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          if (!provider) throw new Error('Wallet not available');
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: currentNetwork.chainId,
              chainName: currentNetwork.name,
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: [currentNetwork.rpcUrl],
              blockExplorerUrls: [currentNetwork.blockExplorer]
            }]
          });
          setChainId(currentNetwork.chainId);
          return true;
        } catch (addError) {
          throw new Error(`Failed to add ${currentNetwork.name}`);
        }
      }
      throw switchError;
    }
  };

  const connectFarcasterWallet = async () => {
    try {
      setError(null);
      
      if (!sdk || !sdk.wallet) {
        setError('Farcaster wallet not available');
        return;
      }

      // Connect using Farcaster's ethProvider
      const ethProvider = sdk.wallet.ethProvider;
      
      if (!ethProvider) {
        setError('Farcaster wallet provider not available');
        return;
      }

      const accounts = await ethProvider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setWalletType('farcaster');
        
        const chain = await ethProvider.request({ method: 'eth_chainId' });
        setChainId(chain);
        
        const currentNetwork = getCurrentNetwork();
        if (chain !== currentNetwork.chainId) {
          try {
            await ethProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: currentNetwork.chainId }],
            });
            setChainId(currentNetwork.chainId);
          } catch (switchErr: any) {
            if (switchErr.code === 4902) {
              await ethProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: currentNetwork.chainId,
                  chainName: currentNetwork.name,
                  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
                  rpcUrls: [currentNetwork.rpcUrl],
                  blockExplorerUrls: [currentNetwork.blockExplorer]
                }]
              });
              setChainId(currentNetwork.chainId);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Farcaster wallet error:', err);
      setError(err.message || 'Failed to connect Farcaster wallet');
    }
  };

  const connectExternalWallet = async () => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask or a Web3 wallet');
      return;
    }

    try {
      setError(null);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setWalletType('external');
      
      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chain);
      
      // Set up listeners for external wallet
      if (window.ethereum.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
      
      const currentNetwork = getCurrentNetwork();
      if (chain !== currentNetwork.chainId) {
        await switchToCurrentNetwork();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setWalletType(null);
    setError(null);
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  // Use public RPC to fetch receipt - more reliable than wallet provider
  const fetchReceiptFromRPC = async (txHash: string): Promise<any> => {
    const currentNetwork = getCurrentNetwork();
    const response = await fetch(currentNetwork.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1
      })
    });
    const data = await response.json();
    return data.result;
  };

  const encodeConstructorParams = (template: typeof CONTRACT_TEMPLATES[keyof typeof CONTRACT_TEMPLATES], value: string): string => {
    if (!template.hasInput || !value) return '';
    
    const inputType = 'inputType' in template ? template.inputType : undefined;
    if (inputType === 'string') {
      const utf8Bytes = new TextEncoder().encode(value);
      const hex = Array.from(utf8Bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const length = utf8Bytes.length.toString(16).padStart(64, '0');
      const paddedHex = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
      return '0000000000000000000000000000000000000000000000000000000000000020' + length + paddedHex;
    } else if (inputType === 'number') {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) throw new Error('Invalid number');
      return num.toString(16).padStart(64, '0');
    }
    return '';
  };

  const deployContract = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    const provider = getProvider();
    if (!provider) {
      setError('No wallet provider available');
      return;
    }

    const currentNetwork = getCurrentNetwork();
    if (chainId !== currentNetwork.chainId) {
      try {
        await switchToCurrentNetwork();
      } catch (err) {
        setError(`Please switch to ${currentNetwork.name}`);
        return;
      }
    }

    // Factory contract is deployed on both Base Mainnet and Base Sepolia
    const template = CONTRACT_TEMPLATES[selectedContract];
    
    if (template.hasInput && !inputValue.trim()) {
      const inputType = 'inputType' in template ? template.inputType : 'value';
      setError(`Please enter a ${inputType === 'string' ? 'string value' : 'number'}`);
      return;
    }

    setDeploying(true);
    setError(null);
    setDeployedAddress(null);
    setTxHash(null);

    try {
      let bytecode = template.bytecode;
      if (!bytecode.startsWith('0x')) {
        bytecode = '0x' + bytecode;
      }
      
      let deploymentBytecode = bytecode;
      
      // Add constructor parameters if needed
      if (template.hasInput && inputValue.trim()) {
        try {
          const encodedParams = encodeConstructorParams(template, inputValue);
          const bytecodeWithoutPrefix = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
          deploymentBytecode = '0x' + bytecodeWithoutPrefix + encodedParams;
        } catch (encodeError: any) {
          setError(`Failed to encode parameters: ${encodeError.message}`);
          setDeploying(false);
          return;
        }
      }

      // Encode the factory contract call
      const callData = encodeFunctionData({
        abi: FACTORY_ABI,
        functionName: 'deployContractWithParams',
        args: [deploymentBytecode as `0x${string}`]
      });

      // Estimate gas for factory call
      const factoryAddress = currentNetwork.factoryAddress;
      let gasEstimate: string;
      try {
        const estimatedGas = await provider.request({
          method: 'eth_estimateGas',
          params: [{
            from: account as `0x${string}`,
            to: factoryAddress as `0x${string}`,
            data: callData
          }]
        });
        const gasWithBuffer = Math.floor(parseInt(estimatedGas, 16) * 1.2);
        gasEstimate = '0x' + gasWithBuffer.toString(16);
      } catch (err) {
        gasEstimate = '0x200000';
      }
      
      const isCoinbaseWallet = walletType === 'external' && window.ethereum && 
                               (window.ethereum.isCoinbaseWallet || (window.ethereum as any).isCoinbaseWallet);
      
      // Send transaction to factory contract (regular transaction, not contract creation)
      const txParams: any = {
        from: account as `0x${string}`,
        to: factoryAddress as `0x${string}`,
        data: callData,
        gas: gasEstimate,
        value: '0x0'
      };
      
      if (isCoinbaseWallet) {
        txParams.type = '0x2';
      }
      
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      setTxHash(hash);

      // Poll for receipt using public RPC (more reliable than wallet provider)
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 90; // 3 minutes max
      
      while (!receipt && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          // Use public RPC endpoint instead of wallet provider for reliable receipt fetching
          receipt = await fetchReceiptFromRPC(hash);
          if (receipt) {
            console.log('Receipt found:', receipt);
          }
        } catch (err) {
          console.error('Error fetching receipt:', err);
        }
        attempts++;
      }

      if (receipt) {
        const status = receipt.status;
        
        // Check for successful status (handle both hex string and number formats)
        const isSuccess = status === '0x1' || status === '0x01' || status === 1 || status === true;
        const isFailed = status === '0x0' || status === '0x00' || status === 0 || status === false;
        
        if (isSuccess) {
          // Extract deployed contract address from ContractDeployed event logs
          let contractAddress: string | null = null;
          
          try {
            // Decode ContractDeployed event from logs
            for (const log of receipt.logs || []) {
              try {
                const decoded = decodeEventLog({
                  abi: FACTORY_ABI,
                  data: log.data,
                  topics: log.topics
                });
                
                if (decoded.eventName === 'ContractDeployed') {
                  contractAddress = (decoded.args as any).deployedAddress;
                  break;
                }
              } catch (e) {
                // Not our event, continue
              }
            }
          } catch (err) {
            console.error('Error decoding event logs:', err);
          }
          
          if (contractAddress && contractAddress !== '0x' && contractAddress !== '0x0000000000000000000000000000000000000000') {
            setDeployedAddress(contractAddress);
            setSuccessFading(false);
            
            // Trigger fade-out after 1.5 seconds, then clear after animation completes
            setTimeout(() => {
              setSuccessFading(true);
            }, 1500);
            
            setTimeout(() => {
              setDeployedAddress(null);
              setTxHash(null);
              setSuccessFading(false);
            }, 2000);
            
            // Extract the actual deployer address from the transaction
            // With Farcaster's account abstraction, this will be the user's account abstraction address
            // which is tied to their FID, not the connected wallet address
            // Transaction receipts don't have 'from', so we need to fetch the transaction
            let actualDeployerAddress = account?.toLowerCase();
            try {
              const currentNetwork = getCurrentNetwork();
              const txResponse = await fetch(currentNetwork.rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_getTransactionByHash',
                  params: [hash],
                  id: 1
                })
              });
              const txData = await txResponse.json();
              if (txData.result?.from) {
                actualDeployerAddress = txData.result.from.toLowerCase();
              }
            } catch (txErr) {
              console.warn('Could not fetch transaction to get deployer address, using account:', txErr);
            }
            
            // Save to history (localStorage + backend)
            // Use the actual deployer address from the transaction (account abstraction address)
            
            // Calculate gas spent (gasUsed * gasPrice)
            let gasSpent = '0';
            if (receipt?.gasUsed && receipt?.effectiveGasPrice) {
              try {
                const gasUsedBigInt = BigInt(receipt.gasUsed);
                const gasPriceBigInt = BigInt(receipt.effectiveGasPrice);
                gasSpent = (gasUsedBigInt * gasPriceBigInt).toString();
                
                // Update total gas spent
                setTotalGasSpent(prevGas => {
                  const prev = BigInt(prevGas);
                  const current = prev + gasUsedBigInt * gasPriceBigInt;
                  return current.toString();
                });
              } catch (e) {
                console.warn('Could not calculate gas spent:', e);
              }
            }
            
            await saveContract({
              address: contractAddress,
              contractType: selectedContract,
              contractName: template.name,
              txHash: hash,
              timestamp: Date.now(),
              inputValue: inputValue || undefined,
              gasSpent: gasSpent
            }, actualDeployerAddress || undefined);
            
            setInputValue('');

            // Track referral if this is the first contract deployment and there's a pending referral
            // Only track if user hasn't already been referred
            if (deployedContracts.length === 0 && farcasterUser && !referredBy) {
              const pendingReferral = typeof window !== 'undefined' ? localStorage.getItem('pending-referral') : null;
              if (pendingReferral) {
                try {
                  const referral = JSON.parse(pendingReferral);
                  if (referral.referrerFid && referral.newUserFid === String(farcasterUser.fid)) {
                    // Wait a bit for the contract to be saved to backend
                    setTimeout(() => {
                      trackReferral(referral.referrerFid, referral.newUserFid);
                    }, 2000);
                  }
                } catch (e) {
                  console.error('Failed to parse pending referral:', e);
                }
              }
            }
          } else {
            // Transaction succeeded but no contract address - likely account abstraction
            // Try to get more info from the transaction
            try {
              const currentNetwork = getCurrentNetwork();
              const txResponse = await fetch(currentNetwork.rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_getTransactionByHash',
                  params: [hash],
                  id: 1
                })
              });
              const txData = await txResponse.json();
              const tx = txData.result;
              
              if (tx && tx.to === null) {
                setError(`Transaction succeeded but contract address not in receipt. Check ${currentNetwork.name}: ${currentNetwork.blockExplorer}/tx/${hash}`);
              } else {
                const bundlerAddress = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';
                if (tx?.to?.toLowerCase() === bundlerAddress.toLowerCase()) {
                  setError(
                    `Account Abstraction Detected: Transaction routed to bundler. ` +
                    `Disable account abstraction in wallet settings or use MetaMask. ` +
                    `Check ${currentNetwork.name}: ${currentNetwork.blockExplorer}/tx/${hash}`
                  );
                } else {
                  setError(`Transaction sent to ${tx?.to}, not contract creation. Check ${currentNetwork.name}: ${currentNetwork.blockExplorer}/tx/${hash}`);
                }
              }
            } catch (txErr) {
              const currentNetwork = getCurrentNetwork();
              setError(`Contract address not found. Check ${currentNetwork.name}: ${currentNetwork.blockExplorer}/tx/${hash}`);
            }
          }
        } else if (isFailed) {
          const currentNetwork = getCurrentNetwork();
          setError(`Transaction failed. Check ${currentNetwork.name}: ${currentNetwork.blockExplorer}/tx/${hash}`);
          setTimeout(() => setError(null), 1000);
        } else {
          const currentNetwork = getCurrentNetwork();
          setError(`Unknown status. Check ${currentNetwork.name}: ${currentNetwork.blockExplorer}/tx/${hash}`);
          setTimeout(() => setError(null), 1000);
        }
      } else {
        const currentNetwork = getCurrentNetwork();
        setError(`Transaction pending. Check ${currentNetwork.name}: ${currentNetwork.blockExplorer}/tx/${hash}`);
        setTimeout(() => setError(null), 1000);
      }
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        setError('Transaction cancelled');
      } else {
        setError(err.message || 'Deployment failed');
      }
      setTimeout(() => setError(null), 1000);
    } finally {
      setDeploying(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get resume metrics
  const getResumeMetrics = () => {
    const uniqueDays = new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size;
    const contractTypes = new Set(deployedContracts.map(c => c.contractType)).size;
    const totalGas = deployedContracts.reduce((sum, c) => BigInt(sum) + BigInt(c.gasSpent || '0'), BigInt(0));
    const gasInEth = Number(totalGas) / 1e18;
    const gasInUsd = gasInEth * ethPrice;

    return {
      contractCount: deployedContracts.length,
      uniqueDays,
      contractTypes,
      totalTransactions: deployedContracts.length + clickCount,
      gasSpentEth: gasInEth.toFixed(4),
      gasSpentUsd: gasInUsd.toFixed(2),
      totalClicks: clickCount,
      rewardStrength: getRewardStrength()
    };
  };

  const getRewardStrength = () => {
    const uniqueDays = new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size;
    const contractTypes = new Set(deployedContracts.map(c => c.contractType)).size;

    if (deployedContracts.length >= 30 && clickCount >= 50 && uniqueDays >= 10 && contractTypes >= 4) {
      return { level: 'HIGH', color: 'bg-green-100 text-green-700' };
    } else if (deployedContracts.length >= 15 && clickCount >= 25 && uniqueDays >= 7) {
      return { level: 'MEDIUM-HIGH', color: 'bg-lime-100 text-lime-700' };
    } else if (deployedContracts.length >= 5 || clickCount >= 10 || uniqueDays >= 3) {
      return { level: 'MEDIUM', color: 'bg-yellow-100 text-yellow-700' };
    }
    return { level: 'LOW', color: 'bg-red-100 text-red-700' };
  };

  // Download resume as image
  const downloadResumeAsImage = () => {
    if (!account) return;
    
    setGeneratingResume(true);
    
    // Small delay to ensure rendering
    setTimeout(async () => {
      try {
        const element = document.getElementById('resume-card');
        if (!element) {
          console.error('Resume card element not found');
          setGeneratingResume(false);
          return;
        }

        console.log('Starting html2canvas conversion...');
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          allowTaint: true,
          useCORS: true,
          removeContainer: true,
          windowHeight: element.scrollHeight,
          windowWidth: element.scrollWidth
        });

        console.log('Canvas created, opening in new tab...');
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Failed to create blob from canvas');
            setGeneratingResume(false);
            return;
          }

          // Create blob URL and open in new tab
          const blobUrl = URL.createObjectURL(blob);
          
          // Try to download first (works on non-frame environments)
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `base-deployer-resume-${account.slice(-6)}.png`;
          
          try {
            link.click();
          } catch (e) {
            // If download fails (in frames), open in new tab instead
            console.log('Download blocked, opening in new tab...');
            window.open(blobUrl, '_blank');
          }
          
          // Cleanup after a delay
          setTimeout(() => {
            setGeneratingResume(false);
            console.log('Image generation complete');
          }, 500);
        }, 'image/png');
      } catch (err) {
        console.error('Error generating resume image:', err);
        setGeneratingResume(false);
      }
    }, 100);
  };

  // Share resume on Twitter with IPFS image
  const shareOnTwitter = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setGeneratingResume(true);
      console.log('Starting Twitter share...');
      
      const metrics = getResumeMetrics();
      const resumeData = {
        ...metrics,
        address: account,
        displayName: farcasterUser?.displayName,
        username: farcasterUser?.username,
        pfpUrl: farcasterUser?.pfpUrl,
      };
      
      // Store resume data in both localStorage and sessionStorage
      const dataStr = JSON.stringify(resumeData);
      localStorage.setItem(`resume-data-${account}`, dataStr);
      sessionStorage.setItem(`resume-data-${account}`, dataStr);
      console.log('Resume data stored:', resumeData);

      // Capture resume image and upload to IPFS
      const resumeElement = document.getElementById('resume-capture');
      if (!resumeElement) {
        throw new Error('Resume card element not found on page');
      }
      
      // Add unique hidden element to make each capture unique for IPFS
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const uniqueMarker = document.createElement('div');
      uniqueMarker.id = 'unique-marker-temp';
      uniqueMarker.textContent = uniqueId;
      uniqueMarker.style.cssText = 'position:absolute;bottom:5px;right:5px;font-size:10px;color:#999999;font-family:monospace;pointer-events:none;z-index:9999;';
      resumeElement.appendChild(uniqueMarker);
      console.log('[TWITTER-SHARE] Added unique marker to HTML:', uniqueId);
      
      // CRITICAL: Wait for DOM to fully render the marker
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('[TWITTER-SHARE] DOM updated, marker should be visible');

      console.log('[TWITTER-SHARE] Element found:', { w: resumeElement.offsetWidth, h: resumeElement.offsetHeight });
      console.log('[TWITTER-SHARE] Starting html2canvas...');
      if (typeof window !== 'undefined') {
        let canvas;
        try {
          canvas = await html2canvas(resumeElement, {
            backgroundColor: '#fafaf8',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: true,
            width: 1080,
            height: 1350,
          });
          console.log('[TWITTER-SHARE] Canvas created:', { w: canvas.width, h: canvas.height });
        } catch (e) {
          console.error('[TWITTER-SHARE] html2canvas failed:', e);
          // Clean up marker on error
          if (uniqueMarker && uniqueMarker.parentNode) {
            uniqueMarker.remove();
          }
          throw new Error(`html2canvas failed: ${e instanceof Error ? e.message : String(e)}`);
        }
        
        let imageDataUrl = '';
        let imageChecksum = '';
        try {
          imageDataUrl = canvas.toDataURL('image/png');
          // Generate checksum to verify image data changes
          const imageBuffer = await fetch(imageDataUrl).then(r => r.blob()).then(b => b.arrayBuffer());
          const hashBuffer = await crypto.subtle.digest('SHA-256', imageBuffer);
          imageChecksum = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
          console.log('[TWITTER-SHARE] Data URL created, size:', (imageDataUrl.length / 1024).toFixed(2), 'KB');
          console.log('[TWITTER-SHARE] Image checksum:', imageChecksum);
          
          // NOW remove marker after we have the data URL
          if (uniqueMarker && uniqueMarker.parentNode) {
            uniqueMarker.remove();
            console.log('[TWITTER-SHARE] Removed unique marker from HTML');
          }
        } catch (e) {
          // Clean up marker on error
          if (uniqueMarker && uniqueMarker.parentNode) {
            uniqueMarker.remove();
          }
          console.error('[TWITTER-SHARE] toDataURL/checksum failed:', e);
          throw new Error(`toDataURL failed: ${e instanceof Error ? e.message : String(e)}`);
        }
        
        console.log('[TWITTER-SHARE] Uploading to IPFS...');
        
        // Upload to IPFS with cache-busting headers
        const uploadResponse = await fetch('/api/ipfs-upload', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Request-ID': `${Date.now()}-${Math.random()}`,
          },
          body: JSON.stringify({ imageDataUrl, timestamp: Date.now(), checksum: imageChecksum }),
        });
        
        console.log('[TWITTER-SHARE] Upload response status:', uploadResponse.status);
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error('[TWITTER-SHARE] Upload error:', errorData);
          throw new Error(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
        }
        
        const uploadData = (await uploadResponse.json()) as { ipfsUrl: string; hash?: string };
        const { ipfsUrl } = uploadData;
        console.log('Image uploaded to IPFS:', ipfsUrl);
        console.log('[TWITTER-SHARE] IPFS hash:', uploadData.hash);
        console.log('[TWITTER-SHARE] Local checksum:', imageChecksum);
        
        if (!ipfsUrl || ipfsUrl.trim().length === 0) {
          throw new Error('Invalid IPFS URL received from server');
        }
        
        const displayNameEncoded = encodeURIComponent(farcasterUser?.displayName || 'Developer');
        const resumeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/resume?address=${account}&contracts=${metrics.contractCount}&transactions=${metrics.totalTransactions}&gas=${metrics.gasSpentEth}&days=${metrics.uniqueDays}&strength=${metrics.rewardStrength?.level || 'MEDIUM'}&displayName=${displayNameEncoded}&image=${encodeURIComponent(ipfsUrl)}&preventDownload=true`;
        
        const text = `Check out my Base On-Chain Resume\n\n${metrics.contractCount} Contracts Deployed\n${metrics.totalTransactions} Total Transactions\n${metrics.gasSpentEth} ETH Gas Spent\n${metrics.uniqueDays} Days Active\n\nBuilding on-chain credibility!\n\n#Base #Web3`;
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(resumeUrl)}`;
        console.log('Opening Twitter with URL:', twitterUrl);
        window.open(twitterUrl, '_blank', 'width=550,height=420');
        setError('Resume shared on X successfully!');
        setTimeout(() => setError(null), 2000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error sharing on Twitter:', err);
      setError(`Failed to share on X: ${errorMsg}`);
    } finally {
      setGeneratingResume(false);
    }
  };

  // Share resume on Farcaster with IPFS image
  const shareOnFarcaster = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setGeneratingResume(true);
      console.log('Starting Farcaster share...');
      
      const metrics = getResumeMetrics();
      const resumeData = {
        ...metrics,
        address: account,
        displayName: farcasterUser?.displayName,
        username: farcasterUser?.username,
        pfpUrl: farcasterUser?.pfpUrl,
      };
      
      // Store resume data in both localStorage and sessionStorage
      const dataStr = JSON.stringify(resumeData);
      localStorage.setItem(`resume-data-${account}`, dataStr);
      sessionStorage.setItem(`resume-data-${account}`, dataStr);
      console.log('Resume data stored:', resumeData);

      // Capture resume image and upload to IPFS
      const resumeElement = document.getElementById('resume-capture') as HTMLElement | null;
      if (!resumeElement) {
        throw new Error('Resume card element not found on page');
      }

      // Store original styles
      const originalStyles = {
        visibility: resumeElement.style.visibility,
        position: resumeElement.style.position,
        left: resumeElement.style.left,
        top: resumeElement.style.top,
        zIndex: resumeElement.style.zIndex,
      };
      
      // Make element visible for capture (fixes hidden element issues)
      resumeElement.style.visibility = 'visible';
      resumeElement.style.position = 'fixed';
      resumeElement.style.left = '0';
      resumeElement.style.top = '0';
      resumeElement.style.zIndex = '99999';
      
      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 150));

      console.log('[FARCASTER-SHARE] Element visible for capture:', { w: resumeElement.offsetWidth, h: resumeElement.offsetHeight });
      console.log('[FARCASTER-SHARE] Starting html2canvas...');
      
      let canvas: HTMLCanvasElement;
      try {
        canvas = await html2canvas(resumeElement, {
          backgroundColor: '#fafaf8',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          // Let html2canvas capture the actual element size
          // No fixed width/height - captures content as-is
        });
      } finally {
        // Restore original styles immediately after capture
        resumeElement.style.visibility = originalStyles.visibility;
        resumeElement.style.position = originalStyles.position;
        resumeElement.style.left = originalStyles.left;
        resumeElement.style.top = originalStyles.top;
        resumeElement.style.zIndex = originalStyles.zIndex;
      }
      
      console.log('[FARCASTER-SHARE] Canvas created:', { w: canvas.width, h: canvas.height });
      
      // Get canvas context - MUST succeed
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas 2D context');
      }
      
      // Generate unique identifier
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const seed = Date.now();
      
      // METHOD 1: Draw a visible rectangle with unique color
      const uniqueColor = seed % 200 + 50; // 50-250 range for visibility
      ctx.fillStyle = `rgb(${uniqueColor}, ${uniqueColor}, ${uniqueColor})`;
      ctx.fillRect(canvas.width - 200, canvas.height - 60, 190, 50);
      
      // METHOD 2: Draw visible text on the rectangle
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'right';
      ctx.fillText(uniqueId, canvas.width - 15, canvas.height - 30);
      
      // METHOD 3: Directly modify pixel data using getImageData/putImageData
      // This is the GUARANTEED way to change canvas content
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Modify 1000 random pixels across the image
      for (let i = 0; i < 1000; i++) {
        const randomPixel = Math.floor(Math.random() * (pixels.length / 4)) * 4;
        pixels[randomPixel] = (pixels[randomPixel] + seed + i) % 256;     // R
        pixels[randomPixel + 1] = (pixels[randomPixel + 1] + seed) % 256; // G
        pixels[randomPixel + 2] = (pixels[randomPixel + 2] + i) % 256;    // B
        // Alpha channel (pixels[randomPixel + 3]) left unchanged
      }
      
      // Put the modified pixel data back
      ctx.putImageData(imageData, 0, 0);
      
      console.log('[FARCASTER-SHARE] Modified canvas with unique ID:', uniqueId);
      
      // VERIFY the modification worked by reading back some pixels
      const verifyData = ctx.getImageData(canvas.width - 50, canvas.height - 50, 10, 10);
      console.log('[FARCASTER-SHARE] Verify pixels (should change each time):', 
        Array.from(verifyData.data.slice(0, 16)).join(','));
      
      // Convert to data URL
      const imageDataUrl = canvas.toDataURL('image/png');
      
      // Generate checksum to verify image uniqueness
      const imageBuffer = await fetch(imageDataUrl).then(r => r.blob()).then(b => b.arrayBuffer());
      const hashBuffer = await crypto.subtle.digest('SHA-256', imageBuffer);
      const imageChecksum = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      console.log('[FARCASTER-SHARE] Data URL created, size:', (imageDataUrl.length / 1024).toFixed(2), 'KB');
      console.log('[FARCASTER-SHARE] Image checksum (SHOULD BE DIFFERENT EACH TIME):', imageChecksum);
      
      console.log('[FARCASTER-SHARE] Uploading to IPFS...');
      
      // Upload to IPFS
      const uploadResponse = await fetch('/api/ipfs-upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-ID': `${Date.now()}-${Math.random()}`,
        },
        body: JSON.stringify({ imageDataUrl, timestamp: Date.now(), checksum: imageChecksum }),
      });
      
      console.log('[FARCASTER-SHARE] Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('[FARCASTER-SHARE] Upload error:', errorData);
        throw new Error(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
      }
      
      const uploadData = (await uploadResponse.json()) as { ipfsUrl: string; hash?: string };
      const { ipfsUrl } = uploadData;
      console.log('Image uploaded to IPFS:', ipfsUrl);
      console.log('[FARCASTER-SHARE] IPFS hash:', uploadData.hash);
      console.log('[FARCASTER-SHARE] Local checksum:', imageChecksum);
      
      if (!ipfsUrl || ipfsUrl.trim().length === 0) {
        throw new Error('Invalid IPFS URL received from server');
      }
      
      // Build the resume URL with imageUrl param
      // The /resume page has fc:miniapp meta tag with imageUrl as the embed image
      const resumeUrl = `${window.location.origin}/resume?imageUrl=${encodeURIComponent(ipfsUrl)}`;
      
      const text = `Check out my Base On-Chain Resume!\n\n📋 ${metrics.contractCount} Contracts Deployed\n💫 ${metrics.totalTransactions} Total Transactions\n⛽ ${metrics.gasSpentEth} ETH Gas Spent\n📅 ${metrics.uniqueDays} Days Active\n\nBuilding on-chain credibility! 🔵`;
      
      console.log('Resume URL with IPFS image:', resumeUrl);
      console.log('IPFS image URL:', ipfsUrl);
      
      // Use Farcaster SDK composeCast if available (proper way for mini apps)
      // Embed the resume URL - Farcaster will fetch fc:miniapp meta tag with IPFS image
      if (sdk?.actions?.composeCast) {
        console.log('Using Farcaster SDK composeCast with resume URL');
        try {
          await sdk.actions.composeCast({
            text: text,
            embeds: [resumeUrl], // Embed resume URL with fc:miniapp meta tag
          });
          setError('Resume shared on Farcaster successfully!');
          setTimeout(() => setError(null), 2000);
        } catch (castError) {
          console.error('composeCast failed:', castError);
          // Fallback to warpcast URL
          const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(resumeUrl)}`;
          window.open(farcasterUrl, '_blank', 'width=550,height=420');
        }
      } else {
        // Fallback to URL-based share for non-Farcaster environments
        console.log('Fallback: Opening Warpcast URL');
        const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(resumeUrl)}`;
        window.open(farcasterUrl, '_blank', 'width=550,height=420');
        setError('Resume shared on Farcaster successfully!');
        setTimeout(() => setError(null), 2000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error sharing on Farcaster:', err);
      setError(`Failed to share on Farcaster: ${errorMsg}`);
    } finally {
      setGeneratingResume(false);
    }
  };

  // Share the app via Farcaster with referral code
  const shareApp = async () => {
    try {
      // Only allow sharing if user has deployed at least one contract
      if (!deployedContracts || deployedContracts.length === 0) {
        setError('Deploy at least one contract to share!');

        setTimeout(() => setError(null), 3000);
        return;
      }

      const contractCount = deployedContracts.length;
      const shareText = contractCount === 1 
        ? `I just deployed my first smart contract on Base! Deploy yours with one tap!`
        : `I've deployed ${contractCount} smart contracts on Base! Deploy yours with one tap!`;
      
      // Use Farcaster miniapp URL (this is the proper way to share miniapps)
      const farcasterMiniappUrl = 'https://farcaster.xyz/miniapps/C8S3fF6GC1Gg/base-contract-deployer';
      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://base-one-tap-contract-deployer.vercel.app';
      
      // Store referrer info for when the app opens (so ref can be tracked)
      if (referralCode && farcasterUser && typeof window !== 'undefined') {
        const referrerInfo = {
          username: farcasterUser.username || '',
          displayName: farcasterUser.displayName || '',
          pfpUrl: farcasterUser.pfpUrl || '',
          fid: farcasterUser.fid
        };
        localStorage.setItem(`referrer-${farcasterUser.fid}`, JSON.stringify(referrerInfo));
        // Also store ref URL for when app opens from Farcaster miniapp link
        localStorage.setItem('pending-referral-url', referralCode);
      }
      
      // Build share URL - use Farcaster miniapp URL (it will open the app properly)
      // The ref will be passed via localStorage and handled when app opens
      const shareUrl = farcasterMiniappUrl;
      
      // Build dynamic OG image URL with referrer info for embed preview
      const ogImageUrl = referralCode && farcasterUser
        ? `${appUrl}/og-image.png?ref=${referralCode}&fid=${farcasterUser.fid}&username=${encodeURIComponent(farcasterUser.username || '')}&displayName=${encodeURIComponent(farcasterUser.displayName || '')}&pfpUrl=${encodeURIComponent(farcasterUser.pfpUrl || '')}`
        : `${appUrl}/og-image.png`;

      if (sdk?.actions?.composeCast) {
        // Share message with ref info
        const shareTextWithRef = referralCode 
          ? `${shareText}\n\nDeploy based like me!!\n\nUse my referral: ${referralCode}`
          : shareText;
        
        await sdk.actions.composeCast({
          text: shareTextWithRef,
          embeds: [shareUrl] // Use miniapp URL so it opens properly in Farcaster
        });
      } else {
        // Fallback for non-Farcaster environments
        if (navigator.share) {
          await navigator.share({
            title: '1-Tap Contract Deployer',
            text: `${shareText}\n\nDeploy based like me!!`,
            url: shareUrl
          });
        } else {
          // Copy link to clipboard
          await navigator.clipboard.writeText(shareUrl);
          setError('Link with referral code copied to clipboard!');
          setTimeout(() => setError(null), 2000);
        }
      }
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  // Add app to user's Farcaster client
  const addApp = async () => {
    try {
      if (sdk?.actions?.addMiniApp) {
        await sdk.actions.addMiniApp();
        setIsAppAdded(true);
      }
    } catch (err) {
      console.log('Add app error:', err);
    }
  };

  const isExternalCoinbaseWallet = typeof window !== 'undefined' && window.ethereum && 
    walletType === 'external' && (window.ethereum.isCoinbaseWallet || (window.ethereum as any).isCoinbaseWallet);

  return (
    <div className="min-h-screen bg-[var(--paper)] pencil-sketch-bg p-4">
      <div className="max-w-xl mx-auto pt-6 pb-12">
        
        {/* Top Bar - User Profile & Actions */}
        <div className="flex items-center justify-between mb-6">
          {/* Left side - Share & Add buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={shareApp}
              className="p-2 border-2 border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--light)] transition-colors"
              title="Share app"
            >
              <Share2 className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            </button>
            {isInFarcaster && !isAppAdded && (
              <button
                onClick={addApp}
                className="p-2 border-2 border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--light)] transition-colors"
                title="Add to your apps"
              >
                <Plus className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Right side - User Profile */}
          {farcasterUser && (
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 px-3 py-2 border-2 border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--light)] transition-colors cursor-pointer"
            >
              {farcasterUser.pfpUrl ? (
                <img 
                  src={farcasterUser.pfpUrl} 
                  alt={farcasterUser.displayName || farcasterUser.username || 'User'}
                  className="w-8 h-8 rounded-full border border-[var(--ink)]"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border border-[var(--ink)] bg-[var(--light)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                </div>
              )}
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--ink)] leading-tight">
                  {farcasterUser.displayName || farcasterUser.username || 'User'}
                </p>
                <p className="text-xs text-[var(--graphite)]">
                  @{farcasterUser.username || `fid:${farcasterUser.fid}`}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 border-2 border-[var(--ink)] rounded-full bg-[var(--ink)]">
            <span className="text-3xl font-black text-[var(--paper)]">B</span>
          </div>
          <h1 className="google-sans-title text-4xl mb-2">
            Base Deployer
          </h1>
          <p className="text-[var(--graphite)] text-lg font-medium tracking-wide">
            Boost Your Wallet Activity
          </p>
        </header>

        {/* Wallet Health Stats */}
        {account && (
          <div className="sketch-card mb-6">
            <button
              onClick={() => setShowWalletHealth(!showWalletHealth)}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
                <h2 className="font-bold text-[var(--ink)] uppercase tracking-wider text-sm">
                  Wallet Health
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--graphite)]">
                  {walletHealthPage} / 4
                </span>
                {showWalletHealth ? (
                  <ChevronUp className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
                )}
              </div>
            </button>
            
            {showWalletHealth && (
              <div className="border-t-2 border-[var(--ink)] p-5">
                {walletHealthPage === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--light)]">
                    <p className="text-xs text-[var(--graphite)] mb-1">Contracts Deployed</p>
                    <p className="text-xl font-bold text-[var(--ink)]">{deployedContracts.length}</p>
                  </div>
                  <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--light)]">
                    <p className="text-xs text-[var(--graphite)] mb-1">Unique Days Active</p>
                    <p className="text-xl font-bold text-[var(--ink)]">
                      {new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size}
                    </p>
                  </div>
                  <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--light)]">
                    <p className="text-xs text-[var(--graphite)] mb-1">Total Transactions</p>
                    <p className="text-xl font-bold text-[var(--ink)]">{deployedContracts.length + clickCount}</p>
                  </div>
                  <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--light)]">
                    <p className="text-xs text-[var(--graphite)] mb-1">Gas Spent</p>
                    <p className="text-lg font-bold text-[var(--ink)]">{formatGasSpent(totalGasSpent, ethPrice).ethShort} ETH</p>
                    <p className="text-xs text-[var(--graphite)]">${formatGasSpent(totalGasSpent, ethPrice).usd}</p>
                  </div>
                  <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--light)]">
                    <p className="text-xs text-[var(--graphite)] mb-1">Activity Score</p>
                    <p className="text-xl font-bold text-[var(--ink)]">
                      {Math.min(1000, deployedContracts.length * 10 + clickCount * 3 + new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size * 15 + new Set(deployedContracts.map(c => c.contractType)).size * 20)}/1000
                    </p>
                  </div>
                  <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--light)]">
                    <p className="text-xs text-[var(--graphite)] mb-1">ETH Price (Live)</p>
                    <p className="text-xl font-bold text-[var(--ink)]">${ethPrice.toFixed(2)}</p>
                    <p className="text-xs text-[var(--graphite)]">{loadingPrice ? 'Updating...' : 'Via CoinMarketCap'}</p>
                  </div>
                </div>
                
                {/* Wallet Balance Widget */}
                <div className="p-3 border-2 border-[var(--ink)] bg-[var(--paper)] mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[var(--ink)]">Wallet Balance</span>
                    {loadingBalance && <span className="text-xs text-[var(--graphite)]">Loading...</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-[var(--light)] border border-[var(--pencil)]">
                      <p className="text-xs text-[var(--graphite)]">ETH</p>
                      <p className="text-lg font-bold text-[var(--ink)]">{formatBalance(walletBalance, ethPrice).ethShort}</p>
                    </div>
                    <div className="p-2 bg-[var(--light)] border border-[var(--pencil)]">
                      <p className="text-xs text-[var(--graphite)]">USD</p>
                      <p className="text-lg font-bold text-[var(--ink)]">${formatBalance(walletBalance, ethPrice).usd}</p>
                    </div>
                  </div>
                </div>
                
                {/* Potential Reward Strength Indicator */}
                <div className="p-3 border-2 border-[var(--ink)] bg-[var(--paper)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--ink)]">Potential Reward Strength</span>
                    <span className={`text-sm font-bold px-2 py-1 ${
                      (deployedContracts.length >= 30 && clickCount >= 50 && new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size >= 10 && new Set(deployedContracts.map(c => c.contractType)).size >= 4)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : (deployedContracts.length >= 15 && clickCount >= 25 && new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size >= 7)
                        ? 'bg-lime-100 text-lime-700 border border-lime-300'
                        : (deployedContracts.length >= 5 || clickCount >= 10 || new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size >= 3)
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                      {(deployedContracts.length >= 30 && clickCount >= 50 && new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size >= 10 && new Set(deployedContracts.map(c => c.contractType)).size >= 4)
                        ? 'HIGH'
                        : (deployedContracts.length >= 15 && clickCount >= 25 && new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size >= 7)
                        ? 'MEDIUM-HIGH'
                        : (deployedContracts.length >= 5 || clickCount >= 10 || new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size >= 3)
                        ? 'MEDIUM'
                        : 'LOW'}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-[var(--light)] border border-[var(--pencil)] overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        (deployedContracts.length >= 30 && clickCount >= 50 && new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size >= 10 && new Set(deployedContracts.map(c => c.contractType)).size >= 4)
                          ? 'bg-green-500'
                          : (deployedContracts.length >= 15 && clickCount >= 25 && new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size >= 7)
                          ? 'bg-lime-500'
                          : (deployedContracts.length >= 5 || clickCount >= 10 || new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size >= 3)
                          ? 'bg-yellow-500'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(100, (deployedContracts.length * 10 + clickCount * 3 + new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size * 15 + new Set(deployedContracts.map(c => c.contractType)).size * 20) / 10)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--graphite)] mt-2">
                    {(deployedContracts.length >= 30 && clickCount >= 50)
                      ? 'Excellent! You have HIGH reward strength. Keep it up!'
                      : (deployedContracts.length >= 15 && clickCount >= 25)
                      ? `Almost there! Need ${Math.max(0, 50 - clickCount)} more clicks for HIGH`
                      : `Need: ${Math.max(0, 15 - deployedContracts.length)} more deploys, ${Math.max(0, 25 - clickCount)} more clicks for MEDIUM-HIGH`}
                  </p>
                </div>
              </>
            ) : walletHealthPage === 2 ? (
              /* Activity Diversity Section - Page 2 */
              <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--light)]">
                <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-3">
                  Activity Diversity
                </h3>
                
                <div className="space-y-3">
                  {/* Contract Deployments */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--graphite)]">Contract Deployments</span>
                      <span className="text-xs font-bold text-[var(--ink)]">{Math.min(100, deployedContracts.length * 5)}%</span>
                    </div>
                    <div className="h-2 bg-[var(--paper)] border border-[var(--pencil)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--ink)] transition-all"
                        style={{ width: `${Math.min(100, deployedContracts.length * 5)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Contract Interactions */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--graphite)]">Contract Interactions</span>
                      <span className="text-xs font-bold text-[var(--ink)]">{Math.min(100, clickCount * 2)}%</span>
                    </div>
                    <div className="h-2 bg-[var(--paper)] border border-[var(--pencil)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--ink)] transition-all"
                        style={{ width: `${Math.min(100, clickCount * 2)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Different Contract Types */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--graphite)]">Different Contract Types</span>
                      <span className="text-xs font-bold text-[var(--ink)]">{Math.min(100, new Set(deployedContracts.map(c => c.contractType)).size * 25)}%</span>
                    </div>
                    <div className="h-2 bg-[var(--paper)] border border-[var(--pencil)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--ink)] transition-all"
                        style={{ width: `${Math.min(100, new Set(deployedContracts.map(c => c.contractType)).size * 25)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Multi-day Activity */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--graphite)]">Multi-day Activity</span>
                      <span className="text-xs font-bold text-[var(--ink)]">{Math.min(100, new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size * 10)}%</span>
                    </div>
                    <div className="h-2 bg-[var(--paper)] border border-[var(--pencil)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--ink)] transition-all"
                        style={{ width: `${Math.min(100, new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size * 10)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Tip */}
                <p className="text-xs text-[var(--graphite)] mt-3 pt-3 border-t border-[var(--pencil)]">
                  <span className="font-bold">Tip:</span> {
                    new Set(deployedContracts.map(c => c.contractType)).size < 4
                      ? 'Deploy different contract types to maximize your wallet diversity score!'
                      : clickCount < 50
                      ? 'Interact with contracts more to boost your activity score!'
                      : new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size < 10
                      ? 'Stay active across multiple days for better scores!'
                      : 'Great diversity! Keep up the varied activity.'
                  }
                </p>
              </div>
            ) : walletHealthPage === 3 ? (
              /* Weekly Activity Planner - Page 3 */
              <div className="p-2 border-2 border-[var(--pencil)] bg-[var(--light)]">
                <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-2">
                  Weekly Activity Planner
                </h3>
                
                <div className="space-y-1">
                  {(() => {
                    const today = new Date();
                    const dayOfWeek = today.getDay();
                    const monday = new Date(today);
                    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const contractTypes = ['string', 'calculator', 'counter', 'clickCounter'];
                    const contractNames = ['String Storage', 'Calculator', 'Counter', 'Click Counter'];
                    
                    const activeDates = new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString()));
                    
                    return days.map((day, index) => {
                      const currentDate = new Date(monday);
                      currentDate.setDate(monday.getDate() + index);
                      const dateStr = currentDate.toDateString();
                      const isToday = dateStr === today.toDateString();
                      const isPast = currentDate < today && !isToday;
                      const isActive = activeDates.has(dateStr);
                      
                      const dayContracts = deployedContracts.filter(c => 
                        new Date(c.timestamp).toDateString() === dateStr
                      );
                      
                      const usedTypes = new Set(deployedContracts.map(c => c.contractType));
                      const suggestedType = contractTypes.find(t => !usedTypes.has(t)) || contractTypes[Math.floor(Math.random() * contractTypes.length)];
                      const suggestedName = contractNames[contractTypes.indexOf(suggestedType)];
                      
                      return (
                        <div key={day} className={`flex items-center justify-between px-2 py-1.5 border ${
                          isToday ? 'border-[var(--ink)] bg-[var(--paper)]' : 'border-[var(--pencil)] bg-[var(--paper)]'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold w-7 ${isToday ? 'text-[var(--ink)]' : 'text-[var(--graphite)]'}`}>
                              {day}
                            </span>
                            <span className="w-4 h-4 flex items-center justify-center">
                              {isActive ? (
                                <span className="w-3 h-3 bg-[var(--ink)] rounded-full"></span>
                              ) : isPast ? (
                                <span className="text-red-400 text-xs font-bold">✕</span>
                              ) : isToday ? (
                                <span className="w-3 h-3 border-2 border-[var(--ink)] rounded-full animate-pulse"></span>
                              ) : (
                                <span className="w-3 h-3 border border-[var(--pencil)] rounded-full opacity-50"></span>
                              )}
                            </span>
                          </div>
                          <span className={`text-xs truncate max-w-[140px] ${isToday && !isActive ? 'font-bold text-[var(--ink)]' : 'text-[var(--graphite)]'}`}>
                            {isActive && dayContracts.length > 0 
                              ? dayContracts[0].contractName
                              : isToday && !isActive 
                              ? `Deploy: ${suggestedName}`
                              : isPast && !isActive
                              ? 'Missed :('
                              : ''}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
                
                {/* Stats */}
                <div className="mt-2 pt-2 border-t border-[var(--pencil)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--graphite)]">Goal: 5+ days/week</span>
                    <span className="text-xs font-bold text-[var(--ink)]">
                      {(() => {
                        const today = new Date();
                        const dayOfWeek = today.getDay();
                        const monday = new Date(today);
                        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                        const sunday = new Date(monday);
                        sunday.setDate(monday.getDate() + 6);
                        
                        const activeDays = deployedContracts.filter(c => {
                          const d = new Date(c.timestamp);
                          return d >= monday && d <= sunday;
                        });
                        const uniqueDays = new Set(activeDays.map(c => new Date(c.timestamp).toDateString())).size;
                        return `${uniqueDays}/5 days`;
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--graphite)]">Current Streak</span>
                    <span className="text-xs font-bold text-[var(--ink)]">
                      {(() => {
                        const sortedDates = Array.from(new Set(deployedContracts.map(c => 
                          new Date(c.timestamp).toDateString()
                        ))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                        
                        if (sortedDates.length === 0) return '0 days';
                        
                        let streak = 0;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        for (let i = 0; i < 365; i++) {
                          const checkDate = new Date(today);
                          checkDate.setDate(today.getDate() - i);
                          if (sortedDates.includes(checkDate.toDateString())) {
                            streak++;
                          } else if (i > 0) {
                            break;
                          }
                        }
                        return `${streak} days`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Activity Heatmap - Page 4 */
              <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--light)]">
                <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-3 text-center">
                  YOUR ON-CHAIN FOOTPRINT
                </h3>
                <p className="text-xs text-[var(--graphite)] text-center mb-4">Last 30 Days</p>
                
                {(() => {
                  const today = new Date();
                  const thirtyDaysAgo = new Date(today);
                  thirtyDaysAgo.setDate(today.getDate() - 30);
                  
                  // Get all activity in last 30 days
                  const recentContracts = deployedContracts.filter(c => new Date(c.timestamp) >= thirtyDaysAgo);
                  
                  // Group by week
                  const weeks = [0, 1, 2, 3].map(weekNum => {
                    const weekStart = new Date(thirtyDaysAgo);
                    weekStart.setDate(thirtyDaysAgo.getDate() + (weekNum * 7));
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 7);
                    
                    const weekContracts = recentContracts.filter(c => {
                      const d = new Date(c.timestamp);
                      return d >= weekStart && d < weekEnd;
                    });
                    
                    return {
                      label: `Week ${weekNum + 1}`,
                      count: weekContracts.length + Math.floor(clickCount / 4), // Approximate clicks per week
                      deploys: weekContracts.length
                    };
                  });
                  
                  const maxActions = Math.max(...weeks.map(w => w.count), 1);
                  
                  // Find best day
                  const dayActivity: Record<string, { deploys: number; date: Date }> = {};
                  recentContracts.forEach(c => {
                    const dateStr = new Date(c.timestamp).toDateString();
                    if (!dayActivity[dateStr]) {
                      dayActivity[dateStr] = { deploys: 0, date: new Date(c.timestamp) };
                    }
                    dayActivity[dateStr].deploys++;
                  });
                  
                  const bestDay = Object.entries(dayActivity).sort((a, b) => b[1].deploys - a[1].deploys)[0];
                  
                  // Calculate longest streak
                  const sortedDates = Array.from(new Set(deployedContracts.map(c => 
                    new Date(c.timestamp).toDateString()
                  ))).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                  
                  let longestStreak = 0;
                  let currentStreak = 1;
                  for (let i = 1; i < sortedDates.length; i++) {
                    const prevDate = new Date(sortedDates[i - 1]);
                    const currDate = new Date(sortedDates[i]);
                    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                      currentStreak++;
                      longestStreak = Math.max(longestStreak, currentStreak);
                    } else {
                      currentStreak = 1;
                    }
                  }
                  longestStreak = Math.max(longestStreak, currentStreak, sortedDates.length > 0 ? 1 : 0);
                  
                  // Activity level
                  const totalActions = recentContracts.length + clickCount;
                  const activityLevel = totalActions >= 50 ? 'POWER USER' : 
                                       totalActions >= 25 ? 'ACTIVE' : 
                                       totalActions >= 10 ? 'WARMING UP' : 'GETTING STARTED';
                  
                  return (
                    <>
                      {/* Weekly heatmap blocks */}
                      <div className="space-y-2 mb-4 font-mono text-xs">
                        {weeks.map((week, i) => {
                          const filled = Math.round((week.count / maxActions) * 12);
                          const bar = '█'.repeat(filled) + '░'.repeat(12 - filled);
                          return (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-[var(--graphite)] w-16">{week.label}:</span>
                              <span className="text-[var(--ink)] tracking-tighter flex-1">{bar}</span>
                              <span className="text-[var(--graphite)] w-20 text-right">{week.count} actions</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Stats */}
                      <div className="space-y-2 pt-3 border-t border-[var(--pencil)]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--graphite)]">Best day:</span>
                          <span className="text-xs font-bold text-[var(--ink)]">
                            {bestDay ? `${bestDay[1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${bestDay[1].deploys} deploys)` : 'No activity yet'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--graphite)]">Longest streak:</span>
                          <span className="text-xs font-bold text-[var(--ink)]">{longestStreak} days</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--pencil)]">
                          <span className="text-xs text-[var(--graphite)]">Activity level:</span>
                          <span className={`text-xs font-bold px-2 py-1 ${
                            activityLevel === 'POWER USER' ? 'bg-green-100 text-green-700 border border-green-300' :
                            activityLevel === 'ACTIVE' ? 'bg-lime-100 text-lime-700 border border-lime-300' :
                            activityLevel === 'WARMING UP' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                            'bg-[var(--light)] text-[var(--graphite)] border border-[var(--pencil)]'
                          }`}>
                            {activityLevel}
                          </span>
                        </div>
                      </div>
                      
                      {/* Share hint */}
                      <p className="text-xs text-[var(--graphite)] text-center mt-3 pt-3 border-t border-[var(--pencil)]">
                        Screenshot and share your on-chain footprint!
                      </p>
                    </>
                  );
                })()}
              </div>
            )}
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--pencil)]">
              <button
                onClick={() => setWalletHealthPage(p => Math.max(1, p - 1))}
                disabled={walletHealthPage === 1}
                className={`px-3 py-1 border-2 border-[var(--ink)] font-bold text-sm transition-colors ${
                  walletHealthPage === 1
                    ? 'bg-[var(--light)] text-[var(--graphite)] cursor-not-allowed'
                    : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--light)]'
                }`}
              >
                ←
              </button>
              <span className="text-xs text-[var(--graphite)]">
                {walletHealthPage === 1 ? 'Overview' : walletHealthPage === 2 ? 'Activity Diversity' : walletHealthPage === 3 ? 'Weekly Planner' : 'Activity Heatmap'}
              </span>
              <button
                onClick={() => setWalletHealthPage(p => Math.min(4, p + 1))}
                disabled={walletHealthPage === 4}
                className={`px-3 py-1 border-2 border-[var(--ink)] font-bold text-sm transition-colors ${
                  walletHealthPage === 4
                    ? 'bg-[var(--light)] text-[var(--graphite)] cursor-not-allowed'
                    : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--light)]'
                }`}
              >
                →
              </button>
            </div>
          </div>
            )}
          </div>
        )}

        {/* Main Card */}
        <div className="sketch-card p-6 mb-6">
          
          {/* Network Selection */}
          <div className="mb-6">
            <button
              onClick={() => setShowNetworkSelection(!showNetworkSelection)}
              className="w-full flex items-center justify-between text-left mb-3"
            >
              <p className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider">
                Network
              </p>
              {showNetworkSelection ? (
                <ChevronUp className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              )}
            </button>
            {showNetworkSelection && (
              <>
                <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => switchNetwork('mainnet')}
                className={`
                  p-4 text-left transition-all border-2
                  ${network === 'mainnet'
                    ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                    : 'border-[var(--pencil)] bg-[var(--paper)] hover:border-[var(--ink)]'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`
                    w-3 h-3 rounded-full border-2 flex-shrink-0
                    ${network === 'mainnet'
                      ? 'border-[var(--paper)] bg-[var(--paper)]'
                      : 'border-[var(--ink)] bg-transparent'
                    }
                  `}>
                    {network === 'mainnet' && (
                      <div className="w-full h-full rounded-full bg-[var(--ink)]" />
                    )}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${network === 'mainnet' ? 'text-[var(--paper)]' : 'text-[var(--ink)]'}`}>
                      Base Mainnet
                    </p>
                    <p className={`text-xs ${network === 'mainnet' ? 'text-[var(--light)]' : 'text-[var(--graphite)]'}`}>
                      Production
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => switchNetwork('testnet')}
                className={`
                  p-4 text-left transition-all border-2
                  ${network === 'testnet'
                    ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                    : 'border-[var(--pencil)] bg-[var(--paper)] hover:border-[var(--ink)]'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`
                    w-3 h-3 rounded-full border-2 flex-shrink-0
                    ${network === 'testnet'
                      ? 'border-[var(--paper)] bg-[var(--paper)]'
                      : 'border-[var(--ink)] bg-transparent'
                    }
                  `}>
                    {network === 'testnet' && (
                      <div className="w-full h-full rounded-full bg-[var(--ink)]" />
                    )}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${network === 'testnet' ? 'text-[var(--paper)]' : 'text-[var(--ink)]'}`}>
                      Base Sepolia
                    </p>
                    <p className={`text-xs ${network === 'testnet' ? 'text-[var(--light)]' : 'text-[var(--graphite)]'}`}>
                      Testnet
                    </p>
                  </div>
                </div>
              </button>
            </div>
            {network === 'mainnet' && (
              <div className="flex items-start gap-3 p-4 mt-3 border-2 border-dashed border-[var(--pencil)] bg-[var(--highlight)]">
                <AlertTriangle className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="font-bold text-[var(--ink)] text-sm tracking-wide uppercase">Mainnet Deployment</p>
                  <p className="text-[var(--graphite)] text-sm mt-1">
                    Deploys to Base mainnet. Real ETH required for gas.
                  </p>
                </div>
              </div>
            )}
            {network === 'testnet' && (
              <div className="flex items-start gap-3 p-4 mt-3 border-2 border-dashed border-[var(--pencil)] bg-[var(--highlight)]">
                <AlertCircle className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="font-bold text-[var(--ink)] text-sm tracking-wide uppercase">Testnet Deployment</p>
                  <p className="text-[var(--graphite)] text-sm mt-1">
                    Deploys to Base Sepolia testnet. Test ETH required for gas.
                  </p>
                </div>
              </div>
            )}
            </>
            )}
          </div>
          {account && isExternalCoinbaseWallet && (
            <div className="flex items-start gap-3 p-4 mb-6 border-2 border-[var(--pencil)] bg-[var(--light)]">
              <AlertCircle className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="font-bold text-[var(--ink)] text-sm tracking-wide uppercase">Coinbase Wallet</p>
                <p className="text-[var(--graphite)] text-sm mt-1">
                  Account abstraction may interfere. Use MetaMask if deployment fails.
                </p>
              </div>
            </div>
          )}

          {/* Wallet Connection */}
          <div className="mb-6">
            {!account ? (
              <div className="space-y-3">
                {/* Primary: Mini App Wallet */}
                <button
                  onClick={connectFarcasterWallet}
                  className="ink-button w-full py-4 px-6 flex items-center justify-center gap-3 text-lg"
                >
                  <Wallet className="w-5 h-5" strokeWidth={2} />
                  Connect Mini App Wallet
                </button>
                
                {/* Secondary: External Wallet */}
                <button
                  onClick={connectExternalWallet}
                  className="ink-button-outline w-full py-3 px-6 flex items-center justify-center gap-3 text-sm"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                  Use External Wallet
                </button>
              </div>
              ) : (
                <div className="p-4 border-2 border-[var(--ink)] bg-[var(--paper)]">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-3 h-3 bg-[var(--ink)] rounded-full pulse-ring flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={`${getCurrentNetwork().blockExplorer}/address/${account}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm font-semibold text-[var(--ink)] whitespace-nowrap hover:underline cursor-pointer"
                            title="View on BaseScan"
                          >
                            {account.slice(0, 6)}...{account.slice(-4)}
                          </a>
                          <button
                            onClick={() => copyToClipboard(account)}
                            className="p-1 hover:bg-[var(--light)] transition-colors flex-shrink-0"
                            title="Copy address"
                          >
                            {copiedAddress === account ? (
                              <CheckCircle2 className="w-3 h-3 text-[var(--ink)]" strokeWidth={2} />
                            ) : (
                              <Copy className="w-3 h-3 text-[var(--graphite)]" strokeWidth={2} />
                            )}
                          </button>
                          <span className="text-xs text-[var(--graphite)] whitespace-nowrap">
                            ({walletType === 'farcaster' ? 'Mini App' : 'External'})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {chainId !== getCurrentNetwork().chainId && (
                        <button
                          onClick={switchToCurrentNetwork}
                          className="ink-button-outline px-3 py-1.5 text-xs whitespace-nowrap"
                        >
                          Switch to {getCurrentNetwork().name}
                        </button>
                      )}
                      <button
                        onClick={disconnectWallet}
                        className="px-3 py-1.5 text-xs text-[var(--graphite)] hover:text-[var(--ink)] transition-colors whitespace-nowrap"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Click Counter Button - Always Visible */}
          <div className="mb-6">
            <button
              onClick={handleClickCounter}
              disabled={clicking || !account}
              className="ink-button w-full py-4 px-6 flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {clicking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                  Clicking...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" strokeWidth={2} />
                  Your Clicks: {clickCount}
                </>
              )}
            </button>
            {!account && (
              <p className="text-xs text-[var(--graphite)] text-center mt-2">
                Connect wallet to click
              </p>
            )}
          </div>

          {/* Contract Selection */}
          <div className="mb-6">
            <p className="block text-sm font-bold text-[var(--ink)] mb-3 uppercase tracking-wider">
              Select Contract
            </p>
            <div className="space-y-3">
              {Object.entries(CONTRACT_TEMPLATES).map(([key, template]) => {
                const Icon = template.icon;
                const isSelected = selectedContract === key;
                const handleSelect = () => {
                  setSelectedContract(key as keyof typeof CONTRACT_TEMPLATES);
                  setInputValue('');
                  setError(null);
                };
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={handleSelect}
                    className={`
                      w-full p-4 text-left transition-all border-2
                      ${isSelected 
                        ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]' 
                        : 'border-[var(--pencil)] bg-[var(--paper)] hover:border-[var(--ink)]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${isSelected 
                            ? 'border-[var(--paper)] bg-[var(--paper)]' 
                            : 'border-[var(--ink)] bg-transparent'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-[var(--ink)]" />
                        )}
                      </div>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-[var(--paper)]' : 'text-[var(--ink)]'}`} strokeWidth={2} />
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-base ${isSelected ? 'text-[var(--paper)]' : 'text-[var(--ink)]'}`}>
                          {template.name}
                        </h3>
                        <p className={`text-sm mt-0.5 ${isSelected ? 'text-[var(--light)]' : 'text-[var(--graphite)]'}`}>
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Field */}
          {CONTRACT_TEMPLATES[selectedContract].hasInput && 'inputLabel' in CONTRACT_TEMPLATES[selectedContract] && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-[var(--ink)] mb-2 uppercase tracking-wider">
                {'inputLabel' in CONTRACT_TEMPLATES[selectedContract] ? String(CONTRACT_TEMPLATES[selectedContract].inputLabel) : ''}
              </label>
              <input
                type={'inputType' in CONTRACT_TEMPLATES[selectedContract] && CONTRACT_TEMPLATES[selectedContract].inputType === 'number' ? 'number' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={'inputPlaceholder' in CONTRACT_TEMPLATES[selectedContract] ? String(CONTRACT_TEMPLATES[selectedContract].inputPlaceholder || '') : ''}
                className="sketch-input w-full px-4 py-3"
                min={'inputType' in CONTRACT_TEMPLATES[selectedContract] && CONTRACT_TEMPLATES[selectedContract].inputType === 'number' ? '0' : undefined}
              />
            </div>
          )}

          {/* Deploy Button */}
          <button
            onClick={deployContract}
            disabled={!account || deploying || chainId !== getCurrentNetwork().chainId}
            className="ink-button w-full py-4 px-6 text-lg"
          >
            {deploying ? (
              <span className="flex items-center justify-center gap-3">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </span>
            ) : chainId !== getCurrentNetwork().chainId ? (
              `Switch to ${getCurrentNetwork().name}`
            ) : (
              'Deploy Contract'
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 border-2 border-[var(--ink)] bg-[var(--paper)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-sm text-[var(--ink)]">{error}</p>
              </div>
            </div>
          )}

          {/* Transaction Pending */}
          {txHash && !deployedAddress && !error && (
            <div className="mt-4 p-4 border-2 border-dashed border-[var(--pencil)] bg-[var(--highlight)]">
              <p className="font-bold text-[var(--ink)] text-sm uppercase tracking-wide mb-2">Transaction Submitted</p>
              <a
                href={`${getCurrentNetwork().blockExplorer}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sketch-link text-sm inline-flex items-center gap-2"
              >
                View on BaseScan
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
              </a>
            </div>
          )}

          {/* Success Message */}
          {deployedAddress && (
            <div className={`mt-4 p-4 border-2 border-[var(--ink)] bg-[var(--paper)] transition-all ${successFading ? 'animate-fade-out' : 'animate-fade-in'}`}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
                <p className="font-bold text-[var(--ink)] text-sm uppercase tracking-wide">Deployed Successfully</p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[var(--light)] border border-[var(--pencil)]">
                <code className="flex-1 text-xs font-mono text-[var(--ink)] break-all">
                  {deployedAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(deployedAddress)}
                  className="p-2 hover:bg-[var(--highlight)] transition-colors"
                  title="Copy address"
                >
                  {copiedAddress === deployedAddress ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                  )}
                </button>
              </div>
              <a
                href={`${getCurrentNetwork().blockExplorer}/address/${deployedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sketch-link text-sm inline-flex items-center gap-2 mt-3"
              >
                View on BaseScan
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
              </a>
            </div>
          )}
        </div>

        {/* Contracts Deployed Section */}
        <div className="sketch-card">
          <button
            onClick={toggleShowHistory}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              <span className="font-bold text-[var(--ink)] uppercase tracking-wider text-sm">
                Contracts Deployed
              </span>
              {deployedContracts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-bold bg-[var(--ink)] text-[var(--paper)]">
                    {deployedContracts.length}
                  </span>
                  {showHistory && (
                    <div
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setContractSortOrder(contractSortOrder === 'newest' ? 'oldest' : 'newest');
                      }}
                      className="p-1 hover:bg-[var(--light)] rounded transition-colors cursor-pointer"
                      title={contractSortOrder === 'newest' ? 'Showing newest first' : 'Showing oldest first'}
                    >
                      {contractSortOrder === 'newest' ? (
                        <ChevronUp className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {showHistory ? (
              <ChevronUp className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            )}
          </button>
          
          {showHistory && (
            <div className="border-t-2 border-[var(--ink)]">
              {deployedContracts.length === 0 ? (
                <div className="p-6 text-center">
                  <FileCode2 className="w-8 h-8 text-[var(--shade)] mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[var(--graphite)] text-sm">No contracts deployed yet</p>
                </div>
              ) : (
                <div className={`divide-y-2 divide-[var(--light)] ${deployedContracts.length > 5 ? 'max-h-[400px] overflow-y-auto' : ''}`}>
                  {[...deployedContracts]
                    .sort((a, b) => {
                      if (contractSortOrder === 'newest') {
                        return b.timestamp - a.timestamp; // Latest first
                      } else {
                        return a.timestamp - b.timestamp; // Oldest first
                      }
                    })
                    .map((contract, index) => {
                    const template = CONTRACT_TEMPLATES[contract.contractType as keyof typeof CONTRACT_TEMPLATES];
                    const Icon = template?.icon || FileCode2;
                    return (
                      <div 
                        key={contract.address} 
                        className={`p-4 animate-slide-in stagger-${Math.min(index + 1, 3)}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Icon className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-[var(--ink)] text-sm">
                                  {contract.contractName}
                                </span>
                                <span className="text-xs text-[var(--shade)]">
                                  {formatDate(contract.timestamp)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono text-[var(--graphite)] truncate">
                                  {contract.address}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(contract.address)}
                                  className="p-1 hover:bg-[var(--light)] transition-colors flex-shrink-0"
                                >
                                  {copiedAddress === contract.address ? (
                                    <CheckCircle2 className="w-3 h-3 text-[var(--ink)]" strokeWidth={2} />
                                  ) : (
                                    <Copy className="w-3 h-3 text-[var(--pencil)]" strokeWidth={2} />
                                  )}
                                </button>
                              </div>
                              {contract.inputValue && (
                                <p className="text-xs text-[var(--shade)] mt-1 italic">
                                  Initial: "{contract.inputValue}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                const constructorArgs = contract.inputValue 
                                  ? contract.contractType === 'string' 
                                    ? contract.inputValue 
                                    : contract.inputValue
                                  : undefined;
                                verifyContractOnBaseScan(contract.address, contract.contractType, constructorArgs);
                              }}
                              disabled={verifyingContract === contract.address}
                              className="p-2 hover:bg-[var(--light)] transition-colors disabled:opacity-50"
                              title="Verify contract on BaseScan"
                            >
                              {verifyingContract === contract.address ? (
                                <Loader2 className="w-4 h-4 text-[var(--ink)] animate-spin" strokeWidth={2} />
                              ) : (
                                <FileCode2 className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                              )}
                            </button>
                            <a
                              href={`${getCurrentNetwork().blockExplorer}/address/${contract.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-[var(--light)] transition-colors"
                              title="View on BaseScan"
                            >
                              <ExternalLink className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="mt-6 mb-6 sketch-card">
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              <span className="font-bold text-[var(--ink)] uppercase tracking-wider text-sm">
                Leaderboard
              </span>
            </div>
            {showLeaderboard ? (
              <ChevronUp className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            )}
          </button>
          
          {showLeaderboard && (
            <div className="border-t-2 border-[var(--ink)]">
              {loadingLeaderboard ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-6 h-6 text-[var(--ink)] mx-auto animate-spin" strokeWidth={2} />
                  <p className="text-[var(--graphite)] text-sm mt-2">Loading leaderboard...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-[var(--shade)] mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[var(--graphite)] text-sm">No leaderboard data yet</p>
                </div>
              ) : (
                <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[var(--ink)]">
                        <th className="p-3 text-left text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="p-3 text-left text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                          User
                        </th>
                        <th 
                          className="p-3 text-left text-xs font-bold text-[var(--ink)] uppercase tracking-wider cursor-pointer hover:bg-[var(--light)]"
                          onClick={() => toggleLeaderboardSort('contracts')}
                        >
                          <div className="flex items-center gap-2">
                            Contracts
                            {leaderboardSortBy === 'contracts' && leaderboardOrder === 'asc' ? (
                              <ChevronUp className="w-4 h-4" strokeWidth={2} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${leaderboardSortBy !== 'contracts' ? 'opacity-30' : ''}`} strokeWidth={2} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-3 text-left text-xs font-bold text-[var(--ink)] uppercase tracking-wider cursor-pointer hover:bg-[var(--light)]"
                          onClick={() => toggleLeaderboardSort('referrals')}
                        >
                          <div className="flex items-center gap-2">
                            Referrals
                            {leaderboardSortBy === 'referrals' && leaderboardOrder === 'asc' ? (
                              <ChevronUp className="w-4 h-4" strokeWidth={2} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${leaderboardSortBy !== 'referrals' ? 'opacity-30' : ''}`} strokeWidth={2} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-3 text-left text-xs font-bold text-[var(--ink)] uppercase tracking-wider cursor-pointer hover:bg-[var(--light)]"
                          onClick={() => toggleLeaderboardSort('clicks')}
                        >
                          <div className="flex items-center gap-2">
                            Clicks
                            {leaderboardSortBy === 'clicks' && leaderboardOrder === 'asc' ? (
                              <ChevronUp className="w-4 h-4" strokeWidth={2} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${leaderboardSortBy !== 'clicks' ? 'opacity-30' : ''}`} strokeWidth={2} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-3 text-left text-xs font-bold text-[var(--ink)] uppercase tracking-wider cursor-pointer hover:bg-[var(--light)]"
                          onClick={() => toggleLeaderboardSort('firstDeploy')}
                        >
                          <div className="flex items-center gap-2">
                            First Deploy
                            {leaderboardSortBy === 'firstDeploy' && leaderboardOrder === 'asc' ? (
                              <ChevronUp className="w-4 h-4" strokeWidth={2} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${leaderboardSortBy !== 'firstDeploy' ? 'opacity-30' : ''}`} strokeWidth={2} />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[var(--light)]">
                      {leaderboard
                        .slice((leaderboardPage - 1) * LEADERBOARD_PAGE_SIZE, leaderboardPage * LEADERBOARD_PAGE_SIZE)
                        .map((user, index) => (
                        <tr key={user.fid || `user-${index}`} className="hover:bg-[var(--light)]">
                          <td className="p-3 text-sm font-bold text-[var(--ink)]">
                            #{(leaderboardPage - 1) * LEADERBOARD_PAGE_SIZE + index + 1}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <a
                                href={user.username ? `https://farcaster.xyz/${user.username}` : `https://warpcast.com/~/conversations`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:opacity-70 transition-opacity flex-shrink-0"
                              >
                                {user.pfpUrl ? (
                                  <img 
                                    src={user.pfpUrl} 
                                    alt={user.displayName || user.username || 'User'}
                                    className="w-8 h-8 rounded-full border-2 border-[var(--ink)] flex-shrink-0"
                                    crossOrigin="anonymous"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full border-2 border-[var(--ink)] bg-[var(--light)] flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-[var(--ink)] truncate">
                                      {user.displayName || user.username || 'User'}
                                    </span>
                                    {user.highestAchievement && (() => {
                                      const iconMap: Record<string, React.ComponentType<any>> = {
                                        'Sparkles': Sparkles,
                                        'Zap': Zap,
                                        'Trophy': Trophy,
                                        'Crown': Crown,
                                        'Rocket': Rocket,
                                        'Gem': Gem,
                                        'Flame': Flame
                                      };
                                      const IconComponent = iconMap[user.highestAchievement.icon] || Sparkles;
                                      return (
                                        <span 
                                          className="flex-shrink-0" 
                                          title={`${user.highestAchievement.name} (${user.highestAchievement.milestone}+ contracts)`}
                                        >
                                          <IconComponent className="w-3.5 h-3.5 text-[var(--ink)]" strokeWidth={2.5} />
                                        </span>
                                      );
                                    })()}
                                  </div>
                                  {user.username && (
                                    <div className="text-xs text-[var(--graphite)] truncate">
                                      @{user.username}
                                    </div>
                                  )}
                                </div>
                              </a>
                            </div>
                          </td>
                          <td className="p-3 text-sm font-bold text-[var(--ink)] text-center">
                            {user.contractCount}
                          </td>
                          <td className="p-3 text-sm font-bold text-[var(--ink)] text-center">
                            {user.referralCount}
                          </td>
                          <td className="p-3 text-sm font-bold text-[var(--ink)] text-center">
                            {user.clicks || 0}
                          </td>
                          <td className="p-3 text-xs text-[var(--graphite)]">
                            {user.firstDeployedAt ? formatDate(user.firstDeployedAt) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls - Outside scrollable area */}
                {leaderboard.length > LEADERBOARD_PAGE_SIZE && (
                  <div className="flex items-center justify-between p-3 border-t-2 border-[var(--ink)] bg-[var(--paper)]">
                    <button
                      onClick={() => setLeaderboardPage(p => Math.max(1, p - 1))}
                      disabled={leaderboardPage === 1}
                      className={`px-3 py-2 border-2 border-[var(--ink)] font-bold text-sm transition-colors ${
                        leaderboardPage === 1
                          ? 'bg-[var(--light)] text-[var(--graphite)] cursor-not-allowed'
                          : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--light)]'
                      }`}
                    >
                      ←
                    </button>
                    <span className="text-sm font-bold text-[var(--ink)]">
                      {leaderboardPage} of {Math.ceil(leaderboard.length / LEADERBOARD_PAGE_SIZE)}
                    </span>
                    <button
                      onClick={() => setLeaderboardPage(p => Math.min(Math.ceil(leaderboard.length / LEADERBOARD_PAGE_SIZE), p + 1))}
                      disabled={leaderboardPage >= Math.ceil(leaderboard.length / LEADERBOARD_PAGE_SIZE)}
                      className={`px-3 py-2 border-2 border-[var(--ink)] font-bold text-sm transition-colors ${
                        leaderboardPage >= Math.ceil(leaderboard.length / LEADERBOARD_PAGE_SIZE)
                          ? 'bg-[var(--light)] text-[var(--graphite)] cursor-not-allowed'
                          : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--light)]'
                      }`}
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          )}
        </div>

        {/* Profile Modal */}
        {showProfileModal && farcasterUser && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowProfileModal(false)}
          >
            <div 
              className="bg-[var(--paper)] border-2 border-[var(--ink)] max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--ink)]">Your Profile</h2>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="p-2 hover:bg-[var(--light)] transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-[var(--ink)]">
                  {farcasterUser.pfpUrl ? (
                    <img 
                      src={farcasterUser.pfpUrl} 
                      alt={farcasterUser.displayName || farcasterUser.username || 'User'}
                      className="w-16 h-16 rounded-full border-2 border-[var(--ink)]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-[var(--ink)] bg-[var(--light)] flex items-center justify-center">
                      <User className="w-8 h-8 text-[var(--ink)]" strokeWidth={2} />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-[var(--ink)]">
                      {farcasterUser.displayName || farcasterUser.username || 'User'}
                    </p>
                    <p className="text-sm text-[var(--graphite)]">
                      @{farcasterUser.username || `fid:${farcasterUser.fid}`}
                    </p>
                  </div>
                </div>

                {/* Referral Code */}
                {loadingReferralInfo ? (
                  <div className="text-center py-8 text-[var(--graphite)]">Loading...</div>
                ) : userReferralInfo ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
                        Your Referral Code
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={userReferralInfo.referralCode || `ref-${farcasterUser.fid}`}
                          readOnly
                          className="flex-1 px-4 py-2 border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-mono"
                        />
                        <button
                          onClick={() => {
                            const code = userReferralInfo.referralCode || `ref-${farcasterUser.fid}`;
                            navigator.clipboard.writeText(code);
                            setError('Referral code copied!');
                            setTimeout(() => setError(null), 2000);
                          }}
                          className="px-4 py-2 border-2 border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--graphite)] transition-colors"
                        >
                          <Copy className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    {/* Referral Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 border-2 border-[var(--ink)] bg-[var(--light)]">
                        <p className="text-xs text-[var(--graphite)] mb-1">Referrals</p>
                        <p className="text-2xl font-bold text-[var(--ink)]">
                          {userReferralInfo.referralCount || 0}
                        </p>
                      </div>
                      <div className="p-4 border-2 border-[var(--ink)] bg-[var(--light)]">
                        <p className="text-xs text-[var(--graphite)] mb-1">Points</p>
                        <p className="text-2xl font-bold text-[var(--ink)]">
                          {userReferralInfo.totalPoints || 0}
                        </p>
                      </div>
                      <div className="p-4 border-2 border-[var(--ink)] bg-[var(--light)]">
                        <p className="text-xs text-[var(--graphite)] mb-1">Clicks</p>
                        <p className="text-2xl font-bold text-[var(--ink)]">
                          {clickCount}
                        </p>
                      </div>
                    </div>

                    {/* Referred Users List */}
                    {userReferralInfo.referredUsers && userReferralInfo.referredUsers.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-[var(--ink)] mb-3">
                          Referred Users ({userReferralInfo.referredUsers.length})
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {userReferralInfo.referredUsers.map((referredUser: any, index: number) => {
                            const user = typeof referredUser === 'string' 
                              ? { fid: referredUser }
                              : referredUser;
                            return (
                              <div 
                                key={index}
                                className="flex items-center gap-3 p-3 border border-[var(--pencil)] bg-[var(--light)]"
                              >
                                {user.pfpUrl ? (
                                  <img 
                                    src={user.pfpUrl} 
                                    alt={user.displayName || user.username || 'User'}
                                    className="w-10 h-10 rounded-full border border-[var(--ink)]"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full border border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center">
                                    <User className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[var(--ink)] truncate">
                                    {user.displayName || user.username || `FID ${user.fid}`}
                                  </p>
                                  {user.username && (
                                    <p className="text-xs text-[var(--graphite)] truncate">
                                      @{user.username} • FID {user.fid}
                                    </p>
                                  )}
                                  {!user.username && (
                                    <p className="text-xs text-[var(--graphite)]">
                                      FID {user.fid}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-[var(--graphite)]">
                    Failed to load referral info
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Referral Code Input Section */}
        {!referralValidated && !referredBy && (
          <div className="mt-6 mb-6 p-4 border-2 border-[var(--ink)] bg-[var(--paper)] pencil-sketch-bg">
            <h3 className="font-bold text-[var(--ink)] text-sm uppercase tracking-wider mb-3">
              Enter Referral Code
            </h3>
            <form onSubmit={handleManualReferralSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={manualReferralCode}
                  onChange={(e) => {
                    setManualReferralCode(e.target.value);
                    setReferralValidationError(null);
                    setReferralValidated(false);
                  }}
                  placeholder="ref-123456"
                  className="flex-1 px-3 py-2 border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
                  disabled={validatingReferral || referralValidated}
                />
                <button
                  type="submit"
                  disabled={validatingReferral || referralValidated || !manualReferralCode.trim()}
                  className="px-4 py-2 border-2 border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] font-bold text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--sketch)] transition-colors whitespace-nowrap"
                >
                  {validatingReferral ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  ) : referralValidated ? (
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    'Validate'
                  )}
                </button>
              </div>
              {referralValidationError && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="w-4 h-4" strokeWidth={2} />
                  <span>{referralValidationError}</span>
                </div>
              )}
              {referralValidated && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>Referral code validated! Deploy your first contract to earn referral points.</span>
                </div>
              )}
              <p className="text-xs text-[var(--graphite)]">
                Enter a referral code to earn points when you deploy your first contract. The referrer must have deployed at least one contract for their code to be active.
              </p>
            </form>
          </div>
        )}

        {/* Stats & Achievements Section */}
        <div className="mt-6 mb-6 sketch-card">
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Gem className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              <h3 className="font-bold text-[var(--ink)] text-sm uppercase tracking-wider">
                Your Stats & Achievements
              </h3>
            </div>
            {showAchievements ? (
              <ChevronUp className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            )}
          </button>
          
          {showAchievements && (
            <div className="border-t-2 border-[var(--ink)] p-4">
              {/* Referral Code Display */}
              {referralCode && (
                <div className="text-xs text-[var(--graphite)] mb-3 pb-2 border-b border-[var(--pencil)]">
                  Ref: <span className="font-mono">{referralCode}</span>
                </div>
              )}
              
              {/* Stats Row */}
              <div className="mb-4 pb-4 border-b-2 border-[var(--light)]">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div className="text-2xl font-bold text-[var(--ink)]">
                  {deployedContracts.length}
                </div>
                <div className="text-xs text-[var(--graphite)]">Contracts Deployed</div>
              </div>
              {(referralPoints > 0 || referredBy) && (
                <div>
                  <div className="text-2xl font-bold text-[var(--ink)]">
                    {referralPoints}
                  </div>
                  <div className="text-xs text-[var(--graphite)]">Referral Points</div>
                </div>
              )}
            </div>
          </div>

          {/* Achievements Grid with Pagination */}
          <div>
            <h4 className="font-bold text-[var(--ink)] text-xs uppercase tracking-wider mb-3">
              Achievements
            </h4>
            {(() => {
              const ACHIEVEMENTS_PER_PAGE = 6;
              const totalPages = Math.ceil(ACHIEVEMENTS.length / ACHIEVEMENTS_PER_PAGE);
              const startIndex = (achievementsPage - 1) * ACHIEVEMENTS_PER_PAGE;
              const paginatedAchievements = ACHIEVEMENTS.slice(startIndex, startIndex + ACHIEVEMENTS_PER_PAGE);
              
              return (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
                    {paginatedAchievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      const isUnlocked = achievements.find(a => a.id === achievement.id)?.unlocked || false;
                      return (
                        <div
                          key={achievement.id}
                          className={`flex flex-col items-center p-3 border-2 animate-slide-in stagger-${Math.min(index + 1, 3)} ${
                            isUnlocked 
                              ? 'border-[var(--ink)] bg-[var(--paper)]' 
                              : 'border-[var(--pencil)] bg-[var(--light)] opacity-50'
                          }`}
                          title={isUnlocked ? `${achievement.name}: ${achievement.description}` : `Locked: ${achievement.description}`}
                        >
                          <Icon 
                            className={`w-6 h-6 mb-2 ${isUnlocked ? 'text-[var(--ink)]' : 'text-[var(--graphite)]'}`} 
                            strokeWidth={2} 
                          />
                          <div className={`text-xs text-center font-semibold ${isUnlocked ? 'text-[var(--ink)]' : 'text-[var(--graphite)]'}`}>
                            {achievement.milestone}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2 border-t border-[var(--pencil)]">
                      <button
                        onClick={() => setAchievementsPage(p => Math.max(1, p - 1))}
                        disabled={achievementsPage === 1}
                        className={`px-3 py-1.5 border-2 border-[var(--ink)] font-bold text-xs transition-colors ${
                          achievementsPage === 1
                            ? 'bg-[var(--light)] text-[var(--graphite)] cursor-not-allowed'
                            : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--light)]'
                        }`}
                      >
                        ←
                      </button>
                      <span className="text-xs font-bold text-[var(--ink)]">
                        {achievementsPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setAchievementsPage(p => Math.min(totalPages, p + 1))}
                        disabled={achievementsPage >= totalPages}
                        className={`px-3 py-1.5 border-2 border-[var(--ink)] font-bold text-xs transition-colors ${
                          achievementsPage >= totalPages
                            ? 'bg-[var(--light)] text-[var(--graphite)] cursor-not-allowed'
                            : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--light)]'
                        }`}
                      >
                        →
                      </button>
                    </div>
                  )}
                  
                  {/* Next Achievement Hint */}
                  {achievements.filter(a => !a.unlocked).length > 0 && (
                    <div className="text-xs text-[var(--graphite)] text-center pt-2 border-t border-[var(--pencil)]">
                      Next: {achievements.find(a => !a.unlocked)?.name} ({achievements.find(a => !a.unlocked)?.milestone} contracts)
                    </div>
                  )}
                </>
              );
            })()}
            </div>
            </div>
          )}
        </div>

        {/* On-Chain Resume Section */}
        {account && (
          <div className="mt-6 mb-6 sketch-card">
            <button
              onClick={() => setShowResume(!showResume)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Rocket className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
                <span className="font-bold text-[var(--ink)] uppercase tracking-wider text-sm">
                  On-Chain Resume
                </span>
              </div>
              {showResume ? (
                <ChevronUp className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              )}
            </button>

            {showResume && (
              <div className="border-t-2 border-[var(--ink)]">
                {(() => {
                  const metrics = getResumeMetrics();
                  return (
                    <div className="p-4">
                      {/* Resume Card */}
                      <div 
                        id="resume-card"
                        className="p-6 bg-gradient-to-br from-[var(--paper)] to-[var(--light)] border-2 border-[var(--ink)] mb-4"
                      >
                        {/* Header */}
                        <div className="text-center mb-6 pb-4 border-b-2 border-[var(--pencil)]">
                          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 border-2 border-[var(--ink)] rounded-full bg-[var(--ink)]">
                            <Rocket className="w-6 h-6 text-[var(--paper)]" strokeWidth={2.5} />
                          </div>
                          <h2 className="text-2xl font-black text-[var(--ink)] mb-1">Base On-Chain Resume</h2>
                          <p className="text-xs font-mono text-[var(--graphite)]">
                            {account.slice(0, 6)}...{account.slice(-4)}
                          </p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {/* Contracts Deployed */}
                          <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--paper)] text-center">
                            <div className="text-xs text-[var(--graphite)] mb-1 font-bold uppercase tracking-wider">Contracts</div>
                            <div className="text-3xl font-black text-[var(--ink)]">{metrics.contractCount}</div>
                            <div className="text-xs text-[var(--shade)]">Deployed</div>
                          </div>

                          {/* Total Transactions */}
                          <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--paper)] text-center">
                            <div className="text-xs text-[var(--graphite)] mb-1 font-bold uppercase tracking-wider">Transactions</div>
                            <div className="text-3xl font-black text-[var(--ink)]">{metrics.totalTransactions}</div>
                            <div className="text-xs text-[var(--shade)]">Total</div>
                          </div>

                          {/* Days Active */}
                          <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--paper)] text-center">
                            <div className="text-xs text-[var(--graphite)] mb-1 font-bold uppercase tracking-wider">Days Active</div>
                            <div className="text-3xl font-black text-[var(--ink)]">{metrics.uniqueDays}</div>
                            <div className="text-xs text-[var(--shade)]">Diverse</div>
                          </div>

                          {/* Gas Spent */}
                          <div className="p-3 border-2 border-[var(--pencil)] bg-[var(--paper)] text-center">
                            <div className="text-xs text-[var(--graphite)] mb-1 font-bold uppercase tracking-wider">Gas Spent</div>
                            <div className="text-2xl font-black text-[var(--ink)]">{metrics.gasSpentEth}</div>
                            <div className="text-xs text-[var(--shade)]">ETH</div>
                          </div>
                        </div>

                        {/* Reward Strength */}
                        <div className={`p-4 border-2 border-[var(--ink)] text-center ${metrics.rewardStrength.color}`}>
                          <div className="text-xs font-bold uppercase tracking-wider mb-1">Reward Strength</div>
                          <div className="text-2xl font-black">{metrics.rewardStrength.level}</div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t-2 border-[var(--pencil)] text-center">
                          <p className="text-xs text-[var(--graphite)] font-mono">
                            Generated by Base Deployer 
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={downloadResumeAsImage}
                          disabled={generatingResume}
                          className="w-full px-4 py-3 border-2 border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-colors hover:bg-[var(--sketch)]"
                        >
                          {generatingResume ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                              Generating...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Download className="w-4 h-4" strokeWidth={2} />
                              Download as Image
                            </span>
                          )}
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={shareOnTwitter}
                            disabled={generatingResume}
                            className="px-3 py-2 border-2 border-[var(--pencil)] bg-[var(--paper)] text-[var(--ink)] font-bold text-xs uppercase tracking-wider hover:border-[var(--ink)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {generatingResume ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Twitter className="w-4 h-4" strokeWidth={2} />
                                Share on X
                              </>
                            )}
                          </button>
                          <button
                            onClick={shareOnFarcaster}
                            disabled={generatingResume}
                            className="px-3 py-2 border-2 border-[var(--pencil)] bg-[var(--paper)] text-[var(--ink)] font-bold text-xs uppercase tracking-wider hover:border-[var(--ink)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {generatingResume ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <MessageCircle className="w-4 h-4" strokeWidth={2} />
                                Share on FC
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-[var(--graphite)] text-center pt-2">
                          Tip: Share your resume to showcase your on-chain credentials and inspire others
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Achievement Celebration Modal */}
        {newAchievement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className={`absolute inset-0 bg-black/40 ${achievementClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}></div>
            <div className={`relative bg-[var(--paper)] border-4 border-[var(--ink)] rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center ${achievementClosing ? 'animate-achievement-pop-out' : 'animate-achievement-pop-in'}`}>
              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--ink)] rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--ink)] rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--ink)] rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--ink)] rounded-br-2xl"></div>
              
              {/* Badge icon with glow effect */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[var(--ink)] opacity-10 blur-xl rounded-full scale-150"></div>
                {(() => {
                  try {
                    const Icon = newAchievement.icon;
                    if (Icon && typeof Icon === 'function') {
                      return (
                        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-[var(--ink)] rounded-full border-4 border-[var(--paper)] shadow-lg">
                          <Icon className="w-10 h-10 text-[var(--paper)]" strokeWidth={2.5} />
                        </div>
                      );
                    }
                    return <div className="w-20 h-20 mx-auto text-[var(--ink)] text-4xl flex items-center justify-center">✓</div>;
                  } catch (error) {
                    console.error('Error rendering achievement icon:', error);
                    return <div className="w-20 h-20 mx-auto text-[var(--ink)] text-4xl flex items-center justify-center">✓</div>;
                  }
                })()}
              </div>
              
              {/* Achievement text */}
              <div className="mb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--shade)] mb-2">
                  Achievement Unlocked!
                </div>
                <h3 className="text-2xl font-black text-[var(--ink)] mb-2 google-sans-title">
                  {newAchievement?.name || 'Achievement Unlocked'}
                </h3>
                <p className="text-base text-[var(--graphite)] font-medium">
                  {newAchievement?.description || ''}
                </p>
              </div>
              
              {/* Milestone badge */}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--highlight)] border-2 border-[var(--ink)] rounded-full">
                <Sparkles className="w-4 h-4 text-[var(--ink)]" strokeWidth={2.5} />
                <span className="text-sm font-bold text-[var(--ink)]">
                  {newAchievement?.milestone} Contracts Deployed
                </span>
              </div>
            </div>
          </div>
        )}


        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-[var(--shade)] text-sm font-medium tracking-wide">
            {getCurrentNetwork().name} / Chain ID: {getCurrentNetwork().chainIdNumber}
          </p>
          <p className="text-[var(--shade)] text-xs mt-1">
            Compiled with Solidity 0.8.19
          </p>
        </footer>

        {/* Hidden Resume Card for Image Capture - 3:2 Landscape for FC embeds */}
        <div
          id="resume-capture"
          style={{
            position: 'fixed',
            left: '-99999px',
            top: '-99999px',
            width: '900px',
            height: '600px',
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: '-9999',
            backgroundColor: '#fafaf8',
            fontFamily: "'Comic Sans MS', cursive",
            padding: '32px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Section: Header + Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #000', paddingBottom: '16px', marginBottom: '20px' }}>
            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {farcasterUser?.pfpUrl && (
                <img 
                  src={farcasterUser.pfpUrl} 
                  alt="Profile" 
                  style={{ 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '50%', 
                    border: '3px solid #000',
                    objectFit: 'cover',
                  }} 
                />
              )}
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#000', lineHeight: 1.1, margin: 0 }}>
                  {farcasterUser?.displayName || 'Base Builder'}
                </h1>
                <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0 0' }}>
                  {farcasterUser?.username ? `@${farcasterUser.username}` : ''} • {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                </p>
              </div>
            </div>
            {/* Title */}
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#000', margin: 0, textAlign: 'right' }}>
              On-Chain Resume
            </h2>
          </div>

          {/* Middle Section: 4 Metrics in a row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px', flex: 1 }}>
            <div style={{ border: '3px solid #000', padding: '16px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Contracts
              </div>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#000', lineHeight: 1 }}>
                {deployedContracts.length}
              </div>
            </div>

            <div style={{ border: '3px solid #000', padding: '16px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Transactions
              </div>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#000', lineHeight: 1 }}>
                {deployedContracts.length + (clickCount || 0)}
              </div>
            </div>

            <div style={{ border: '3px solid #000', padding: '16px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Days Active
              </div>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#000', lineHeight: 1 }}>
                {new Set(deployedContracts.map(c => new Date(c.timestamp).toDateString())).size}
              </div>
            </div>

            <div style={{ border: '3px solid #000', padding: '16px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Gas Spent
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#000', lineHeight: 1 }}>
                {formatGasSpent(totalGasSpent, ethPrice).ethShort} ETH
              </div>
            </div>
          </div>

          {/* Bottom Section: Reward Strength + Footer */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
            {/* Reward Strength Badge */}
            <div style={{ border: '3px solid #000', padding: '16px', backgroundColor: '#fff', flex: 1 }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>
                Reward Strength
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#000', whiteSpace: 'nowrap' }}>
                  {getRewardStrength()?.level || 'MEDIUM'}
                </span>
                <div style={{ height: '20px', flex: 1, border: '3px solid #000', backgroundColor: '#f0f0f0', minWidth: '100px' }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: '#000',
                      width:
                        getRewardStrength()?.level === 'HIGH'
                          ? '100%'
                          : getRewardStrength()?.level === 'MEDIUM-HIGH'
                          ? '75%'
                          : getRewardStrength()?.level === 'MEDIUM'
                          ? '50%'
                          : '25%',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer/Branding */}
            <div style={{ border: '3px solid #000', padding: '16px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '220px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em', margin: 0, textAlign: 'center' }}>
                Built on Base<br/>On-Chain Activity Proof
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractDeployer;