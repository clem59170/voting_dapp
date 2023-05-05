import React, { useEffect, useState } from "react";

const VoterPanel = ({ contract, accounts }) => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [isSessionStarted, setIsSessionStarted] = useState(false);
    const [proposal, setProposal] = useState("");
    const [hasFinishedProposals, setHasFinishedProposals] = useState(false);
    const [proposals, setProposals] = useState([]);
    const [isVotingSessionStarted, setIsVotingSessionStarted] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [userVoteCount, setUserVoteCount] = useState(0);


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
            setUserVoteCount(userVoteCount + 1);
            setHasVoted(true);
        } catch (error) {
            alert(`Erreur lors de l'enregistrement du vote : ${error.message}`);
        }
    };

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            if (contract) {
                const voter = await contract.methods.voters(accounts[0]).call();
                setIsRegistered(voter.isRegistered);
                const sessionStatus = await contract.methods.status().call();
                setIsSessionStarted(sessionStatus === "1");
                const hasFinished = await contract.methods.hasFinishedProposals(accounts[0]).call();
                setHasFinishedProposals(hasFinished);
            }
        };
        checkRegistrationStatus();
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

    useEffect(() => {
        const checkVotingSessionStatus = async () => {
            if (contract) {
                const status = await contract.methods.getStatus().call();
                setIsVotingSessionStarted(status === "3"); // Modifier cette ligne
            }
        };

        checkVotingSessionStatus();
    }, [contract]);

    return (
        <div>
            {isRegistered ? (
                <h1>Tu es sur la liste, tu vas pouvoir voter</h1>
            ) : (
                <h1>Tu n'es pas sur la liste, tu pourras voter si l'admin t'ajoute</h1>
            )}
            {isRegistered && isSessionStarted && (
                <div>
                    <h3>Faire une proposition</h3>
                    <input type="text" value={proposal} onChange={handleProposalChange} />
                    <button onClick={submitProposal} disabled={hasFinishedProposals}>Soumettre la proposition</button>
                    <button onClick={finishProposals}>J'ai fini de faire des propositions</button>
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
                                <button onClick={() => vote(index)}>Voter pour cette proposition</button>
                            </li>
                        ))}
                    </ul>
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
                                <button onClick={() => vote(index)}>Voter pour cette proposition</button>
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
            {isRegistered && isVotingSessionStarted && (
                <div>
                    <h3>Session de vote en cours</h3>
                    {/* Affichez le nombre de votes de l'utilisateur */}
                    <p>Vous avez voté {userVoteCount} fois.</p>
                    <h4>Liste des propositions</h4>
                    <ul>
                        {proposals.map((proposal, index) => (
                            <li key={index}>
                                {proposal.description}{" "}
                                <button onClick={() => vote(index)}>Voter pour cette proposition</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VoterPanel;