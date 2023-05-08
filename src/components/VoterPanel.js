import React, { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import Stack from 'react-bootstrap/Stack';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    const [selectedProposalIndex, setSelectedProposalIndex] = useState(null);



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

    const showResult = async () => {
        try {
            const winnerProposalId = await contract.methods.getWinner().call();
            const winnerProposal = proposals[winnerProposalId];
            setWinner(winnerProposal);
        } catch (error) {
            alert(`Erreur lors de l'affichage du résultat : ${error.message}`);
        }
    };
    useEffect(() => {
        const updateStatus = (status) => {
            console.log("status "+status);
            setIsRegisteringVoters(status === "0");
            setIsProposalSessionStarted(status === "1");
            console.log("is proposal session started :"+isProposalSessionStarted);
            setIsProposalSessionEnded(status === "2");
            setIsVotingSessionStarted(status === "3");
            setIsVotingSessionEnded(status === "4");
            setIsVotesTallied(status === "5");
        };

        const fetchStatus = async () => {
            if (contract) {
                const voter = await contract.methods.voters(accounts[0]).call();
                const hasFinished = await contract.methods.hasFinishedProposals(accounts[0]).call();
                const status = await contract.methods.getStatus().call();

                console.log(voter, hasFinished, status);

                setIsRegistered(voter.isRegistered);
                setHasVoted(voter.hasVoted);
                setHasFinishedProposals(hasFinished);
                updateStatus(status);
            }
        };

        const checkStatus = async () => {
            if (contract) {
                const statusSubscription = contract.events.WorkflowStatusChange({}, (error, evt) => {
                    if (error) {
                        alert("Erreur lors du changement de status");
                    } else {
                        const status = evt.returnValues.newStatus;
                        updateStatus(status);
                    }
                });

                const voterRegisteredSubscription = contract.events.VoterRegistered({ filter: { voterAddress: accounts[0] } }, () => {
                    setIsRegistered(true);
                });

                const voterRemovedSubscription = contract.events.VoterRemoved({ filter: { voter: accounts[0] } }, () => {
                    setIsRegistered(false);
                });

                const votedSubscription = contract.events.Voted({}, (error, evt) => {
                    if (!error) {
                        const votedVoter = evt.returnValues.voter;
                        const votedProposalId = evt.returnValues.proposalId;

                        // Mettre à jour hasVoted si l'utilisateur actuel a voté
                        if (accounts[0] === votedVoter) {
                            setHasVoted(true);
                        }

                        // Mettre à jour les résultats des votes
                        setProposals(prevProposals => prevProposals.map((proposal, index) => {
                            if (index === parseInt(votedProposalId, 10)) {
                                return { ...proposal, voteCount: parseInt(proposal.voteCount, 10) + 1 };
                            }
                            return proposal;
                        }));
                    }
                });

                return () => {
                    statusSubscription.unsubscribe();
                    voterRegisteredSubscription.unsubscribe();
                    voterRemovedSubscription.unsubscribe();
                    votedSubscription.unsubscribe();
                };
            }
        };

        fetchStatus();
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

    useEffect(() => {
        console.log("is registered:", isRegistered, "is proposal session started:", isProposalSessionStarted);
    }, [isRegistered, isProposalSessionStarted]);


    return (
        <Container>
            {isRegistered && isProposalSessionStarted && (
                <Card>
                    <Card.Header>Faire une proposition</Card.Header>
                    <Card.Body>
                        <Stack direction="horizontal" gap={3}>
                            <Form.Control
                                type="text"
                                value={proposal}
                                onChange={handleProposalChange}
                            />
                            <Button
                                onClick={submitProposal}
                                disabled={hasFinishedProposals}
                            >
                                Soumettre la proposition
                            </Button>
                        </Stack>
                        <Button
                            onClick={finishProposals}
                            disabled={hasFinishedProposals}
                        >
                            J'ai fini de faire des propositions
                        </Button>
                    </Card.Body>
                </Card>
            )}
            {isRegistered && isVotingSessionStarted && (
                <Card>
                    <Card.Header>Session de vote en cours</Card.Header>
                    <Card.Body>
                        <Card.Title>Liste des propositions</Card.Title>
                        <ListGroup>
                            {proposals.map((proposal, index) => (
                                <ListGroup.Item key={index}>
                                    <Form.Check
                                        type="radio"
                                        name="proposal"
                                        label={proposal.description}
                                        onChange={() => setSelectedProposalIndex(index)}
                                        checked={selectedProposalIndex === index}
                                        disabled={hasVoted}
                                    />
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <Button
                            disabled={hasVoted || selectedProposalIndex === null}
                            onClick={() => vote(selectedProposalIndex)}
                        >
                            Voter
                        </Button>
                    </Card.Body>
                </Card>
            )}
            {hasVoted && (
                <Card>
                    <Card.Header>Résultats des votes</Card.Header>
                    <Card.Body>
                        <Card.Title>Liste des propositions</Card.Title>
                        <ListGroup>
                            {proposals.map((proposal, index) => (
                                <ListGroup.Item key={index}>
                                    {proposal.description} ({proposal.voteCount} votes)
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}
            {isRegistered && isVotingSessionStarted && hasVoted && (
                <Card>
                    <Card.Header>Session de vote en cours</Card.Header>
                    <Card.Body>
                        <Alert variant="success">Vous avez voté !</Alert>
                    </Card.Body>
                </Card>
            )}
            {isVotesTallied && isRegistered && (
                <Card>
                    <Card.Header>Afficher le résultat</Card.Header>
                    <Card.Body>
                        <Button onClick={showResult}>Afficher le résultat</Button>
                        {winner && (
                            <p>
                                La proposition gagnante est : {winner.description} avec{" "}
                                {winner.voteCount} votes.
                            </p>
                        )}
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default VoterPanel;