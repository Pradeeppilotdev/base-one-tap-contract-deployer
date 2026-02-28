import { NextRequest, NextResponse } from 'next/server';

// solc is CommonJS — dynamic import avoids ESM/CJS mismatch issues in Next.js
let solcInstance: any = null;
async function getSolc() {
  if (!solcInstance) {
    solcInstance = require('solc');
  }
  return solcInstance;
}

export async function POST(request: NextRequest) {
  try {
    const { sourceCode, contractName } = await request.json();

    if (!sourceCode || !contractName) {
      return NextResponse.json(
        { error: 'Missing sourceCode or contractName' },
        { status: 400 }
      );
    }

    // Validate contract name (alphanumeric + underscores only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(contractName)) {
      return NextResponse.json(
        { error: 'Invalid contract name. Use only letters, numbers, and underscores.' },
        { status: 400 }
      );
    }

    // Limit source code size (100KB max)
    if (sourceCode.length > 100_000) {
      return NextResponse.json(
        { error: 'Source code too large. Maximum 100KB allowed.' },
        { status: 400 }
      );
    }

    const solc = await getSolc();

    const input = {
      language: 'Solidity',
      sources: {
        [`${contractName}.sol`]: { content: sourceCode },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['evm.bytecode.object', 'abi'],
          },
        },
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for compilation errors
    const errors = output.errors?.filter((e: any) => e.severity === 'error') || [];
    const warnings = output.errors?.filter((e: any) => e.severity === 'warning') || [];

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: errors.map((e: any) => e.formattedMessage).join('\n'),
          warnings: warnings.map((w: any) => w.formattedMessage),
        },
        { status: 400 }
      );
    }

    // Find the compiled contract
    const sourceFile = `${contractName}.sol`;
    const contracts = output.contracts?.[sourceFile];

    if (!contracts || !contracts[contractName]) {
      // Try to find the contract in any source file (in case of naming mismatch)
      const allContracts: string[] = [];
      for (const file of Object.keys(output.contracts || {})) {
        for (const name of Object.keys(output.contracts[file])) {
          allContracts.push(name);
        }
      }

      return NextResponse.json(
        {
          error: `Contract "${contractName}" not found in compilation output. Available contracts: ${allContracts.join(', ') || 'none'}`,
        },
        { status: 400 }
      );
    }

    const contract = contracts[contractName];
    const bytecodeHex = contract.evm.bytecode.object;

    if (!bytecodeHex || bytecodeHex === '') {
      return NextResponse.json(
        { error: 'Compilation produced empty bytecode. Make sure the contract is not abstract or an interface.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      bytecode: '0x' + bytecodeHex,
      abi: contract.abi,
      warnings: warnings.map((w: any) => w.formattedMessage),
      solcVersion: solc.version(),
    });
  } catch (err: any) {
    console.error('Compilation error:', err);
    return NextResponse.json(
      { error: `Compilation failed: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
