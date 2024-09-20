// components/ConnectWallet.tsx
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export function ConnectWallet() {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  return isConnected ? (
    <button onClick={() => disconnect()}>Disconnect</button>
  ) : (
    <button onClick={() => connect()}>Connect Wallet</button>
  );
}
