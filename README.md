# Application de vote décentralisé

Une application de vote décentralisé construite avec un smart contract Ethereum et un front-end React.

## Prérequis

- Node.js et npm installés sur votre machine
- Ganache
- Remix IDE

## Bibliothèques et frameworks utilisés

- React.js
- React Bootstrap
- Web3.js

## Fichiers principaux

- `voting.sol` : le smart contract
- `App.js` : le fichier principal de l'application React
- `index.js` : point d'entrée de l'application
- `adminPanel.js` : composant du panneau d'administration
- `voterPanel.js` : composant du panneau de vote

## Configuration et déploiement

1. Clonez ce dépôt sur votre machine locale.
2. Dans le dossier du projet, exécutez `npm install` pour installer les dépendances.
3. Installez `react-bootstrap` et `bootstrap` en exécutant `npm install react-bootstrap bootstrap`.
4. Importez le smart contract grace au gist : https://gist.github.com/clem59170/9934f8868b68b524b32ced44662b3707
5. Déployez le smart contract sur Ganache en utilisant Remix IDE.
6. Mettez à jour l'adresse du contrat, l'ID du réseau et l'ABI dans le fichier `src/contracts/Voting.json` avec les informations fournies par Remix IDE après le déploiement du contrat :

\```
{
  "networks": {
    "5777": { //ici c'est l'id du réseau que vous pouvez modifier s'il est différent pour vous
      "address": "0x52c58bBE7d44a7086B9466C19642830B330c6613" //ici vous devez forcément changer, l'adresse ne sera pas la m
    }
  }
}
\```
7. Exécutez `npm start` pour démarrer l'application React en local. L'application s'ouvrira dans votre navigateur à l'adresse `http://localhost:3000`.

## Utilisation de l'application

1. Connectez-vous à Metamask et assurez-vous d'être sur le réseau Ganache.
2. Accédez à l'application dans votre navigateur.
3. Utilisez le panneau d'administration en vous connectant via MetaMask au compte qui a servi au déploiement du contrat, pour enregistrer des votants, démarrer une session de propositions, démarrer une session de vote et afficher les résultats.
4. Utilisez le panneau de vote en vous connectant via MetaMask aux comptes enregistrés dans la liste des votants par l'adminstrateur pour soumettre des propositions, voter et afficher les résultats.

### Répartition des tâches entre les coéquipiers 

- Réalisation du smart contract : Clément Rafa
- Setup de l'environnement de travail (Remix, Ganache, web3, react et bootstrap) : Clément Rafa et Antoine Chauvin
- Interaction du smart contract avec le front react : Clément Rafa et Antoine Chauvin
- Desigin de l'UI avec bootstrap : Clément Rafa et Antoine Chauvin
- Réalisation des tests unitaires : Amélie Sabine, Florian Jardez et Ugo Ogliarogo
