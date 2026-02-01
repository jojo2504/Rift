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

  // ─── LOGIC (UNTOUCHED) ────────────────────────────────────────────────────

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

  useEffect(() => {
    if (!defiId) return;
    const loadChallenge = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/challenge/${defiId}`);
        if (!response.ok) throw new Error('Challenge not found');
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

  useEffect(() => {
    if (!defiId) return;
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => { console.log('Connected to server WebSocket'); };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'challenge_update' && data.defiId === defiId) {
          setChallenge(prev => prev ? { ...prev, currentAmount: data.currentAmount, donations: data.donations, status: data.status } : null);
        } else if (data.type === 'all_challenges' && data.challenges[defiId]) {
          const challengeData = data.challenges[defiId];
          setChallenge(prev => prev ? { ...prev, currentAmount: challengeData.currentAmount, donations: challengeData.donations, status: challengeData.status } : null);
        }
      } catch (err) { console.error('WebSocket message error:', err); }
    };
    ws.onerror = (error) => { console.error('WebSocket error:', error); };
    return () => { ws.close(); };
  }, [defiId]);

  useEffect(() => {
    if (!challenge) return;
    const updateCountdown = () => {
      const remaining = challenge.deadline - Date.now();
      if (remaining <= 0) { setCountdown('⏰ Expired'); return; }
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${hours}h ${minutes}m`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [challenge]);

  const showAlert = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const connectWallet = async () => {
    if (walletConnected) {
      setWalletConnected(false); setWalletAddress(''); setWalletAccounts([]);
      setWalletAPI(null); setShowAccountSelector(false);
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      let api: KaspaWalletAPI | null = null;
      if (window.kasware) { api = window.kasware; }
      else if (window.kaspa) { api = window.kaspa; }
      else { throw new Error('No Kaspa wallet extension found. Please install Kasware or Kaspium.'); }
      let accounts: string[] = [];
      if (api.requestAccounts) { accounts = await api.requestAccounts(); }
      else if (api.connect && api.getAccounts) { await api.connect(); accounts = await api.getAccounts(); }
      if (!accounts || accounts.length === 0) throw new Error('No accounts found in wallet');
      setWalletAccounts(accounts); setWalletAddress(accounts[0]);
      setWalletAPI(api); setWalletConnected(true);
      console.log('Wallet connected:', accounts[0]);
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Failed to connect wallet', 'error');
    }
  };

  const switchAccount = (account: string) => {
    setWalletAddress(account); setShowAccountSelector(false);
    console.log('Switched to account:', account);
  };

  const handleAmountSelect = (amount: number) => { setSelectedAmount(amount); setCustomAmount(''); };
  const handleCustomAmountChange = (value: string) => { setCustomAmount(value); setSelectedAmount(parseFloat(value) || 0); };

  const handleDonate = async () => {
    if (!walletConnected || !walletAPI || !challenge || selectedAmount <= 0) return;
    setDonating(true);
    try {
      const sompiAmount = BigInt(Math.floor(selectedAmount * 100000000));
      console.log('Initiating donation:', { amount: selectedAmount, sompi: sompiAmount.toString(), to: challenge.vaultAddress });
      let txId: string | null = null;
      let txData: any = null;
      if (walletAPI.sendKaspa) {
        const result: unknown = await walletAPI.sendKaspa(challenge.vaultAddress, sompiAmount.toString());
        if (typeof result === 'string') { txId = result; }
        else if (result && typeof result === 'object') { txData = result; txId = (result as Record<string, any>).id || (result as Record<string, any>).txId || null; }
      } else if (walletAPI.sendTransaction) {
        const result: unknown = await walletAPI.sendTransaction({ to: challenge.vaultAddress, amount: sompiAmount.toString() });
        if (typeof result === 'string') { txId = result; }
        else if (result && typeof result === 'object') { txData = result; txId = (result as Record<string, any>).id || (result as Record<string, any>).txId || null; }
      } else { throw new Error('Wallet does not support sending transactions'); }
      if (!txId) throw new Error('No transaction ID returned from wallet');
      console.log('✅ Transaction sent! TX ID:', txId);
      if (!txData) { console.log('⏳ Waiting for blockchain to index transaction...'); await new Promise((resolve) => setTimeout(resolve, 3000)); }
      try {
        const submitResponse = await fetch(`${SERVER_URL}/api/donate/${defiId}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txId, txData, donorAddress: walletAddress, intendedAmount: selectedAmount }),
        });
        if (!submitResponse.ok) { const errorData = await submitResponse.json(); throw new Error(errorData.error || 'Failed to register donation with server'); }
        const result = await submitResponse.json();
        console.log('Server confirmed donation:', result);
        showAlert(`✅ Donation successful! ${selectedAmount.toFixed(2)} KAS sent. TX: ${txId.substring(0, 10)}...`);
      } catch (serverErr) {
        console.error('Server submission error:', serverErr);
        showAlert(`⚠️ Transaction sent but server registration failed: ${serverErr instanceof Error ? serverErr.message : 'Unknown error'}`, 'error');
      }
      setSelectedAmount(0); setCustomAmount('');
    } catch (err) {
      console.error('Donation error:', err);
      showAlert(err instanceof Error ? err.message : 'Donation failed', 'error');
    } finally { setDonating(false); }
  };

  // ─── END LOGIC ────────────────────────────────────────────────────────────

  const progress = challenge ? Math.min((challenge.currentAmount / challenge.goal) * 100, 100) : 0;
  const goalReached = challenge ? challenge.currentAmount >= challenge.goal : false;
  const canDonate = !goalReached && challenge?.status === 'active' && selectedAmount > 0;

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dp-root">
        <div className="dp-bg">
          <div className="dp-bg__orb dp-bg__orb--1" />
          <div className="dp-bg__orb dp-bg__orb--2" />
          <div className="dp-bg__orb dp-bg__orb--3" />
        </div>
        <div className="dp-centered">
          <div className="dp-spinner dp-spinner--lg" />
          <p className="dp-loader-text">Loading challenge…</p>
        </div>
      </div>
    );
  }

  // ─── ERROR ────────────────────────────────────────────────────────────────
  if (error || !challenge) {
    return (
      <div className="dp-root">
        <div className="dp-bg">
          <div className="dp-bg__orb dp-bg__orb--1" />
          <div className="dp-bg__orb dp-bg__orb--2" />
          <div className="dp-bg__orb dp-bg__orb--3" />
        </div>
        <div className="dp-centered">
          <div className="dp-card">
            <FaExclamationCircle style={{ fontSize: 48, color: '#ef4444', marginBottom: 16 }} />
            <h2 style={{ color: '#fff', margin: '0 0 8px' }}>Oops!</h2>
            <p style={{ color: '#9ca3af', margin: 0 }}>{error || 'Challenge not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN ─────────────────────────────────────────────────────────────────
  return (
    <div className="dp-root">
      {/* Animated background */}
      <div className="dp-bg">
        <div className="dp-bg__orb dp-bg__orb--1" />
        <div className="dp-bg__orb dp-bg__orb--2" />
        <div className="dp-bg__orb dp-bg__orb--3" />
      </div>

      {/* Toast */}
      {alert && (
        <div className={`dp-toast dp-toast--${alert.type}`}>
          <span className="dp-toast__dot" />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Scrollable content */}
      <div className="dp-scroll">
        <div className="dp-layout">

          {/* Header */}
          <div className="dp-header" style={{ animationDelay: '0s' }}>
            <div className={`dp-badge dp-badge--${challenge.status === 'active' ? 'live' : 'idle'}`}>
              <span className="dp-badge__dot" />
              {challenge.status === 'active' ? 'Live' : challenge.status}
            </div>
            <h1 className="dp-header__title">Support the Challenge</h1>
            <p className="dp-header__subtitle">{challenge.title}</p>
          </div>

          {/* Network warning */}
          <div className="dp-card dp-card--warn" style={{ animationDelay: '0.05s' }}>
            <span>⚠️</span>
            <span>Make sure your wallet is connected to <strong>{challenge.network}</strong></span>
          </div>

          {/* Progress */}
          <div className="dp-card" style={{ animationDelay: '0.1s' }}>
            <div className="dp-progress__top">
              <span className="dp-progress__label">Funded</span>
              <span className="dp-progress__pct">{progress.toFixed(0)}%</span>
            </div>
            <div className="dp-progress__track">
              <div className="dp-progress__fill" style={{ width: `${progress}%` }}>
                <div className="dp-progress__shine" />
              </div>
            </div>
            <div className="dp-progress__bottom">
              <span className="dp-progress__current">{challenge.currentAmount.toFixed(2)} <em>KAS</em></span>
              <span className="dp-progress__goal">/ {challenge.goal} KAS</span>
            </div>
            <div className="dp-progress__meta">
              <span className="dp-progress__meta-item"><FaClock /> {countdown}</span>
              <span className="dp-progress__meta-item">{challenge.donations.length} donors</span>
            </div>
          </div>

          {/* Wallet */}
          <div className="dp-card" style={{ animationDelay: '0.15s' }}>
            <div className="dp-wallet__row">
              <div className={`dp-wallet__status ${walletConnected ? 'dp-wallet__status--on' : ''}`}>
                <FaWallet />
                <span>{walletConnected ? 'Connected' : 'Not connected'}</span>
              </div>
              <button
                className={`dp-btn ${walletConnected ? 'dp-btn--ghost' : 'dp-btn--primary'}`}
                onClick={connectWallet}
              >
                <FaWallet /> {walletConnected ? 'Disconnect' : 'Connect Wallet'}
              </button>
            </div>

            {walletAddress && (
              <div className="dp-wallet__detail">
                <div className="dp-wallet__addr">
                  <span className="dp-wallet__addr-dot" />
                  {walletAddress.substring(0, 24)}…{walletAddress.slice(-8)}
                </div>

                {walletAccounts.length > 1 && (
                  <div className="dp-wallet__switcher">
                    <button className="dp-wallet__switch-btn" onClick={() => setShowAccountSelector(!showAccountSelector)}>
                      🔄 Switch account · {walletAccounts.length} available
                    </button>
                    {showAccountSelector && (
                      <div className="dp-wallet__dropdown">
                        {walletAccounts.map((account) => (
                          <button
                            key={account}
                            className={`dp-wallet__drop-item ${account === walletAddress ? 'dp-wallet__drop-item--active' : ''}`}
                            onClick={() => switchAccount(account)}
                          >
                            {account === walletAddress && <span className="dp-wallet__check">✓</span>}
                            {account.substring(0, 24)}…{account.slice(-8)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amounts */}
          {walletConnected && (
            <div className="dp-card" style={{ animationDelay: '0.2s' }}>
              <h3 className="dp-card__heading">Select Amount</h3>
              <div className="dp-amounts">
                {[10, 25, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    className={`dp-amount ${selectedAmount === amount && !customAmount ? 'dp-amount--active' : ''}`}
                    onClick={() => handleAmountSelect(amount)}
                  >
                    {amount} <span className="dp-amount__unit">KAS</span>
                  </button>
                ))}
              </div>
              <input
                type="number"
                className="dp-input"
                placeholder="Or enter custom amount…"
                min="1"
                step="0.01"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
              />
              <button
                className={`dp-btn dp-btn--cta ${canDonate && !donating ? 'dp-btn--cta--active' : ''}`}
                onClick={handleDonate}
                disabled={!canDonate || donating}
              >
                {donating ? (
                  <><span className="dp-spinner dp-spinner--sm" /> Processing…</>
                ) : goalReached ? (
                  <>🎯 Goal Reached!</>
                ) : selectedAmount > 0 ? (
                  <><IoRocketSharp /> Donate {selectedAmount} KAS</>
                ) : (
                  'Select an amount to continue'
                )}
              </button>
            </div>
          )}

          {/* How it works */}
          <div className="dp-card dp-card--how" style={{ animationDelay: '0.25s' }}>
            <div className="dp-how__head">
              <FaLock /> How it works
            </div>
            <ol className="dp-how__list">
              <li>Connect your Kaspa testnet wallet (Kasware / Kaspium)</li>
              <li>Choose your donation amount</li>
              <li>Sign the transaction — funds go directly to the vault</li>
              <li>Verified on-chain, no middleman</li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DonatePage;