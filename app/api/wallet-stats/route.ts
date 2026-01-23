import { NextRequest, NextResponse } from 'next/server';

// Basescan v2 API endpoint for Base chain
const BASESCAN_API_URL = 'https://api.basescan.org/v2/api';

interface BasescanTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasUsed: string;
  isError: string;
  methodId: string;
  functionName: string;
  contractAddress?: string;
}

interface BasescanTokenTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
}

interface WalletStats {
  totalTransactions: number;
  totalContractDeployments: number;
  totalContractInteractions: number;
  totalTokenTransfers: number;
  uniqueContractsInteracted: number;
  uniqueDaysActive: number;
  firstTxDate: string | null;
  lastTxDate: string | null;
  ethBalance: string;
  totalGasUsed: string;
  successfulTxCount: number;
  failedTxCount: number;
  avgGasPerTx: string;
  mostActiveDay: string | null;
  txsByMonth: Record<string, number>;
  recentActivity: BasescanTx[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('address');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Basescan API key not configured' }, { status: 500 });
  }

  try {
    // Fetch multiple data points in parallel
    const [
      normalTxResponse,
      internalTxResponse,
      tokenTxResponse,
      balanceResponse
    ] = await Promise.all([
      // Normal transactions
      fetch(`${BASESCAN_API_URL}?chainid=8453&module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=10000&sort=desc&apikey=${apiKey}`),
      // Internal transactions
      fetch(`${BASESCAN_API_URL}?chainid=8453&module=account&action=txlistinternal&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=10000&sort=desc&apikey=${apiKey}`),
      // Token transfers
      fetch(`${BASESCAN_API_URL}?chainid=8453&module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=10000&sort=desc&apikey=${apiKey}`),
      // ETH balance
      fetch(`${BASESCAN_API_URL}?chainid=8453&module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${apiKey}`)
    ]);

    const [normalTxData, internalTxData, tokenTxData, balanceData] = await Promise.all([
      normalTxResponse.json(),
      internalTxResponse.json(),
      tokenTxResponse.json(),
      balanceResponse.json()
    ]);

    // Parse normal transactions
    const normalTxs: BasescanTx[] = normalTxData.status === '1' ? normalTxData.result : [];
    const internalTxs: BasescanTx[] = internalTxData.status === '1' ? internalTxData.result : [];
    const tokenTxs: BasescanTokenTx[] = tokenTxData.status === '1' ? tokenTxData.result : [];
    const ethBalance = balanceData.status === '1' ? balanceData.result : '0';

    // Calculate stats
    const allTxTimestamps = normalTxs.map(tx => parseInt(tx.timeStamp) * 1000);
    const uniqueDays = new Set(allTxTimestamps.map(ts => new Date(ts).toDateString()));
    
    // Count contract deployments (transactions with empty 'to' address create contracts)
    const contractDeployments = normalTxs.filter(tx => 
      tx.from.toLowerCase() === walletAddress.toLowerCase() && 
      (!tx.to || tx.to === '' || tx.to === '0x')
    );

    // Count contract interactions (transactions with non-empty methodId)
    const contractInteractions = normalTxs.filter(tx => 
      tx.methodId && tx.methodId !== '0x' && tx.methodId !== ''
    );

    // Get unique contracts interacted with
    const uniqueContracts = new Set(
      normalTxs
        .filter(tx => tx.to && tx.to !== '')
        .map(tx => tx.to.toLowerCase())
    );

    // Calculate gas usage
    const totalGasUsed = normalTxs.reduce((sum, tx) => sum + BigInt(tx.gasUsed || '0'), BigInt(0));
    const avgGas = normalTxs.length > 0 ? totalGasUsed / BigInt(normalTxs.length) : BigInt(0);

    // Count successful vs failed transactions
    const successfulTxs = normalTxs.filter(tx => tx.isError === '0');
    const failedTxs = normalTxs.filter(tx => tx.isError === '1');

    // Find most active day
    const dayCount: Record<string, number> = {};
    allTxTimestamps.forEach(ts => {
      const day = new Date(ts).toDateString();
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Transactions by month
    const txsByMonth: Record<string, number> = {};
    allTxTimestamps.forEach(ts => {
      const date = new Date(ts);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      txsByMonth[monthKey] = (txsByMonth[monthKey] || 0) + 1;
    });

    // First and last transaction dates
    const sortedTimestamps = [...allTxTimestamps].sort((a, b) => a - b);
    const firstTxDate = sortedTimestamps.length > 0 ? new Date(sortedTimestamps[0]).toISOString() : null;
    const lastTxDate = sortedTimestamps.length > 0 ? new Date(sortedTimestamps[sortedTimestamps.length - 1]).toISOString() : null;

    // Format ETH balance (wei to ETH)
    const ethBalanceFormatted = (Number(ethBalance) / 1e18).toFixed(6);

    const stats: WalletStats = {
      totalTransactions: normalTxs.length,
      totalContractDeployments: contractDeployments.length,
      totalContractInteractions: contractInteractions.length,
      totalTokenTransfers: tokenTxs.length,
      uniqueContractsInteracted: uniqueContracts.size,
      uniqueDaysActive: uniqueDays.size,
      firstTxDate,
      lastTxDate,
      ethBalance: ethBalanceFormatted,
      totalGasUsed: totalGasUsed.toString(),
      successfulTxCount: successfulTxs.length,
      failedTxCount: failedTxs.length,
      avgGasPerTx: avgGas.toString(),
      mostActiveDay,
      txsByMonth,
      recentActivity: normalTxs.slice(0, 10)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet stats from Basescan' },
      { status: 500 }
    );
  }
}
