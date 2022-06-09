import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";

import { checkMetaMaskInstalled } from "../utils/metamask";
import { Contracts, Web3ContextType } from "./Web3Provider";

export type ContractOption = {
    name: string;
    abi: any;
    address: string;
};

export const useEthers = (
    chainId: number,
    contractOptions: ContractOption[]
): Web3ContextType => {
    const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
    const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isCorrectChain, setIsCorrectChain] = useState<boolean>(true);
    const [isMessageVisible, setIsMessageVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [accountAddress, setAccountAddress] = useState<string>();
    const [contracts, setContracts] = useState<Contracts>({
        viewable: {},
        updatable: {}
    });

    useEffect(() => {
        if (!checkMetaMaskInstalled()) return;

        init();

        window.ethereum.on("accountsChanged", function (accounts: string[]) {
            if (accounts.length) {
                setAccountAddress(accounts[0].toLowerCase());
            } else {
                setAccountAddress("");
                setIsConnected(false);
            }
        });

        window.ethereum.on("networkChanged", function () {
            location.reload();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setViewableContracts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider]);

    useEffect(() => {
        setSignableContracts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signer]);

    useEffect(() => {
        if (!isCorrectChain) setIsMessageVisible(true);
    }, [isCorrectChain]);

    const init = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const accounts = await provider.listAccounts();
        if (accounts.length) {
            setIsConnected(true);
            setAccountAddress(accounts[0].toLowerCase());
        }

        if (Number(window.ethereum.networkVersion) !== chainId) {
            setIsCorrectChain(false);
        }

        const signer = provider.getSigner(0);
        setSigner(signer);
        setIsLoading(false);
    };

    const setViewableContracts = () => {
        if (!provider) return;
        const _contracts: Contracts = { ...contracts };
        contractOptions.forEach((option) => {
            _contracts.viewable[option.name] = new ethers.Contract(
                option.address,
                option.abi,
                provider
            );
        });
        setContracts(_contracts);
    };

    const setSignableContracts = () => {
        if (!signer) return;

        const _contracts: Contracts = { ...contracts };
        contractOptions.forEach((option) => {
            _contracts.updatable[option.name] = new ethers.Contract(
                option.address,
                option.abi,
                signer
            );
        });
    };

    const loadContract = (option: ContractOption) => {
        const _contracts: Contracts = { ...contracts };
        _contracts.updatable[option.name] = new ethers.Contract(
            option.address,
            option.abi,
            signer
        );
        _contracts.viewable[option.name] = new ethers.Contract(
            option.address,
            option.abi,
            provider
        );
        setContracts(_contracts);
    };

    const requestToConnect = async () => {
        if (!provider) throw new Error("Provider is not initialized");

        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length) {
            setAccountAddress(accounts[0].toLowerCase());
            setIsConnected(true);
        } else {
            setIsConnected(false);
        }
    };

    const requestToChangeNetwork = async () => {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x" + chainId.toString(16) }] // chainId must be in hexadecimal numbers
            });
            setIsCorrectChain(true);
        } catch (error) {
            throw error;
        }
    };

    const dismissMessage = useCallback(() => {
        setIsMessageVisible(false);
    }, []);

    return {
        accountAddress,
        provider,
        signer,
        contracts,
        isConnected,
        isCorrectChain,
        isMessageVisible,
        isLoading,
        loadContract,
        requestToConnect,
        requestToChangeNetwork,
        dismissMessage
    };
};
