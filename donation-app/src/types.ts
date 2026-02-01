export interface Challenge {
  defiId: string;
  title: string;
  goal: number;
  currentAmount: number;
  status: 'active' | 'awaiting_validation' | 'validated' | 'refused' | 'expired' | 'refunded';
  deadline: number;
  donations: Donation[];
  vaultAddress: string;
  network: string;
  networkRPC: string;
}

export interface Donation {
  amount: number;
  donorAddress: string;
  timestamp: number;
  txId: string;
}

export interface KaspaWalletAPI {
  requestAccounts: () => Promise<string[]>;
  getAccounts: () => Promise<string[]>;
  connect?: () => Promise<void>;
  sendKaspa?: (toAddress: string, amountSompi: string) => Promise<string>;
  sendTransaction?: (params: {
    to: string;
    amount: string | bigint;
  }) => Promise<{ txId?: string } | string>;
  getBalance?: () => Promise<number | { balance?: number }>;
  request?: (params: { method: string; params?: any }) => Promise<any>;
}

export interface WebSocketMessage {
  type: 'update' | 'challenge_completed' | 'challenge_validated' | 'challenge_refused' | 'challenge_refunded' | 'all_challenges';
  defiId?: string;
  amount?: number;
  goal?: number;
  completed?: boolean;
  donationsCount?: number;
  timeRemaining?: number;
  challenges?: Record<string, Challenge>;
}

export interface DonationResponse {
  success: boolean;
  message: string;
  actualAmount: number;
  currentAmount: number;
  goal: number;
  goalReached: boolean;
}

declare global {
  interface Window {
    kasware?: KaspaWalletAPI;
    kaspa?: KaspaWalletAPI;
  }
}
