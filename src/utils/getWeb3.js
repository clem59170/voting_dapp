import Web3 from "web3";

const getWeb3 = async () => {
    let web3;

    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            // Demande à Metamask l'autorisation de se connecter
            await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            // L'utilisateur a refusé la connexion
            throw new Error("Autorisation refusée");
        }
    } else {
        // Si Metamask n'est pas installé, utilisez un fournisseur par défaut
        const provider = new Web3.providers.HttpProvider(
            "http://localhost:8545"
        );
        web3 = new Web3(provider);
    }

    return web3;
};

export default getWeb3;
