import React, {useEffect, useState} from "react";

const AdminPanel = ({ contract, accounts }) => {
    const [voterAddress, setVoterAddress] = useState("");
    const [voterList, setVoterList] = useState([]);
    const [isProposalSessionStarted, setIsProposalSessionStarted] = useState(false);
    const [isFetchingVoters, setIsFetchingVoters] = useState(false);
    const [proposals, setProposals] = useState([]);
    const [finishedVoters, setFinishedVoters] = useState(0);
    const [isVotingSessionStarted, setIsVotingSessionStarted] = useState(false);
    const [isProposalSessionEnded, setIsProposalSessionEnded] = useState(false);
    const [votes, setVotes] = useState([]);
    const [hasEveryoneVoted, setHasEveryoneVoted] = useState(false);
    const [winner, setWinner] = useState(null);
    const [isVotingSessionEnded, setIsVotingSessionEnded] = useState(false)
    const [isVotesTallied, setIsVotesTallied] = useState(false)
    const [isRegisteringVoters, setIsRegisteringVoters] = useState(false)



    const endSessionWithConfirmation = async () => {
        setIsProposalSessionEnded(true)
        if (finishedVoters < voterList.length) {
            if (
                window.confirm(
                    "Tout le monde n'a pas encore fait de proposition. Voulez-vous vraiment terminer la session ?"
                )
            ) {
                endSession();
            }
        } else {
            endSession();
        }
    };

    const handleVoterAddressChange = (event) => {
        setVoterAddress(event.target.value);
    };

    const registerVoter = async () => {
        try {
            await contract.methods.registerVoter(voterAddress).send({ from: accounts[0] });
            console.log(contract);
            console.log(voterList.length);
            alert("Votant enregistré avec succès !");
            setVoterAddress("");

            // Rafraîchir la liste des votants
            const voterAddresses = await contract.methods.getVoters().call();
            setVoterList(voterAddresses);
        } catch (error) {
            alert(`Erreur lors de l'enregistrement du votant : ${error.message}`);
        }
    };


    const removeVoter = async (voterAddress) => {
        try {
            await contract.methods.removeVoter(voterAddress).send({ from: accounts[0] });
            const updatedVoterList = voterList.filter((address) => address !== voterAddress);
            setVoterList(updatedVoterList);
            alert("Votant supprimé avec succès !");
        } catch (error) {
            alert(`Erreur lors de la suppression du votant : ${error.message}`);
        }
    };

    const startSession = async () => {
        try {
            await contract.methods.startProposalsRegistration().send({ from: accounts[0] });
            setIsProposalSessionStarted(true);
        } catch (error) {
            alert(`Erreur lors du démarrage de la session : ${error.message}`);
        }
    };

    const endSession = async () => {
        try {
            await contract.methods.endProposalsRegistration().send({ from: accounts[0] });
            setIsProposalSessionStarted(false);
        } catch (error) {
            alert(`Erreur lors de la fermeture de la session : ${error.message}`);
        }
    };

    const startVotingSession = async () => {
        try {
            await contract.methods.startVotingSession().send({ from: accounts[0] });
            setIsVotingSessionStarted(true);
        } catch (error) {
            alert(`Erreur lors du démarrage de la session de vote : ${error.message}`);
        }
    };

    const tallyVotes = async () => {
        try {
            await contract.methods.tallyVotes().send({from: accounts[0]});
            setIsVotesTallied(true);
        } catch (error) {
            alert(`Erreur lors du décompte des votes : ${error.message}`);
        }
    };

    const getVotes = async () => {
        if (contract) {
            const fetchedVotes = [];
            for (let i = 0; i < proposals.length; i++) {
                const count = await contract.methods.getVotesForProposal(i).call();
                fetchedVotes.push(count);
            }
            setVotes(fetchedVotes);
        }
    };

    const endVotingSession = async () => {
        try {
            const currentStatus = await contract.methods.getStatus().call();
            if (currentStatus !== "3") {
                alert("La session de vote n'a pas encore commencé.");
                return;
            }

            await contract.methods.endVotingSession().send({ from: accounts[0] });
            const updatedStatus = await contract.methods.getStatus().call();
            if (updatedStatus === "4") {
                alert("Session de vote terminée !");
            } else {
                alert("Erreur lors de la mise à jour du statut.");
            }
        } catch (error) {
            alert(`Erreur lors de la fin de la session de vote : ${error.message}`);
        }
    };

    const showResult = async () => {
        await tallyVotes();
        try {
            const winnerProposalId = await contract.methods.getWinner().call();
            const winnerProposal = proposals[winnerProposalId];
            setWinner(winnerProposal);
        } catch (error) {
            alert(`Erreur lors de l'affichage du résultat : ${error.message}`);
        }
    };



    useEffect(() => {
        const getVoterList = async () => {
            if (contract) {
                setIsFetchingVoters(true);
                const voterAddresses = await contract.methods.getVoters().call();
                setVoterList(voterAddresses);
                setIsFetchingVoters(false);
            }
        };

        getVoterList();
    }, [contract]);

    useEffect(() => {
        const getProposals = async () => {
            if (contract) {
                const fetchedProposals = await contract.methods.getProposals().call();
                setProposals(fetchedProposals);
            }
        };

        getProposals();
    }, [contract]);

    useEffect(() => {
        const checkStatus = async () => {
            if (contract) {
                const status = await contract.methods.getStatus().call();
                setIsRegisteringVoters(status === "0");
                setIsProposalSessionStarted(status === "1");
                setIsProposalSessionEnded(status === "2");
                setIsVotingSessionStarted(status === "3");
                setIsVotingSessionEnded(status=== "4");
                setIsVotesTallied(status === "5");
            }
        };

        checkStatus();
    }, [contract]);

    useEffect(() => {
        const countFinishedVoters = async () => {
            if (contract && voterList.length > 0) {
                let count = 0;
                for (const voter of voterList) {
                    const hasFinished = await contract.methods.hasFinishedProposals(voter).call();
                    if (hasFinished) {
                        count++;
                    }
                }
                setFinishedVoters(count);
            }
        };

        countFinishedVoters();
    }, [contract, voterList]);

    useEffect(() => {
        const getProposals = async () => {
            if (contract) {
                const fetchedProposals = await contract.methods.getProposals().call();
                setProposals(fetchedProposals);
            }
        };

        getProposals();
    }, [contract]);

    useEffect(() => {
        getVotes();
    }, [proposals]);

    useEffect(() => {
        const checkIfEveryoneVoted = async () => {
            if (contract) {
                const everyoneVoted = await contract.methods.hasEveryoneVoted().call();
                setHasEveryoneVoted(everyoneVoted);
            }
        };

        checkIfEveryoneVoted();
    }, [contract]);


    return (
        <div>
            <h2>Panel Admin</h2>
            {isRegisteringVoters && (
            <div>
                <h3>Enregistrer un votant</h3>
                <input type="text" value={voterAddress} onChange={handleVoterAddressChange} />
                <button onClick={registerVoter}>Enregistrer</button>
            </div>
            )}
            <div>
                <h3>Liste des votants</h3>
                <ul>
                    {voterList.map((address) => (
                        <li key={address}>
                            {address}{" "}
                            {isRegisteringVoters && (
                                <button onClick={() => removeVoter(address)}>Supprimer</button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {voterList.length >= 2 && isRegisteringVoters && !isFetchingVoters && !isProposalSessionStarted && (
                <div>
                    <h3>Démarrer une session de de propositions</h3>
                    <button onClick={startSession}>Démarrer</button>
                </div>
            )}
            {isProposalSessionStarted && (
                <div>
                    <h3>Session de proposition en cours</h3>
                    <h4>Liste des propositions</h4>
                    <ul>
                        {proposals.map((proposal, index) => (
                            <li key={index}>{proposal.description}</li>
                        ))}
                    </ul>
                    {finishedVoters === voterList.length && (
                        <p>Tout le monde a fini de faire des propositions !</p>
                    )}
                    <button onClick={endSessionWithConfirmation} disabled={proposals.length < 2}>
                        Terminer la session
                    </button>
                </div>
            )}
            {isProposalSessionEnded && (
                <div>
                    <h3>Ouvrir la session de vote</h3>
                    <button onClick={startVotingSession}>Ouvrir la session</button>
                </div>
            )}
            {isVotingSessionStarted && (
                <div>
                    <h3>Session de vote en cours</h3>
                    <h4>Liste des propositions</h4>
                    <ul>
                        {proposals.map((proposal, index) => (
                            <li key={index}>
                                {proposal.description} ({votes[index]} votes){" "}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {isVotingSessionStarted && hasEveryoneVoted && (
                <button onClick={endVotingSession}>Terminer la session de vote</button>
            )}
            {isVotesTallied && (
                <div>
                    <h3>Afficher le résultat</h3>
                    <button onClick={showResult}>Afficher le résultat</button>
                    {winner && (
                        <p>
                            La proposition gagnante est : {winner.description} avec{" "}
                            {winner.voteCount} votes.
                        </p>
                    )}
                </div>
            )}
        </div>
    );


};

export default AdminPanel;
