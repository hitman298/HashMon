import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import nftService from '../services/nftService';
import PharosLogo from './PharosLogo';

const NFTMinting = ({ hashmon, onMintComplete, onClose, preCreatedVoucher = null }) => {
  const { user, sendTransaction } = usePrivy();
  const [isMinting, setIsMinting] = useState(false);
  const [mintVoucher, setMintVoucher] = useState(preCreatedVoucher);
  const [mintError, setMintError] = useState(null);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintTxHash, setMintTxHash] = useState(null);
  const [userNFTCount, setUserNFTCount] = useState(0);

  // Get user's current NFT count
  useEffect(() => {
    const fetchNFTCount = async () => {
      if (user?.wallet?.address) {
        try {
          const response = await nftService.getUserNFTCount(user.wallet.address);
          setUserNFTCount(response.nftCount);
        } catch (error) {
          console.error('Failed to get NFT count:', error);
        }
      }
    };

    fetchNFTCount();
  }, [user?.wallet?.address]);

  // Set pre-created voucher immediately (instant, no auto-mint)
  useEffect(() => {
    if (preCreatedVoucher && !mintVoucher) {
      setMintVoucher(preCreatedVoucher);
      setIsMinting(false); // Ensure minting state is ready
    }
  }, [preCreatedVoucher]);

  // Create mint voucher
  const createMintVoucher = async () => {
    if (!user?.wallet?.address || !hashmon) {
      setMintError('HashMon data is missing. Please catch a HashMon first.');
      return;
    }

    // Prevent re-creating voucher if one already exists
    if (mintVoucher && !mintVoucher.isMock) {
      // If voucher exists, proceed to mint
      handleMintNFT();
      return;
    }

    setIsMinting(true);
    setMintError(null);

    try {
      const response = await nftService.createMintVoucher(user.wallet.address, hashmon);
      setMintVoucher(response);
      setIsMinting(false); // Reset minting state so button shows
      // Don't auto-mint - show button for user to click
    } catch (error) {
      console.error('❌ Create mint voucher error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request
      });
      
      // Better error messages
      let errorMsg = 'Failed to create mint voucher';
      if (error.message?.includes('Network error') || error.message?.includes('Cannot reach backend')) {
        errorMsg = `Backend API not accessible. Please check:\n1. Backend is deployed and running\n2. VITE_API_URL is set correctly\n3. Backend URL: ${import.meta.env.VITE_API_URL || 'Not set'}`;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setMintError(errorMsg);
      setIsMinting(false);
    }
  };

  // Handle NFT minting with user's wallet
  const handleMintNFT = async () => {
    if (!mintVoucher || !user?.wallet?.address) return;

    setIsMinting(true);
    setMintError(null);

    try {
      // Check if this is a mock voucher
      if (mintVoucher.isMock) {
        // For mock vouchers, just simulate the process
        await new Promise(resolve => setTimeout(resolve, 2000));
        setMintSuccess(true);
        setMintTxHash('mock_tx_hash_' + Date.now());
        
        onMintComplete && onMintComplete({
          transactionHash: 'mock_tx_hash_' + Date.now(),
          tokenId: mintVoucher.voucher.hashmonId,
          isMock: true
        });
        return;
      }

      // For real vouchers, use the user's wallet to mint
      
      if (!user?.wallet?.address) {
        throw new Error('No wallet found. Please ensure you are logged in with Privy and have a wallet connected.');
      }

      // Privy injects a provider into window.ethereum
      // Check multiple possible providers
      let provider;
      let ethereumProvider = null;
      
      // Check for window.ethereum (Privy or MetaMask)
      if (window.ethereum) {
        ethereumProvider = window.ethereum;
      } else if (window.privy) {
        ethereumProvider = window.privy;
      } else {
        // Fallback: create provider from RPC URL (but won't be able to sign)
        throw new Error('No wallet provider found. Please ensure Privy is properly initialized and your wallet is connected.');
      }
      
      provider = new ethers.BrowserProvider(ethereumProvider);
      
      // Verify we're on the correct network and switch if needed BEFORE getting signer
      const network = await provider.getNetwork();
      const expectedChainId = BigInt(import.meta.env.VITE_PHAROS_CHAIN_ID || '688688');
      const expectedChainIdHex = '0x' + expectedChainId.toString(16);
      
      if (network.chainId !== expectedChainId) {
        // Try to switch network automatically
        if (window.ethereum && window.ethereum.request) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: expectedChainIdHex }],
            });
            // Wait a bit for the network to switch
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Refresh provider after switch
            provider = new ethers.BrowserProvider(window.ethereum);
          } catch (switchError) {
            if (switchError.code === 4902) {
              // Network not added, try to add it
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: expectedChainIdHex,
                    chainName: 'Pharos Testnet',
                    nativeCurrency: {
                      name: 'PHRS',
                      symbol: 'PHRS',
                      decimals: 18,
                    },
                    rpcUrls: [import.meta.env.VITE_PHAROS_RPC_URL || 'https://testnet.dplabs-internal.com'],
                    blockExplorerUrls: [import.meta.env.VITE_PHAROS_EXPLORER_URL || 'https://testnet.pharosscan.xyz'],
                  }],
                });
                // Wait a bit for the network to be added
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Refresh provider after adding
                provider = new ethers.BrowserProvider(window.ethereum);
              } catch (addError) {
                throw new Error(`Failed to add Pharos Testnet network: ${addError.message}. Please add it manually using the "Add Network" button.`);
              }
            } else {
              throw new Error(`Failed to switch to Pharos Testnet (Chain ID: ${expectedChainId}): ${switchError.message}. Please switch manually using the "Switch to Pharos" button.`);
            }
          }
        } else {
          throw new Error(`Wrong network! Please switch to Pharos Testnet (Chain ID: ${expectedChainId}). Current: ${network.chainId}. Use the "Switch to Pharos" button below.`);
        }
      }
      
      // Verify network again after switching
      const finalNetwork = await provider.getNetwork();
      if (finalNetwork.chainId !== expectedChainId) {
        throw new Error(`Still on wrong network after switch attempt. Current: ${finalNetwork.chainId}, Expected: ${expectedChainId}`);
      }
      
      // Get signer after network is verified
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      // Verify the signer address matches the user's wallet
      if (signerAddress.toLowerCase() !== user.wallet.address.toLowerCase()) {
        // Try to get signer with user's address
        try {
          await provider.getSigner(user.wallet.address);
        } catch (e) {
          // Proceed with original signer
        }
      }

      // Contract ABI for mintWithVoucher function
      const contractABI = [
        "function mintWithVoucher(tuple(address player, uint256 hashmonId, uint256 level, uint256 nonce, uint256 expiry, string metadataURI) voucher, tuple(uint256 id, string name, uint256 level, uint256 xp, uint256 hp, uint256 attack, uint256 defense, uint256 speed, string type1, string type2, uint256 rarity, uint256 createdAt) hashmon, bytes signature) external"
      ];
      
      const contractAddress = import.meta.env.VITE_HASHMON_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        throw new Error('Contract address not configured. Please check your environment variables.');
      }
      
      const hashmonContract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Prepare voucher tuple with proper BigInt conversion
      const voucherTuple = {
        player: mintVoucher.voucher.player,
        hashmonId: BigInt(String(mintVoucher.voucher.hashmonId)),
        level: BigInt(Number(mintVoucher.voucher.level)),
        nonce: BigInt(Number(mintVoucher.voucher.nonce)),
        expiry: BigInt(Number(mintVoucher.voucher.expiry)),
        metadataURI: mintVoucher.voucher.metadataURI
      };
      
      // Prepare hashmon tuple with proper BigInt conversion
      const hashmonTuple = {
        id: BigInt(String(mintVoucher.hashmonData.id)),
        name: mintVoucher.hashmonData.name,
        level: BigInt(Number(mintVoucher.hashmonData.level)),
        xp: BigInt(Number(mintVoucher.hashmonData.xp || 0)),
        hp: BigInt(Number(mintVoucher.hashmonData.hp)),
        attack: BigInt(Number(mintVoucher.hashmonData.attack)),
        defense: BigInt(Number(mintVoucher.hashmonData.defense)),
        speed: BigInt(Number(mintVoucher.hashmonData.speed)),
        type1: mintVoucher.hashmonData.type1 || 'Normal',
        type2: mintVoucher.hashmonData.type2 || '',
        rarity: BigInt(Number(mintVoucher.hashmonData.rarity || 1)),
        createdAt: BigInt(Number(mintVoucher.hashmonData.createdAt || Math.floor(Date.now() / 1000)))
      };
      
      // Verify voucher hasn't expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (Number(voucherTuple.expiry) < currentTime) {
        throw new Error(`Voucher expired! Expiry: ${new Date(Number(voucherTuple.expiry) * 1000).toLocaleString()}, Current: ${new Date(currentTime * 1000).toLocaleString()}`);
      }
      
      // Verify player address matches
      if (voucherTuple.player.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error(`Player address mismatch! Voucher: ${voucherTuple.player}, Signer: ${signerAddress}`);
      }
      
      // Simulate transaction first to catch revert reasons (Pharos best practice)
      try {
        // Use staticCall to simulate without sending
        await hashmonContract.mintWithVoucher.staticCall(
          voucherTuple,
          hashmonTuple,
          mintVoucher.signature
        );
      } catch (simError) {
        // Extract revert reason if available
        let revertReason = 'Unknown revert reason';
        if (simError.reason) {
          revertReason = simError.reason;
        } else if (simError.data) {
          try {
            // Try to decode revert reason from error data
            const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['string'], simError.data);
            revertReason = decoded[0];
          } catch (e) {
            revertReason = 'Contract reverted (check signature, nonce, or expiry)';
          }
        } else if (simError.message) {
          revertReason = simError.message;
        }
        throw new Error(`Transaction would revert: ${revertReason}. Please check: 1) Voucher signature is valid, 2) Nonce hasn't been used, 3) Voucher hasn't expired, 4) Player address matches.`);
      }
      
      // Estimate gas before sending (Pharos best practice)
      let gasEstimate;
      try {
        gasEstimate = await hashmonContract.mintWithVoucher.estimateGas(
          voucherTuple,
          hashmonTuple,
          mintVoucher.signature
        );
        // Add 20% buffer for gas
        const gasLimit = gasEstimate + (gasEstimate / BigInt(5));
        
        // Send the mint transaction with estimated gas
        const tx = await hashmonContract.mintWithVoucher(
          voucherTuple,
          hashmonTuple,
          mintVoucher.signature,
          {
            gasLimit: gasLimit
          }
        );

        setMintTxHash(tx.hash);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        
        // Check transaction status
        if (receipt.status === 0) {
          throw new Error('Transaction reverted! Check contract logs for details. Common causes: invalid signature, nonce already used, expired voucher, or player address mismatch.');
        }
        
        setMintSuccess(true);
        
        // Update NFT count
        setUserNFTCount(prev => prev + 1);
        
        // Call the callback to update parent component
        onMintComplete && onMintComplete({
          transactionHash: tx.hash,
          tokenId: mintVoucher.voucher.hashmonId,
          isMock: false
        });
        
        return; // Exit successfully
        
      } catch (gasError) {
        // If gas estimation fails, use default gas limit
        const tx = await hashmonContract.mintWithVoucher(
          voucherTuple,
          hashmonTuple,
          mintVoucher.signature,
          {
            gasLimit: 500000 // Fallback gas limit
          }
        );
        
        setMintTxHash(tx.hash);
        
        const receipt = await tx.wait();
        
        // Check transaction status
        if (receipt.status === 0) {
          throw new Error('Transaction reverted! Check contract logs for details. Common causes: invalid signature, nonce already used, expired voucher, or player address mismatch.');
        }
        
        setMintSuccess(true);
        setUserNFTCount(prev => prev + 1);
        
        onMintComplete && onMintComplete({
          transactionHash: tx.hash,
          tokenId: mintVoucher.voucher.hashmonId,
          isMock: false
        });
        
        return; // Exit successfully
      }
      
    } catch (error) {
      // Provide more specific error messages
      let errorMessage = 'Failed to mint NFT. ';
      
      if (error.message?.includes('insufficient funds') || error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage += 'Insufficient funds for gas fees. Please add PHRS to your wallet.';
      } else if (error.message?.includes('user rejected') || error.code === 4001) {
        errorMessage += 'Transaction was cancelled.';
      } else if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
        errorMessage += 'Network error. Please ensure you are connected to Pharos Testnet.';
      } else if (error.message?.includes('revert') || error.data || error.receipt?.status === 0) {
        let revertDetails = '';
        if (error.reason) {
          revertDetails = ` Reason: ${error.reason}`;
        } else if (error.message?.includes('would revert')) {
          revertDetails = ` ${error.message}`;
        } else {
          revertDetails = ' Transaction reverted. Common causes: Invalid signature, nonce already used, expired voucher, or player address mismatch.';
        }
        errorMessage += `Contract error: ${error.reason || error.message || 'Transaction reverted'}${revertDetails}`;
      } else if (error.message?.includes('wrong chain') || error.message?.includes('chain')) {
        errorMessage += 'Wrong network. Please switch to Pharos Testnet (Chain ID: 688688).';
      } else {
        errorMessage += `Error: ${error.message || 'Unknown error'}. Please check the console for details.`;
      }
      
      setMintError(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  if (!user?.wallet?.address) {
    return (
      <div className="card">
        <h3>Connect Wallet to Mint NFT</h3>
        <p>Please connect your wallet to mint your HashMon as an NFT.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PharosLogo size="sm" animated={true} />
          <h3 className="text-2xl font-bold">Mint HashMon NFT</h3>
        </div>
        <p className="text-gray-300">
          Convert your caught HashMon into a blockchain NFT on <strong className="text-blue-400">Pharos Network</strong>!
        </p>
      </div>

      {/* HashMon Preview */}
      {hashmon && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 mb-4">
            <h4 className="text-xl font-bold text-white mb-2">{hashmon.name}</h4>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white">Level {hashmon.level}</span>
              <span className="text-white capitalize">{hashmon.type}</span>
              <span className="text-white capitalize">{hashmon.rarity}</span>
              {hashmon.isShiny && <span className="text-yellow-400">✨ Shiny</span>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-red-600 rounded p-2 text-center">
              <div className="text-white font-bold">HP: {hashmon.stats.hp}</div>
            </div>
            <div className="bg-orange-600 rounded p-2 text-center">
              <div className="text-white font-bold">ATK: {hashmon.stats.attack}</div>
            </div>
            <div className="bg-blue-600 rounded p-2 text-center">
              <div className="text-white font-bold">DEF: {hashmon.stats.defense}</div>
            </div>
            <div className="bg-green-600 rounded p-2 text-center">
              <div className="text-white font-bold">SPD: {hashmon.stats.speed}</div>
            </div>
          </div>
        </div>
      )}

      {/* User Stats */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Your NFTs:</span>
          <span className="text-white font-bold text-xl">{userNFTCount}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Wallet: {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
        </div>
      </div>

      {/* Error Display */}
      {mintError && (
        <div className="mb-4 p-4 bg-red-600/90 rounded-lg border-2 border-red-400">
          <p className="text-white font-bold mb-2">❌ Error</p>
          <p className="text-white text-sm">{mintError}</p>
          {mintVoucher?.isMock && (
            <p className="text-red-200 text-xs mt-2">
              Note: This is a mock voucher. Configure backend wallet and contract for real minting.
            </p>
          )}
        </div>
      )}

      {/* Success Display */}
      {mintSuccess && (
        <div className="mb-4 p-4 bg-green-600/90 rounded-lg border-2 border-green-400">
          <p className="text-white font-bold mb-2">🎉 NFT Minted Successfully!</p>
          <p className="text-white text-sm mb-2">
            Your HashMon is now a blockchain NFT on Pharos Network!
          </p>
          {mintTxHash && (
            <>
              <p className="text-green-200 text-xs mt-2 font-mono break-all mb-2">
                TX Hash: {mintTxHash}
              </p>
              <a
                href={`${import.meta.env.VITE_PHAROS_EXPLORER_URL || 'https://testnet.pharosscan.xyz'}/tx/${mintTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-green-200 text-xs underline hover:text-green-100 font-semibold"
              >
                🔗 View Transaction on Explorer
              </a>
            </>
          )}
        </div>
      )}

      {/* Mint Voucher Display */}
      {mintVoucher && !mintSuccess && (
        <div className={`mb-6 p-4 rounded-lg ${mintVoucher.isMock ? 'bg-orange-900' : 'bg-blue-900'}`}>
          <h4 className="text-white font-bold mb-2">
            {mintVoucher.isMock ? 'Mock Voucher Created' : 'Mint Voucher Created'}
          </h4>
          {mintVoucher.isMock && (
            <div className="mb-2 p-2 bg-orange-800 rounded text-orange-200 text-sm">
              ⚠️ Blockchain not configured - This is a demo voucher
            </div>
          )}
          <div className="text-xs text-gray-300 space-y-1">
            <div>Token ID: {mintVoucher.voucher.hashmonId}</div>
            <div>Nonce: {typeof mintVoucher.nonce === 'string' ? mintVoucher.nonce.slice(0, 16) + '...' : String(mintVoucher.nonce).slice(0, 16)}</div>
            <div>Expires: {new Date(Number(mintVoucher.voucher.expiry) * 1000).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!mintVoucher && !mintSuccess && (
          <button
            className="btn btn-primary flex-1"
            onClick={createMintVoucher}
            disabled={isMinting}
          >
            {isMinting ? 'Creating Voucher...' : 'Create Mint Voucher'}
          </button>
        )}

        {mintVoucher && !mintSuccess && (
          <>
            <button
              className="btn btn-primary flex-1"
              onClick={handleMintNFT}
              disabled={isMinting}
            >
              {isMinting ? 'Minting NFT...' : 'Mint NFT'}
            </button>
            <button
              className="btn btn-outline"
              onClick={onClose}
              disabled={isMinting}
            >
              Cancel
            </button>
          </>
        )}

        {mintSuccess && (
          <button
            className="btn btn-secondary flex-1"
            onClick={onClose}
          >
            Close
          </button>
        )}

        {!mintVoucher && !mintSuccess && (
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={isMinting}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-400">
        {mintVoucher?.isMock ? (
          <>
            <p>⚠️ Demo Mode - Blockchain not configured</p>
            <p>📊 Voucher created but NFT not minted on blockchain</p>
            <p>🔧 Configure backend wallet and contract for real NFTs</p>
          </>
        ) : (
          <>
            <p>🔗 Your NFT will be minted on Pharos Testnet</p>
            <p>📊 All stats and metadata will be stored on-chain</p>
            <p>✅ You can verify ownership anytime on the blockchain</p>
          </>
        )}
      </div>
    </div>
  );
};

export default NFTMinting;
