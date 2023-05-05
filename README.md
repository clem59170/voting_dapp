# Charger le smart contract sur remix

Charger ce gist sur remix : https://gist.github.com/clem59170/9934f8868b68b524b32ced44662b3707
Load from gist et vous copier coller le lien.

# Lancer ganache et y connecter MetaMask

Il faut lancer ganache et y connecter metamask sur le port sur lequel ganache sur lance par défaut 

## Compiler Voting.sol

Sur Remix vous pouvez compiler le smart contract

### Déployer le smart contract

Une fois compiler vous pouvez le déployer, en spécifiant utiliser ganache, la vous mettez l'adresse et le port sur lequel ganache est en écoute


### Copier l'id du réseau et l'adresse du smart contract

Lorsque vous déployez le smart contract il se déploie à une adresse particulière, sur remix vous pouvez facilement copier cette adresse, elle se site juste en dessous du bouton déployer. Vous devez coller cette adresse dans le fichier src/contracts/Voting.json à la place de l'adresse qui s'y trouve déjà. Pareil pour l'id du réseau, que vous pouvez trouver aussi sur remix au niveau du choix de l'environnement, normalement il est noté network id {}. Vous devez le copier et le coller a la place de l'id deja présent dans le fichier Voting.json

### npm start

Dans le répertoire src de l'application react, vous pouvez lancer npm start, si des erreurs de compilations surviennent, c'est surement un problème de dépendance, il faudra insaller les librairies qu'il vous manque avec npm (web3 etc)

### Ce que fait cette app react

Vous pouvez vous y identifier avec metamask, si vous vous identifier avec le compte qui a servi au déploiement du contrat, alors vous serez admin vous aurez l'interface admin, sinon l'interface utilisateur.

L'admin peut ajouter des comptes pour qu'ils deviennent votant. Il peut ensuite lancer une session de propositions. Les votants font de propositions et l'admin décide de quand terminer cette session. Une dois terminée il peut lancer la session de vote, les votants votent pour leur proposition préféré, une fois qu'il ont voté ils sont informés des résulats avec le score de chaque proposition. L'admin lui est informé en temps réel du score de chaque proposition. Il peut ensuite décider de terminer la session de vote.
