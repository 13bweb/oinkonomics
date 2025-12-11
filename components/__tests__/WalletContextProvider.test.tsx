/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import WalletContextProvider from '../WalletContextProvider';

// We mock jupiverse-kit provider to assert props passed
jest.mock('jupiverse-kit', () => {
  return {
    JupiverseKitProvider: ({ children, ...props }: any) => {
      // expose props for tests via DOM dataset
      // create an element with dataset for assertions
      const wrapper = document.createElement('div');
      if (props && typeof props.autoConnect !== 'undefined') {
        wrapper.dataset.autoconnect = `${props.autoConnect}`;
      }
      if (props && Array.isArray(props.wallets)) {
        wrapper.dataset.walletsCount = `${props.wallets.length}`;
      }
      wrapper.appendChild(document.createElement('span'));
      // For render, return a container that includes children
      return React.createElement('div', { 'data-test-jupiverse': '1', 'data-auto': props.autoConnect }, children);
    },
  };
});

// Provide simple mocks for wallet adapters modules that may be required dynamically
jest.mock('@solana/wallet-adapter-wallets', () => {
  return {
    PhantomWalletAdapter: function Phantom() { this.constructor = { name: 'PhantomWalletAdapter' }; },
    SolflareWalletAdapter: function Solflare() { this.constructor = { name: 'SolflareWalletAdapter' }; },
    TrustWalletAdapter: function Trust() { this.constructor = { name: 'TrustWalletAdapter' }; },
    CoinbaseWalletAdapter: function Coinbase() { this.constructor = { name: 'CoinbaseWalletAdapter' }; },
  };
});

// mock optional packages used via require in component
jest.mock('@solana/wallet-adapter-mobile', () => {
  class MobileWalletAdapterMock {
    constructor() {
      // nothing
    }
  }
  return { MobileWalletAdapter: MobileWalletAdapterMock, default: MobileWalletAdapterMock };
}, { virtual: true });

jest.mock('@solana/wallet-adapter-walletconnect', () => {
  class WalletConnectAdapterMock {
    constructor(_opts: any) {
      // nothing
    }
  }
  return { WalletConnectAdapter: WalletConnectAdapterMock, default: WalletConnectAdapterMock };
}, { virtual: true });

describe('WalletContextProvider', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    // reset
    Object.defineProperty(window.navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('enable autoConnect on desktop by default', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });

    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = ''; // ensure not present
    const { container } = render(
      React.createElement(WalletContextProvider, null, React.createElement('div', null, 'child')),
    );

    // our mocked provider writes attribute data-auto
    const provider = container.querySelector('[data-test-jupiverse]');
    expect(provider).toBeTruthy();
    expect(provider?.getAttribute('data-auto')).toBe('true');
  });

  it('enable autoConnect on mobile when walletConnect project id present or mobile adapter present', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      configurable: true,
    });

    // set project id to simulate walletconnect presence
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'my-project-id';

    const { container } = render(
      React.createElement(WalletContextProvider, null, React.createElement('div', null, 'child')),
    );

    const provider = container.querySelector('[data-test-jupiverse]');
    expect(provider).toBeTruthy();
    expect(provider?.getAttribute('data-auto')).toBe('true');
  });
});
