import { useState, useEffect, useCallback } from 'react';
import { FaWallet, FaCheckCircle, FaClock, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { IoRocketSharp } from 'react-icons/io5';
import { Challenge, KaspaWalletAPI } from '../types';
import './DonatePage.css';

// Direct blockchain connection - synced via server
const SERVER_URL = 'http://localhost:8080';
const WS_URL = 'ws://localhost:8080';

const DonatePage = () => {
  const [defiId, setDefiId] = useState<string>('');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletAccounts, setWalletAccounts] = useState<string[]>([]);
  const [walletAPI, setWalletAPI] = useState<KaspaWalletAPI | null>(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  
  // Donation state
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donating, setDonating] = useState(false);
  const [countdown, setCountdown] = useState<string>('');
  
  // Alert state
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Get defi ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('defi');
    if (!id) {
      setError('No challenge ID specified in URL');
      setLoading(false);
      return;
    }
    setDefiId(id);
  }, []);

  // Load challenge data from server
  useEffect(() => {
    if (!defiId) return;

    const loadChallenge = async () => {
      try {
        // Fetch from server API
        const response = await fetch(`${SERVER_URL}/api/challenge/${defiId}`);
        if (!response.ok) {
          throw new Error('Challenge not found');
        }
        
        const data = await response.json();
        setChallenge({
          defiId: data.defiId,
          title: data.title,
          goal: data.goal,
          currentAmount: data.currentAmount,
          status: data.status,
          deadline: data.deadline,
          donations: data.donations || [],
          vaultAddress: data.vaultAddress,
          network: data.network,
          networkRPC: data.networkRPC,
        });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenge');
        setLoading(false);
      }
    };

    loadChallenge();
  }, [defiId]);

  // WebSocket for real-time updates from server
  useEffect(() => {
    if (!defiId) return;

    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('Connected to server WebSocket');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'challenge_update' && data.defiId === defiId) {
          // Update challenge with new data from server
          setChallenge(prev => prev ? {
            ...prev,
            currentAmount: data.currentAmount,
            donations: data.donations,
            status: data.status,
          } : null);
        } else if (data.type === 'all_challenges' && data.challenges[defiId]) {
          // Initial data load
          const challengeData = data.challenges[defiId];
          setChallenge(prev => prev ? {
            ...prev,
            currentAmount: challengeData.currentAmount,
            donations: challengeData.donations,
            status: challengeData.status,
          } : null);
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [defiId]);

  // Countdown timer
  useEffect(() => {
    if (!challenge) return;

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = challenge.deadline - now;

      if (remaining <= 0) {
        setCountdown('⏰ Challenge Expired');
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`⏱️ ${hours}h ${minutes}m remaining`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [challenge]);

  // Show alert
  const showAlert = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (walletConnected) {
      // Disconnect
      setWalletConnected(false);
      setWalletAddress('');
      setWalletAccounts([]);
      setWalletAPI(null);
      setShowAccountSelector(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      let api: KaspaWalletAPI | null = null;

      if (window.kasware) {
        console.log('Found Kasware wallet');
        api = window.kasware;
      } else if (window.kaspa) {
        console.log('Found Kaspium wallet');
        api = window.kaspa;
      } else {
        throw new Error('No Kaspa wallet extension found. Please install Kasware or Kaspium.');
      }

      let accounts: string[] = [];
      if (api.requestAccounts) {
        accounts = await api.requestAccounts();
      } else if (api.connect && api.getAccounts) {
        await api.connect();
        accounts = await api.getAccounts();
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in wallet');
      }

      setWalletAccounts(accounts);
      setWalletAddress(accounts[0]);
      setWalletAPI(api);
      setWalletConnected(true);
      console.log('Wallet connected:', accounts[0]);
      if (accounts.length > 1) {
        console.log(`Found ${accounts.length} accounts`);
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      showAlert(message, 'error');
    }
  };

  // Switch wallet account
  const switchAccount = (account: string) => {
    setWalletAddress(account);
    setShowAccountSelector(false);
    console.log('Switched to account:', account);
  };

  // Handle amount selection
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(parseFloat(value) || 0);
  };

  // Donate
  const handleDonate = async () => {
    if (!walletConnected || !walletAPI || !challenge || selectedAmount <= 0) return;

    setDonating(true);

    try {
      const sompiAmount = BigInt(Math.floor(selectedAmount * 100000000));

      console.log('Initiating donation:', {
        amount: selectedAmount,
        sompi: sompiAmount.toString(),
        to: challenge.vaultAddress,
      });

      let txId: string | null = null;
      let txData: any = null; // Full transaction object from wallet, if available

      // Send transaction through wallet (wallet will validate balance)
      // Cast to unknown first: the type says string, but at runtime wallets often
      // return a full transaction object. unknown lets us narrow safely.
      if (walletAPI.sendKaspa) {
        const result: unknown = await walletAPI.sendKaspa(challenge.vaultAddress, sompiAmount.toString());
        if (typeof result === 'string') {
          txId = result;
        } else if (result && typeof result === 'object') {
          txData = result;
          txId = (result as Record<string, any>).id || (result as Record<string, any>).txId || null;
        }
      } else if (walletAPI.sendTransaction) {
        const result: unknown = await walletAPI.sendTransaction({
          to: challenge.vaultAddress,
          amount: sompiAmount.toString(),
        });
        if (typeof result === 'string') {
          txId = result;
        } else if (result && typeof result === 'object') {
          txData = result;
          txId = (result as Record<string, any>).id || (result as Record<string, any>).txId || null;
        }
      } else {
        throw new Error('Wallet does not support sending transactions');
      }

      if (!txId) {
        throw new Error('No transaction ID returned from wallet');
      }

      console.log('✅ Transaction sent! TX ID:', txId);
      console.log('Transaction submitted to blockchain:', txId);

      // Brief delay to let the blockchain index the transaction
      // (only needed if wallet didn't return full txData, but harmless either way)
      if (!txData) {
        console.log('⏳ Waiting for blockchain to index transaction...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Submit to server for verification and state update
      try {
        const submitResponse = await fetch(`${SERVER_URL}/api/donate/${defiId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            txId: txId,
            txData: txData,       // full transaction object for on-chain verification
            donorAddress: walletAddress,
            intendedAmount: selectedAmount,
          }),
        });

        if (!submitResponse.ok) {
          const errorData = await submitResponse.json();
          throw new Error(errorData.error || 'Failed to register donation with server');
        }

        const result = await submitResponse.json();
        console.log('Server confirmed donation:', result);

        showAlert(
          `✅ Donation successful! ${selectedAmount.toFixed(2)} KAS sent. TX: ${txId.substring(0, 10)}...`
        );
      } catch (serverErr) {
        console.error('Server submission error:', serverErr);
        showAlert(
          `⚠️ Transaction sent but server registration failed: ${serverErr instanceof Error ? serverErr.message : 'Unknown error'}`,
          'error'
        );
      }

      // Reset form
      setSelectedAmount(0);
      setCustomAmount('');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Donation failed';
      console.error('Donation error:', err);
      showAlert(message, 'error');
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="donate-page loading">
        <div className="loading-spinner-large"></div>
        <p style={{ color: 'white', fontSize: '1.2em', fontWeight: 600 }}>Loading challenge...</p>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="donate-page error">
        <div className="error-box">
          <FaExclamationCircle size={60} color="#ef4444" />
          <h2>Oops!</h2>
          <p>{error || 'Challenge not found'}</p>
        </div>
      </div>
    );
  }

  const progress = Math.min((challenge.currentAmount / challenge.goal) * 100, 100);
  const goalReached = challenge.currentAmount >= challenge.goal;
  const canDonate = !goalReached && challenge.status === 'active' && selectedAmount > 0;

  return (
    <div className="donate-page">
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="container">
        <div className="header">
          <div className="logo">🎯</div>
          <h1>Support the Challenge</h1>
          <div className="challenge-title">{challenge.title}</div>
          <span className={`status-badge status-${challenge.status}`}>
            <FaCheckCircle /> {challenge.status === 'active' ? 'Active' : challenge.status}
          </span>
        </div>

        <div className="network-info">
          <strong>⚠️ Network: {challenge.network}</strong><br />
          Make sure your wallet is connected to {challenge.network}!
        </div>

        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}>
              <span>{progress.toFixed(0)}%</span>
            </div>
          </div>
          <div className="progress-text">
            {challenge.currentAmount.toFixed(2)} / {challenge.goal} KAS
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <div className="countdown">
              <FaClock /> {countdown}
            </div>
          </div>
        </div>

        <div className="wallet-section">
          <div className="wallet-status">
            {walletConnected ? (
              <><FaCheckCircle color="#10b981" /> Wallet Connected</>
            ) : (
              <><FaWallet color="#9ca3af" /> Wallet Not Connected</>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={connectWallet}
          >
            {walletConnected ? (
              <>
                <FaWallet /> Disconnect
              </>
            ) : (
              <>
                <FaWallet /> Connect Kaspa Wallet
              </>
            )}
          </button>
          {walletAddress && (
            <>
              <div className="wallet-address">{walletAddress}</div>
              {walletAccounts.length > 1 && (
                <div style={{ marginTop: '10px', position: 'relative' }}>
                  <button
                    className="btn"
                    onClick={() => setShowAccountSelector(!showAccountSelector)}
                    style={{
                      fontSize: '0.9em',
                      padding: '8px 16px',
                      background: '#374151',
                      border: '1px solid #4b5563'
                    }}
                  >
                    🔄 Switch Account ({walletAccounts.length} available)
                  </button>
                  {showAccountSelector && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '8px',
                      background: '#1f2937',
                      border: '1px solid #4b5563',
                      borderRadius: '8px',
                      padding: '8px',
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {walletAccounts.map((account, idx) => (
                        <div
                          key={account}
                          onClick={() => switchAccount(account)}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            background: account === walletAddress ? '#10b981' : 'transparent',
                            color: 'white',
                            fontSize: '0.85em',
                            fontFamily: 'monospace',
                            marginBottom: '4px',
                            border: account === walletAddress ? 'none' : '1px solid #374151'
                          }}
                          onMouseEnter={(e) => {
                            if (account !== walletAddress) {
                              e.currentTarget.style.background = '#374151';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (account !== walletAddress) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          {account === walletAddress && '✓ '}
                          {account.substring(0, 20)}...{account.substring(account.length - 10)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {walletConnected && (
          <div className="amount-selection">
            <h3>Select Amount (KAS)</h3>
            <div className="amount-grid">
              {[10, 25, 50, 100, 250, 500].map(amount => (
                <button
                  key={amount}
                  className={`amount-btn ${selectedAmount === amount && !customAmount ? 'selected' : ''}`}
                  onClick={() => handleAmountSelect(amount)}
                >
                  {amount} KAS
                </button>
              ))}
            </div>
            <input
              type="number"
              className="custom-amount"
              placeholder="Or enter custom amount..."
              min="1"
              step="0.01"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={handleDonate}
              disabled={!canDonate || donating}
            >
              {donating ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : goalReached ? (
                <>
                  🎯 Goal Reached!
                </>
              ) : selectedAmount > 0 ? (
                <>
                  <IoRocketSharp size={20} /> Donate {selectedAmount} KAS
                </>
              ) : (
                'Select Amount to Continue'
              )}
            </button>
          </div>
        )}

        <div className="info-box">
          <strong><FaLock /> How it works:</strong><br />
          1. Connect your Kaspa testnet wallet (Kasware/Kaspium)<br />
          2. Choose donation amount<br />
          3. Sign transaction - funds go directly to vault address<br />
          4. Transaction submitted to Kaspa blockchain (no middleman!)
        </div>
      </div>
    </div>
  );
};

export default DonatePage;