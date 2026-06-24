import { http, createConfig } from "wagmi"
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors"
import { arcTestnet } from "./chains"


export const config = createConfig({

  chains: [
    arcTestnet
  ],

  connectors: [
    injected(),

    metaMask(),

    coinbaseWallet({
      appName: "ArcFi",
    }),
  ],

  transports: {
    [arcTestnet.id]: http(
      "https://rpc.testnet.arc.network"
    ),
  },
})


declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}