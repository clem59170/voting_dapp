import React, {useEffect, useState} from "react";
import {Container, Card, Button, Form, ListGroup, Stack} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


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
            //setIsProposalSessionStarted(true);
        } catch (error) {
            alert(`Erreur lors du démarrage de la session : ${error.message}`);
        }
    };

    const endSession = async () => {
        try {
            await contract.methods.endProposalsRegistration().send({ from: accounts[0] });
            //setIsProposalSessionEnded(true);
        } catch (error) {
            alert(`Erreur lors de la fermeture de la session : ${error.message}`);
        }
    };

    const startVotingSession = async () => {
        try {
            await contract.methods.startVotingSession().send({ from: accounts[0] });
            //setIsVotingSessionStarted(true);
        } catch (error) {
            alert(`Erreur lors du démarrage de la session de vote : ${error.message}`);
        }
    };

    const tallyVotes = async () => {
        try {
            await contract.methods.tallyVotes().send({from: accounts[0]});
            // setIsVotesTallied(true);
        } catch (error) {
            alert(`Erreur lors du décompte des votes : ${error.message}`);
        }
    };

    const resetStatus = async () => {
        try {
            await contract.methods.resetStatus().send({from: accounts[0]});
            // setIsRegisteringVoters(true);
            // setIsVotingSessionEnded(false);
            // setIsProposalSessionEnded(false);
            // setIsVotingSessionStarted(false);
            // setIsVotesTallied(false);
            // setIsProposalSessionStarted(false);
        } catch (error) {
            alert(`Erreur lors du reset du status : ${error.message}`);
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
            //await tallyVotes();
            const currentStatus = await contract.methods.getStatus().call();
            if (currentStatus !== "3") {
                alert("La session de vote n'a pas encore commencé.");
                return;
            }

            await contract.methods.endVotingSession().send({ from: accounts[0] });
            //setIsVotingSessionEnded(true)
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
        const fetchStatus = async () => {
            if (contract) {
                const currentStatus = await contract.methods.getStatus().call();
                updateStatus(currentStatus);
            }
        };

        const updateStatus = (status) => {
            setIsRegisteringVoters(status === "0");
            setIsProposalSessionStarted(status === "1");
            setIsProposalSessionEnded(status === "2");
            setIsVotingSessionStarted(status === "3");
            setIsVotingSessionEnded(status === "4");
            setIsVotesTallied(status === "5");
        };

        const checkStatus = async () => {
            if (contract) {
                const subscription = contract.events.WorkflowStatusChange({}, (error, evt) => {
                    if (error) {
                        alert("Erreur lors du changement de status");
                    } else {
                        const status = evt.returnValues.newStatus;
                        updateStatus(status);
                    }
                });
                return () => {
                    subscription.unsubscribe();
                };
            }
        };

        fetchStatus();
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
        <Container>
            <h2>Panel Admin</h2>
            <Card>
                <Card.Header>Enregistrer un votant</Card.Header>
                {isRegisteringVoters && (
                    <Card.Body>
                        <Stack direction="horizontal" gap={3}>
                            <Form.Control
                                type="text"
                                value={voterAddress}
                                onChange={handleVoterAddressChange}
                            />
                            <Button onClick={registerVoter}>Enregistrer</Button>
                        </Stack>
                    </Card.Body>
                )}

                <Card.Body>
                    <Card.Title>Liste des votants</Card.Title>
                    <ListGroup>
                        {voterList.map((address) => (
                            <ListGroup.Item key={address}>
                                {address}{" "}
                                {isRegisteringVoters && (
                                    <Button
                                        variant="danger"
                                        onClick={() => removeVoter(address)}
                                        size="sm"
                                    >
                                        Supprimer
                                    </Button>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
                {voterList.length >= 2 &&
                    isRegisteringVoters &&
                    !isFetchingVoters &&
                    !isProposalSessionStarted && (
                        <Card.Body>
                            <Card.Title>Démarrer une session de propositions</Card.Title>
                            <Button disabled={isProposalSessionStarted} onClick={startSession}>Démarrer</Button>
                        </Card.Body>
                    )}
                {isProposalSessionStarted && (
                    <Card.Body>
                        <Card.Title>Session de proposition en cours</Card.Title>
                        <Card.Subtitle className="mb-2">
                            Liste des propositions
                        </Card.Subtitle>
                        <ListGroup>
                            {proposals.map((proposal, index) => (
                                <ListGroup.Item key={index}>{proposal.description}</ListGroup.Item>
                            ))}
                        </ListGroup>
                        {finishedVoters === voterList.length && (
                            <p>Tout le monde a fini de faire des propositions !</p>
                        )}
                        <Button
                            onClick={endSessionWithConfirmation}
                            disabled={proposals.length < 2}
                        >
                            Terminer la session
                        </Button>
                    </Card.Body>
                )}
                {isProposalSessionEnded && (
                    <Card.Body>
                        <Card.Title>Ouvrir la session de vote</Card.Title>
                        <Button onClick={startVotingSession}>Ouvrir la session</Button>
                    </Card.Body>
                )}
                {isVotingSessionStarted && (
                    <Card.Body>
                        <Card.Title>Session de vote en cours</Card.Title>
                        <Card.Subtitle className="mb-2">
                            Liste des propositions
                        </Card.Subtitle>
                        <ListGroup>
                            {proposals.map((proposal, index) => (
                                <ListGroup.Item key={index}>
                                    {proposal.description} ({votes[index]} votes){" "}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                )}
                {isVotingSessionStarted && hasEveryoneVoted && (
                    <Card.Body>
                        <Button onClick={endVotingSession}>
                            Terminer la session de vote
                        </Button>
                    </Card.Body>
                )}
                {isVotingSessionEnded && (
                    <Card.Body>
                        <Card.Title>Afficher le résultat</Card.Title>
                        <Button onClick={showResult}>Afficher le résultat</Button>
                        {winner &&(
                            <p>
                                La proposition gagnante est : {winner.description} avec{" "}
                                {winner.voteCount} votes.
                            </p>
                        )}
                    </Card.Body>
                )}
                <Card.Body>
                {winner &&(
                    <p>
                        La proposition gagnante est : {winner.description} avec{" "}
                        {winner.voteCount} votes.
                    </p>
                )}
                </Card.Body>
                {isVotesTallied && (
                    <Card.Body>
                        <Button onClick={resetStatus}>
                        reset
                    </Button>
                    </Card.Body>

                )}
            </Card>
        </Container>
    );


};

export default AdminPanel;
