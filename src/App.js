import React, { useEffect, useState } from "react";
import getWeb3 from "./utils/getWeb3";
import VotingContract from "./contracts/Voting.json";
import AdminPanel from "./components/AdminPanel";
import VoterPanel from "./components/VoterPanel";
//import "./App.css";

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

//La session de propositions est finie, tout le monde a fini, maintenant on veut que les votants puissent voter !
// Déjà on veut ouvrir la session de vote notamment grace a un bouton. (le smart contract possède une fonction getStatus()
// qui permet de récupérer le status) Chaque votant a une liste avec toute les propositions qui ont été faites par les votants,
// et ils peuvent choisir la proposition qui leur interesse le plus et submit le vote, il ne peuvent voter que pour une proposition bien sur.
// Du cote admin, lui il voit les votes arrivés dynamiquement sous forme de compteur, c'est à dire qu'il voit la liste de toutes les
// propositions avec le nombre de votes à côté qui change dynamiquement en fonction du nombre de vote, il y a également les comptes des personnes
// vottantes à côté de la proposition. Une fois que tout le monde à voté pour la proposition qu'il préfère, l'admin peut cliquer sur un bouton pour
// calculer le résultat, une fois le résultat calculé, il s'affiche pour l'admin mais également pour tous les votants. C'est a ce moment là que les
// votants ont accès au détail du vote sans anonymat, c'est à dire que comme l'admin pendant les votes qui avaient accès aux propositions votées en
// temps réel par quel compte, la ce n'est qu'une fois le vainqueur révélé que tous les votants ont accès a ces memes informations.

