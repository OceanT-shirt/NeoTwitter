import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {Web3Provider} from "../src/providers/Web3Provider";
import {ContractOption} from "../src/providers/hooks";

const contractOptions: ContractOption[] = [];

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <Web3Provider chainId={80001} contractOptions={contractOptions}>
        <Component {...pageProps} />
      </Web3Provider>
      );
}

export default MyApp
