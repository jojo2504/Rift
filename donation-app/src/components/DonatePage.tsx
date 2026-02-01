import { useState, useEffect, useCallback } from 'react';
import { FaWallet, FaCheckCircle, FaClock, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { IoRocketSharp } from 'react-icons/io5';
import { Challenge, KaspaWalletAPI } from '../types';
import './DonatePage.css';

// Direct blockchain connection - no backend needed
const RPC_URL = 'wss://baryon-10.kaspa.green/kaspa/testnet-10/wrpc/borsh';
const NETWORK = 'testnet-10';
const VAULT_ADDRESS = 'kaspatest:qzfdvw6mvzwkzr2rfrq268ut0a90gm6pxe6enxj3j25kp97t4jvz7pxyxt0vl';

// Mock challenges data (in production, this would come from blockchain or IPFS)
const MOCK_CHALLENGES: Record<string, Challenge> = {
  'piment': {
    defiId: 'piment',
    title: "Manger un piment rouge",
    goal: 1000,
    currentAmount: 0,
    status: 'active',
    deadline: Date.now() + (24 * 60 * 60 * 1000),
    donations: [],
    vaultAddress: VAULT_ADDRESS,
    network: NETWORK,
    networkRPC: RPC_URL,
  },
  'glace': {
    defiId: 'glace',
    title: "Bain dans l'eau glacée",
    goal: 2500,
    currentAmount: 0,
    status: 'active',
    deadline: Date.now() + (48 * 60 * 60 * 1000),
    donations: [],
    vaultAddress: VAULT_ADDRESS,
    network: NETWORK,
    networkRPC: RPC_URL,
  }
};

const DonatePage = () => {
  const [defiId, setDefiId] = useState<string>('');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletAPI, setWalletAPI] = useState<KaspaWalletAPI | null>(null);
  
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

  // Load challenge data
  useEffect(() => {
    if (!defiId) return;

    const loadChallenge = async () => {
      try {
        // Load from mock data (in production: fetch from blockchain/IPFS)
        const data = MOCK_CHALLENGES[defiId];
        if (!data) throw new Error('Challenge not found');
        
        setChallenge(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenge');
        setLoading(false);
      }
    };

    loadChallenge();
  }, [defiId]);

  // WebSocket for real-time updates (optional - could use local storage)
  useEffect(() => {
    if (!defiId) return;

    // For now, just update from local state
    // In production, you could use a decentralized pub/sub or local storage events
    
    return () => {
      // cleanup
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
      setWalletAPI(null);
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

      setWalletAddress(accounts[0]);
      setWalletAPI(api);
      setWalletConnected(true);
      console.log('Wallet connected:', accounts[0]);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      showAlert(message, 'error');
    }
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

      // Send transaction
      if (walletAPI.sendKaspa) {
        const result = await walletAPI.sendKaspa(challenge.vaultAddress, sompiAmount.toString());
        txId = result;
      } else if (walletAPI.sendTransaction) {
        const result = await walletAPI.sendTransaction({
          to: challenge.vaultAddress,
          amount: sompiAmount.toString(),
        });
        txId = typeof result === 'string' ? result : result.txId || null;
      } else {
        throw new Error('Wallet does not support sending transactions');
      }

      if (!txId) {
        throw new Error('No transaction ID returned from wallet');
      }

      console.log('✅ Transaction sent! TX ID:', txId);
      console.log('Transaction submitted to blockchain:', txId);

      // Update local state immediately
      setChallenge(prev => prev ? {
        ...prev,
        currentAmount: prev.currentAmount + selectedAmount,
        donations: [
          ...prev.donations,
          {
            amount: selectedAmount,
            donorAddress: walletAddress,
            timestamp: Date.now(),
            txId: txId!,
          }
        ]
      } : null);

      showAlert(
        `✅ Donation successful! ${selectedAmount.toFixed(2)} KAS sent. TX: ${txId.substring(0, 10)}...`
      );

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
            <div className="wallet-address">{walletAddress}</div>
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
