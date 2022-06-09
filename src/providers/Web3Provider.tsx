

import { Contract, ethers } from "ethers";
import React, { FC, ReactNode, createContext, useContext } from "react";

import { ContractOption, useEthers } from "./hooks";

export type Contracts = {
    viewable: {
        [key in string]: Contract;
    };
    updatable: {
        [key in string]: Contract;
    };
};

export type Web3ContextType = {
    provider?: ethers.providers.Web3Provider;
    signer?: ethers.providers.JsonRpcSigner;
    accountAddress?: string;
    isConnected: boolean;
    isCorrectChain: boolean;
    isMessageVisible: boolean;
    isLoading: boolean;
    contracts: Contracts;
    loadContract: (option: ContractOption) => void;
    requestToConnect: () => Promise<void>;
    requestToChangeNetwork: () => Promise<void>;
    dismissMessage: () => void;
};

export const Web3Context = createContext<Web3ContextType>({
    isConnected: false,
    isCorrectChain: true,
    contracts: {
        updatable: {},
        viewable: {}
    },
    isMessageVisible: false,
    isLoading: true,
    loadContract: () => {
        throw new Error("loadContract function is not initialized");
    },
    requestToConnect: () => {
        throw new Error("requestToConnect function is not initialized");
    },
    requestToChangeNetwork: () => {
        throw new Error("requestToChangeNetwork function is not initialized");
    },
    dismissMessage: () => {}
});

export const useWeb3 = () => useContext(Web3Context);

type Props = {
    chainId: number;
    contractOptions: ContractOption[];
    children: ReactNode;
};

export const Web3Provider: FC<Props> = ({
                                            children,
                                            chainId,
                                            contractOptions
                                        }) => {
    const web3 = useEthers(chainId, contractOptions);

    return <Web3Context.Provider value={web3}>{children}</Web3Context.Provider>;
};
