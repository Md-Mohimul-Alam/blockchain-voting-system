'use strict';

function validateCandidateID(candidateID) {
    if (!candidateID || typeof candidateID !== 'string') {
        throw new Error('Invalid candidate ID.');
    }
}

function validateVoterDID(voterDID) {
    if (!voterDID || typeof voterDID !== 'string') {
        throw new Error('Invalid voter DID.');
    }
}

module.exports = { validateCandidateID, validateVoterDID };
