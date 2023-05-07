import React, { useEffect, useState } from "react";

const VoterPanel = ({ contract, accounts }) => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [isProposalSessionStarted, setIsProposalSessionStarted] = useState(false);
    const [isProposalSessionEnded, setIsProposalSessionEnded] = useState(false);
    const [proposal, setProposal] = useState("");
    const [hasFinishedProposals, setHasFinishedProposals] = useState(false);
    const [proposals, setProposals] = useState([]);
    const [isVotingSessionStarted, setIsVotingSessionStarted] = useState(false);
    const [isVotingSessionEnded, setIsVotingSessionEnded] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [isVotesTallied, setIsVotesTallied] = useState(false);
    const [isRegisteringVoters, setIsRegisteringVoters] = useState(false)
    const [winner, setWinner] = useState(null);



    const handleProposalChange = (event) => {
        setProposal(event.target.value);
    };

    const submitProposal = async () => {
        try {
            await contract.methods.registerProposal(proposal).send({ from: accounts[0] });
            alert("Proposition soumise avec succès !");
            setProposal("");
        } catch (error) {
            alert(`Erreur lors de la soumission de la proposition : ${error.message}`);
        }
    };

    const finishProposals = async () => {
        try {
            await contract.methods.finishProposals().send({ from: accounts[0] });
            alert("Vos propositions sont terminées !");
            setHasFinishedProposals(true);
        } catch (error) {
            alert(`Erreur lors de la fin des propositions : ${error.message}`);
        }
    };

    const vote = async (proposalIndex) => {
        try {
            await contract.methods.vote(proposalIndex).send({ from: accounts[0] });
            alert("Vote enregistré avec succès !");
            setHasVoted(true);
        } catch (error) {
            alert(`Erreur lors de l'enregistrement du vote : ${error.message}`);
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
        const checkStatus = async () => {
            if (contract) {
                const voter = await contract.methods.voters(accounts[0]).call();
                const hasFinished = await contract.methods.hasFinishedProposals(accounts[0]).call();
                const status = await contract.methods.getStatus().call();

                setIsRegistered(voter.isRegistered);
                setHasVoted(voter.hasVoted);
                setHasFinishedProposals(hasFinished);
                setIsRegisteringVoters(status === "0");
                setIsProposalSessionStarted(status === "1");
                setIsProposalSessionEnded(status === "2");
                setIsVotingSessionStarted(status === "3");
                setIsVotingSessionEnded(status=== "4");
                setIsVotesTallied(status === "5");
            }
        };
        checkStatus();
    }, [contract, accounts]);

    useEffect(() => {
        const getProposals = async () => {
            if (contract) {
                const fetchedProposals = await contract.methods.getProposals().call();
                setProposals(fetchedProposals);
            }
        };

        getProposals();
    }, [contract]);

    return (
        <div>
            {isRegisteringVoters ? (
                isRegistered ? (
                    <h1>Tu es sur la liste, tu vas pouvoir voter</h1>
                ) : (
                    <h1>Tu n'es pas sur la liste, tu pourras voter si l'admin t'ajoute</h1>
                )
            ) : (
                <h1></h1>
            )}
            {isRegistered && isProposalSessionStarted && (
                <div>
                    <h3>Faire une proposition</h3>
                    <input type="text" value={proposal} onChange={handleProposalChange} />
                    <button onClick={submitProposal} disabled={hasFinishedProposals}>Soumettre la proposition</button>
                    <button onClick={finishProposals} disabled={hasFinishedProposals}>J'ai fini de faire des propositions</button>
                </div>
            )}
            {isRegistered && isVotingSessionStarted && (
                <div>
                    <h3>Session de vote en cours</h3>
                    <h4>Liste des propositions</h4>
                    <ul>
                        {proposals.map((proposal, index) => (
                            <li key={index}>
                                {proposal.description}{" "}
                                <button disabled={hasVoted} onClick={() => vote(index)}>Voter pour cette proposition</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {hasVoted && (
                <div>
                    <h3>Résultats des votes</h3>
                    <h4>Liste des propositions</h4>
                    <ul>
                        {proposals.map((proposal, index) => (
                            <li key={index}>
                                {proposal.description} ({proposal.voteCount} votes)
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {isRegistered && isVotingSessionStarted && hasVoted && (
                <div>
                    <h3>Session de vote en cours</h3>
                    <p>Vous avez voté !</p>
                </div>
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

export default VoterPanel;