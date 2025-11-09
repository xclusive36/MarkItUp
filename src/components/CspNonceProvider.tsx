'use client';

import React, { createContext, useContext } from 'react';

const CspNonceContext = createContext<string | null>(null);

export function CspNonceProvider({
  nonce,
  children,
}: {
  nonce: string | null;
  children: React.ReactNode;
}) {
  return <CspNonceContext.Provider value={nonce}>{children}</CspNonceContext.Provider>;
}

export function useCspNonce() {
  return useContext(CspNonceContext);
}
