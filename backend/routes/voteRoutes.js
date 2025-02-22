const express = require('express');
const {
    registerCandidate,
    deleteCandidate,
    updateCandidate,
    vote,
    closeVoting,
    getResults,
    getCandidates,
    getVoterVote,
    resetElection
} = require('../controllers/voteController');

const router = express.Router();

router.post('/registerCandidate', registerCandidate);
router.post('/deleteCandidate', deleteCandidate);
router.post('/updateCandidate', updateCandidate);
router.post('/castVote', vote);
router.post('/closeVoting', closeVoting);
router.get('/getResults', getResults);
router.get('/getCandidates', getCandidates);
router.get('/getVoterVote/:voterDID', getVoterVote);
router.post('/resetElection', resetElection);

module.exports = router;
