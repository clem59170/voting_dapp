import React, { useEffect, useState } from "react";
import getWeb3 from "./utils/getWeb3";
import VotingContract from "./contracts/Voting.json";
import AdminPanel from "./components/AdminPanel";
import VoterPanel from "./components/VoterPanel";
import "./App.css";

const App = () => {
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [contract, setContract] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (contract && accounts[0]) {
                const adminAddress = await contract.methods.owner().call();
                setIsAdmin(accounts[0].toLowerCase() === adminAddress.toLowerCase());
            }
        };

        checkAdminStatus();
    }, [contract, accounts]);

    const init = async () => {
        const web3Instance = await getWeb3();
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = VotingContract.networks[networkId];

        if (!deployedNetwork) {
            alert("Le contrat n'est pas déployé sur le réseau actuel");
            return;
        }

        const instance = new web3Instance.eth.Contract(
            VotingContract.abi,
            deployedNetwork && deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccounts(accounts);
        setContract(instance);
    };


    const connectMetamask = async () => {
        await init();
    };

    return (
        <div className="App">
            {!web3 ? (
                <button onClick={connectMetamask}>Connecter Metamask</button>
            ) : isAdmin ? (
                <AdminPanel contract={contract} accounts={accounts}/>
            ) : (
                <VoterPanel contract={contract} accounts={accounts}/>
            )}
        </div>
    );
};

export default App;
