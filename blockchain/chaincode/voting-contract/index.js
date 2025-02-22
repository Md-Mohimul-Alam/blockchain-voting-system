'use strict';

const { Contract } = require('fabric-contract-api');

class VotingContract extends Contract {

    async initLedger(ctx) {
        console.log('✅ Ledger Initialized');
    }

    /**
     * Register a new candidate in the election
     */
    async registerCandidate(ctx, candidateID, name) {
        if (await this.candidateExists(ctx, candidateID)) {
            throw new Error(`❌ Candidate ${candidateID} already exists.`);
        }

        const candidate = { name, votes: 0 };
        await ctx.stub.putState(candidateID, Buffer.from(JSON.stringify(candidate)));
        return `✅ Candidate ${name} registered successfully.`;
    }

    /**
     * Delete a candidate from the election
     */
    async deleteCandidate(ctx, candidateID) {
        if (!(await this.candidateExists(ctx, candidateID))) {
            throw new Error(`❌ Candidate ${candidateID} not found.`);
        }

        await ctx.stub.deleteState(candidateID);
        return `✅ Candidate ${candidateID} deleted successfully.`;
    }

    /**
     * Update a candidate's name
     */
    async updateCandidate(ctx, candidateID, newName) {
        const candidate = await this.getStateAsObject(ctx, candidateID);
        candidate.name = newName;

        await ctx.stub.putState(candidateID, Buffer.from(JSON.stringify(candidate)));
        return `✅ Candidate ${candidateID} updated to ${newName}.`;
    }

    /**
     * Cast a vote for a candidate
     */
    async vote(ctx, voterDID, candidateID) {
        const isClosed = await ctx.stub.getState('electionClosed');
        if (isClosed.toString() === 'true') {
            throw new Error('❌ Voting has been closed. No further votes can be cast.');
        }

        const alreadyVoted = await ctx.stub.getState(voterDID);
        if (alreadyVoted && alreadyVoted.length > 0) {
            throw new Error(`❌ Voter has already voted for candidate ${alreadyVoted.toString()}.`);
        }

        const candidate = await this.getStateAsObject(ctx, candidateID);
        candidate.votes++;

        await ctx.stub.putState(candidateID, Buffer.from(JSON.stringify(candidate)));
        await ctx.stub.putState(voterDID, Buffer.from(candidateID));

        return `✅ Vote cast successfully for ${candidate.name}.`;
    }

    /**
     * Close the voting process and generate election results
     */
    async closeVoting(ctx) {
        const isClosed = await ctx.stub.getState('electionClosed');
        if (isClosed.toString() === 'true') {
            throw new Error('❌ Voting has already been closed.');
        }

        await ctx.stub.putState('electionClosed', Buffer.from('true'));

        // Get election results
        const candidates = await this.getAllCandidates(ctx, true);

        // Calculate total voters & determine winner
        let totalVoters = 0;
        let winner = { candidateID: "", name: "", votes: 0 };

        candidates.forEach(candidate => {
            totalVoters += candidate.votes;
            if (candidate.votes > winner.votes) {
                winner = candidate;
            }
        });

        // Prepare election results
        const electionResults = {
            message: "✅ Voting has been closed. Final results:",
            candidates: candidates,
            totalVoters: totalVoters,
            winner: winner
        };

        // Store results on the ledger
        await ctx.stub.putState('electionResults', Buffer.from(JSON.stringify(electionResults)));

        return JSON.stringify(electionResults);
    }

    /**
     * Retrieve final election results
     */
    async getResults(ctx) {
        const results = await ctx.stub.getState('electionResults');
        if (!results || results.length === 0) {
            throw new Error('❌ Election results are not available yet.');
        }
        return results.toString();
    }

    /**
     * Retrieve all candidates and their vote counts
     */
    async getAllCandidates(ctx, returnObject = false) {
        const iterator = await ctx.stub.getStateByRange('', '');
        const candidates = [];

        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                try {
                    const candidate = JSON.parse(res.value.value.toString());
                    if (candidate.votes !== undefined) {
                        candidates.push({ candidateID: res.value.key, ...candidate });
                    }
                } catch (error) {
                    console.error(`❌ Error parsing candidate data: ${error.message}`);
                }
            }

            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return returnObject ? candidates : JSON.stringify(candidates);
    }

    /**
     * Retrieve the candidate a voter has voted for
     */
    async getVoterVote(ctx, voterDID) {
        const voteRecord = await ctx.stub.getState(voterDID);
        if (!voteRecord || voteRecord.length === 0) {
            throw new Error('❌ Voter has not voted yet.');
        }
        return `✅ Voter voted for candidate: ${voteRecord.toString()}`;
    }

    /**
     * Reset election by deleting all candidates and votes
     */
    async resetElection(ctx) {
        const iterator = await ctx.stub.getStateByRange('', '');

        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.key) {
                await ctx.stub.deleteState(res.value.key);
            }

            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return "✅ Election has been reset successfully.";
    }

    /**
     * Utility function: Check if a candidate exists
     */
    async candidateExists(ctx, candidateID) {
        const candidate = await ctx.stub.getState(candidateID);
        return candidate && candidate.length > 0;
    }

    /**
     * Utility function: Retrieve state as an object
     */
    async getStateAsObject(ctx, key) {
        const state = await ctx.stub.getState(key);
        if (!state || state.length === 0) {
            throw new Error(`❌ ${key} not found.`);
        }
        return JSON.parse(state.toString());
    }
}

module.exports = VotingContract;
