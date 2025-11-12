// Contract addresses on Rootstock Mainnet
export const CONTRACTS = {
  OperationsAdmin: '0x942B18A5f78eD612635b6E5FbC49159B5a955f59',
  DcaManager: '0x4d9cbe0f242EE85F7Fa25C77329749381bA998be',
  TropykusDocHandlerMoc: '0xb60024d0030d7876f02BB766E18F0664e81B0856',
  SovrynDocHandlerMoc: '0xA1A752784d4d43778ED23771777B18AE9cb66461',
  TropykusErc20HandlerDex: '0xAfcD7A6F5165F09b049ded06EEC12F5A9E3D09A2',
} as const

// Token addresses on Rootstock Mainnet
export const TOKENS = {
  DOC: '0xe700691dA7b9851F2F35f8b8182c69c53CcaD9Db',
  USDRIF: '0x3A15461d8aE0F0Fb5Fa2629e9DA7D66A794a6e37',
  kDOC: '0x544Eb90e766B405134b3B3F62b6b4C23Fcd5fDa2',
  iSUSD: '0xd8D25f03EBbA94E15Df2eD4d6D38276B595593c1',
  kUSDRIF: '0xDdf3CE45fcf080DF61ee61dac5Ddefef7ED4F46C',
} as const

// Operational addresses
export const ADDRESSES = {
  Swapper: '0x362051AeDA2Df55Ffa6CEFCEd3973d90a0891285',
  FeeCollector: '0xaB8Ae06160b77D604EDEF7ec12D9f12DDeE7123f',
  BtcOracle: '0xe2927A0620b82A66D67F678FC9b826B0E01B1bFD',
} as const

// Handler configurations
export const HANDLERS = [
  {
    name: 'Tropykus DOC Handler',
    address: CONTRACTS.TropykusDocHandlerMoc,
    stablecoin: TOKENS.DOC,
    lendingToken: TOKENS.kDOC,
    protocol: 'tropykus' as const,
  },
  {
    name: 'Sovryn DOC Handler',
    address: CONTRACTS.SovrynDocHandlerMoc,
    stablecoin: TOKENS.DOC,
    lendingToken: TOKENS.iSUSD,
    protocol: 'sovryn' as const,
  },
  {
    name: 'Tropykus USDRIF Handler',
    address: CONTRACTS.TropykusErc20HandlerDex,
    stablecoin: TOKENS.USDRIF,
    lendingToken: TOKENS.kUSDRIF,
    protocol: 'tropykus' as const,
  },
] as const
