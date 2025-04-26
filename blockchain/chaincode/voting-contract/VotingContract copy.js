// SPDX-License-Identifier: Apache-2.0
"use strict";

const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");
const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");

class VotingContract extends Contract {

    async initLedger(ctx) {
        await ctx.stub.putState("init", Buffer.from("VotingContract initialized"));
    }

    _hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    async _checkIfExists(ctx, key) {
        const data = await ctx.stub.getState(key);
        return !!data && data.length > 0;
    }

    async _logAction(ctx, action, did) {
        const timestamp = new Date((await ctx.stub.getTxTimestamp()).seconds.low * 1000).toISOString();
        const log = { did, action, timestamp, txId: ctx.stub.getTxID() };
        await ctx.stub.putState(`log-${ctx.stub.getTxID()}`, Buffer.from(stringify(sortKeysRecursive(log))));
    }
// User Management ***********************************************
    async registerUser(ctx, role, did, fullName, dob, birthplace, username, password, image) {
        const key = `${role.toLowerCase()}-${did}`;
        if (await this._checkIfExists(ctx, key)) throw new Error(`${role} already registered.`);
        if ((role === "Admin" || role === "ElectionCommunity") && await this._roleExists(ctx, role)) throw new Error(`${role} can only be registered once.`);
        const txTimestamp = new Date((await ctx.stub.getTxTimestamp()).seconds.low * 1000).toISOString();
        const user = { did, fullName, dob, birthplace, username, password: this._hashPassword(password), image, role, createdAt: txTimestamp };
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(user))));
        await this._logAction(ctx, `REGISTER_${role.toUpperCase()}`, did);
        return JSON.stringify(user);
    }
    
    async login(ctx, role, did, dob, username, password) {
        const key = `${role.toLowerCase()}-${did}`;
        const data = await ctx.stub.getState(key);
        if (data?.length > 0) {
        const user = JSON.parse(data.toString());
        if (user.dob === dob && user.username === username && user.did === did && user.password === this._hashPassword(password)) {
            await this._logAction(ctx, `LOGIN_${role.toUpperCase()}`, did);
            return JSON.stringify(user);
        }
        }
        throw new Error("Invalid credentials");
    }
  
      
      
    async _roleExists(ctx, role) {
        const iterator = await ctx.stub.getStateByRange("", "~");
        for await (const res of iterator) {
            if (res.key.startsWith(role.toLowerCase() + "-")) return true;
        }
        return false;
    }

    async updateProfile(ctx, role, did, fullName, birthplace, image) {
        const key = `${role.toLowerCase()}-${did}`;
        const user = JSON.parse((await ctx.stub.getState(key)).toString());
        user.fullName = fullName;
        user.birthplace = birthplace;
        user.image = image;
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(user))));
        await this._logAction(ctx, "UPDATE_PROFILE", did);
        return JSON.stringify(user);
    }

    async getUserProfile(ctx, role, did) {
        const key = `${role.toLowerCase()}-${did}`;
        const userBytes = await ctx.stub.getState(key);
        if (!userBytes || userBytes.length === 0) throw new Error("User not found");
        return userBytes.toString();
    }

    async listAllUsersByRole(ctx, role) {
        const result = [];
        const prefix = `${role.toLowerCase()}-`;
        const iterator = await ctx.stub.getStateByRange(prefix, `${prefix}~`);
        for await (const res of iterator) result.push(JSON.parse(res.value.toString()));
        return JSON.stringify(result);
    }
    async listAllUsers(ctx) {
        const result = [];
        
        try {
          // Get an iterator for the entire range of keys
          const iterator = await ctx.stub.getStateByRange("", "~");
      
          let res = await iterator.next();
          // Iterate through the results
          while (!res.done) {
            const user = JSON.parse(res.value.value.toString()); // Parse the JSON value from the buffer
            if (user.role) { // Ensure it's a valid user (check role or any other properties you need)
              result.push(user); // Add user to result array
            }
            res = await iterator.next(); // Move to next item
          }
      
          await iterator.close(); // Ensure to close the iterator after use
          return JSON.stringify(result); // Return the result as a JSON string
        } catch (error) {
          console.error("Error fetching users:", error); // Log the error for debugging
          throw new Error("Failed to fetch users: " + error.message); // Throw a detailed error
        }
      }
      
    

    async changePassword(ctx, role, did, oldPassword, newPassword) {
        const key = `${role.toLowerCase()}-${did}`;
        const user = JSON.parse((await ctx.stub.getState(key)).toString());
        if (user.password !== this._hashPassword(oldPassword)) throw new Error("Old password incorrect");
        user.password = this._hashPassword(newPassword);
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(user))));
        await this._logAction(ctx, "CHANGE_PASSWORD", did);
        return JSON.stringify(user);
    }

    async deleteUser(ctx, role, did) {
        const key = `${role.toLowerCase()}-${did}`;
        await ctx.stub.deleteState(key);
        await this._logAction(ctx, "DELETE_USER", did);
        return `User ${did} deleted`;
    }

    async assignRole(ctx, did, newRole) {
        const voterKey = `voter-${did}`;
        const user = JSON.parse((await ctx.stub.getState(voterKey)).toString());
        await ctx.stub.deleteState(voterKey);
        const newKey = `${newRole.toLowerCase()}-${did}`;
        user.role = newRole;
        await ctx.stub.putState(newKey, Buffer.from(stringify(sortKeysRecursive(user))));
        await this._logAction(ctx, "ASSIGN_ROLE", did);
        return JSON.stringify(user);
    }
    // Election Management ***********************************************
    // Create Election function
    async createElection(ctx, electionId, title, description, startDate, endDate) {
        const key = `election-${electionId}`;
        const exists = await ctx.stub.getState(key);
        if (exists && exists.length > 0) throw new Error("Election already exists.");
    
        // Get the current date
        const now = new Date().toISOString();
    
        // Determine if the election is active based on the current date and the start/end dates
        const active = new Date(startDate) <= new Date(now) && new Date(now) <= new Date(endDate);
    
        const election = {
            electionId,
            title,
            description,
            startDate, // Initial start date
            endDate,   // Initial end date
            active,    // Automatically set based on the start and end date
            createdAt: new Date().toISOString(),
            candidates: [],
            voters: [],
            votes: []
        };
    
        console.log("Election created with:", election); // Logging election creation
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(election))));
        return JSON.stringify(election);
    }
    


    async updateElectionDetails(ctx, electionId, title, description, startDate, endDate) {
        const key = `election-${electionId}`;
        const election = JSON.parse((await ctx.stub.getState(key)).toString());
        if (!election) throw new Error("Election not found");
        if (title) election.title = title;
        if (description) election.description = description;
        if (startDate) election.startDate = startDate;
        if (endDate) election.endDate = endDate;
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(election))));
        await this._logAction(ctx, "UPDATE_ELECTION", electionId);
        return JSON.stringify(election);
    }
    
    async deleteElection(ctx, electionId) {
        const key = `election-${electionId}`;
        await ctx.stub.deleteState(key);
        await this._logAction(ctx, "DELETE_ELECTION", electionId);
        return `Election ${electionId} deleted`;
    }


    async getAllElections(ctx) {
        const elections = [];
        const iterator = await ctx.stub.getStateByRange("election-", "election-~");
      
        while (true) {
          const res = await iterator.next();
          if (res.value && res.value.value.toString()) {
            elections.push(JSON.parse(res.value.value.toString()));
          }
          if (res.done) {
            await iterator.close();
            break;
          }
        }
      
        return JSON.stringify(elections);
      }
      

    async filterUpcomingElections(ctx) {
        const upcoming = [];
        const now = new Date();
        const iterator = await ctx.stub.getStateByRange("election-", "election-~");
        for await (const res of iterator) {
            const election = JSON.parse(res.value.toString());
            if (new Date(election.startDate) > now && election.active) upcoming.push(election);
        }
        return JSON.stringify(upcoming);
    }

    async getCalendar(ctx) {
        const elections = JSON.parse(await this.getAllElections(ctx));
        return JSON.stringify(elections.map(e => ({ title: e.title, start: e.startDate, end: e.endDate })));
    }

    async viewElectionDetails(ctx, electionId) {
        const key = `election-${electionId}`;
        const election = await ctx.stub.getState(key);
        if (!election || election.length === 0) throw new Error("Election not found");
        return election.toString();
    }

 
    async addCandidateToElection(ctx, electionId, candidateDid) {
        const electionKey = `election-${electionId}`;
        const candidateKey = `candidate-${candidateDid}`;
        const election = JSON.parse((await ctx.stub.getState(electionKey)).toString());
        const candidate = JSON.parse((await ctx.stub.getState(candidateKey)).toString());
        if (!election || !candidate) throw new Error("Election or Candidate not found");
        if (election.candidates.includes(candidateDid)) throw new Error("Candidate already in election");
        election.candidates.push(candidateDid);
        await ctx.stub.putState(electionKey, Buffer.from(stringify(sortKeysRecursive(election))));
        await this._logAction(ctx, "ADD_CANDIDATE_TO_ELECTION", candidateDid);
        return JSON.stringify(election);
    }
    async removeCandidateFromElection(ctx, electionId, candidateDid) {
        const electionKey = `election-${electionId}`;
        const election = JSON.parse((await ctx.stub.getState(electionKey)).toString());
        if (!election) throw new Error("Election not found");
        const index = election.candidates.indexOf(candidateDid);
        if (index === -1) throw new Error("Candidate not in election");
        election.candidates.splice(index, 1);
        await ctx.stub.putState(electionKey, Buffer.from(stringify(sortKeysRecursive(election))));
        await this._logAction(ctx, "REMOVE_CANDIDATE_FROM_ELECTION", candidateDid);
        return JSON.stringify(election);
    }
    async declareWinner(ctx, electionId, winnerDid) {
        const key = `election-${electionId}`;
        const election = JSON.parse((await ctx.stub.getState(key)).toString());
        if (!election) throw new Error("Election not found");
        if (!election.candidates.includes(winnerDid)) throw new Error("Candidate not in election");
        election.winner = winnerDid;
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(election))));
        await this._logAction(ctx, "DECLARE_WINNER", winnerDid);
        return JSON.stringify(election);
    }
    async getElectionResults(ctx, electionId) {
        const key = `election-${electionId}`;
        const election = JSON.parse((await ctx.stub.getState(key)).toString());
        if (!election) throw new Error("Election not found");
        const candidates = [];
        for (const candidateDid of election.candidates) {
            const candidateKey = `candidate-${candidateDid}`;
            const candidate = JSON.parse((await ctx.stub.getState(candidateKey)).toString());
            candidates.push(candidate);
        }
        return JSON.stringify({ ...election, candidates });
    }
    async getElectionHistory(ctx, electionId) {
        const key = `election-${electionId}`;
        const history = [];
        const iterator = await ctx.stub.getHistoryForKey(key);
        for await (const res of iterator) {
            const data = JSON.parse(res.value.toString());
            history.push({ txId: res.txId, timestamp: res.timestamp, data });
        }
        return JSON.stringify(history);
    }   
    async getElectionVoters(ctx, electionId) {
        const key = `election-${electionId}`;
        const election = JSON.parse((await ctx.stub.getState(key)).toString());
        if (!election) throw new Error("Election not found");
        const voters = [];
        for (const voterDid of election.voters) {
            const voterKey = `voter-${voterDid}`;
            const voter = JSON.parse((await ctx.stub.getState(voterKey)).toString());
            voters.push(voter);
        }
        return JSON.stringify(voters);
    }
    async getElectionVoterCount(ctx, electionId) {
        const key = `election-${electionId}`;
        const election = JSON.parse((await ctx.stub.getState(key)).toString());
        if (!election) throw new Error("Election not found");
        return JSON.stringify({ voterCount: election.voters.length });
    }
    async getElectionVoteCount(ctx, electionId) {
        const key = `election-${electionId}`;
        const election = JSON.parse((await ctx.stub.getState(key)).toString());
        if (!election) throw new Error("Election not found");
        return JSON.stringify({ voteCount: election.votes.length });
    }
    async getElectionVoterHistory(ctx, electionId) {
        const key = `election-${electionId}`;
        const history = [];
        const iterator = await ctx.stub.getHistoryForKey(key);
        for await (const res of iterator) {
            const data = JSON.parse(res.value.toString());
            history.push({ txId: res.txId, timestamp: res.timestamp, data });
        }
        return JSON.stringify(history);
    }
    async getElectionVoteHistory(ctx, electionId) {
        const key = `election-${electionId}`;
        const history = [];
        const iterator = await ctx.stub.getHistoryForKey(key);
        for await (const res of iterator) {
            const data = JSON.parse(res.value.toString());
            history.push({ txId: res.txId, timestamp: res.timestamp, data });
        }
        return JSON.stringify(history);
    }
    async getElectionNotifications(ctx, electionId) {
        const key = `election-${electionId}`;
        const notifications = [];
        const iterator = await ctx.stub.getStateByRange(key, `${key}~`);
        for await (const res of iterator) {
            const notification = JSON.parse(res.value.toString());
            notifications.push(notification);
        }
        return JSON.stringify(notifications);
    }
    //Candidate Management ***********************************************
    
    async applyForCandidacy(ctx, electionId, did) {
        // Get the election details to ensure the election is active
        const electionKey = `election-${electionId}`;
        const election = JSON.parse((await ctx.stub.getState(electionKey)).toString());
        if (!election || !election.active) {
            throw new Error("Election not found or inactive");
        }
    
        // Check if the user has already applied for candidacy in this election
        const applicationKey = `application-${electionId}-${did}`;
        if (await this._checkIfExists(ctx, applicationKey)) {
            throw new Error("You have already applied for candidacy in this election.");
        }
    
        // Prepare the application details
        const application = {
            did,
            status: "pending",  // Status set to pending initially
            appliedAt: new Date().toISOString()
        };
    
        // Store the application in the state
        await ctx.stub.putState(applicationKey, Buffer.from(stringify(sortKeysRecursive(application))));
    
        // Log the action of applying for candidacy
        await this._logAction(ctx, "APPLY_CANDIDATE", did);
    
        // Ensure the response is valid and correctly formatted
        return JSON.stringify(application) || '{}'; // Return an empty object if no data
    }
    
    
    async approveCandidacy(ctx, electionId, did) {
        const applicationKey = `application-${electionId}-${did}`;
        const application = JSON.parse((await ctx.stub.getState(applicationKey)).toString());
        if (!application) throw new Error("Application not found");
    
        // Check if already approved
        if (application.status === "approved") {
            throw new Error("Candidate is already approved.");
        }
    
        // Mark the application as approved
        application.status = "approved";
        await ctx.stub.putState(applicationKey, Buffer.from(stringify(sortKeysRecursive(application))));
    
        // Update the user's role to 'candidate'
        const userKey = `voter-${did}`;
        const user = JSON.parse((await ctx.stub.getState(userKey)).toString());
        user.role = "candidate";  // Change role to candidate
        await ctx.stub.putState(userKey, Buffer.from(stringify(sortKeysRecursive(user))));
    
        // Add the candidate to the election's candidates list
        const electionKey = `election-${electionId}`;
        const election = JSON.parse((await ctx.stub.getState(electionKey)).toString());
        election.candidates.push(did);
        await ctx.stub.putState(electionKey, Buffer.from(stringify(sortKeysRecursive(election))));
    
        await this._logAction(ctx, "APPROVE_CANDIDATE", did);
        return JSON.stringify(application);
    }
    

    async rejectCandidacy(ctx, electionId, did) {
        const appKey = `application-${electionId}-${did}`;
        const applicationBytes = await ctx.stub.getState(appKey);
        if (!applicationBytes || applicationBytes.length === 0) throw new Error("Application not found");
        const application = JSON.parse(applicationBytes.toString());
        if (application.status === "approved") throw new Error("Cannot reject an already approved candidate");
        application.status = "rejected";
        await ctx.stub.putState(appKey, Buffer.from(stringify(sortKeysRecursive(application))));
        await this._logAction(ctx, "REJECT_CANDIDATE", did);
        return JSON.stringify(application);
    }

    async withdrawCandidacy(ctx, electionId, did) {
        const appKey = `application-${electionId}-${did}`;
        const application = JSON.parse((await ctx.stub.getState(appKey)).toString());
        if (!application) throw new Error("Application not found");
        application.status = "withdrawn";
        await ctx.stub.putState(appKey, Buffer.from(stringify(sortKeysRecursive(application))));
        await this._logAction(ctx, "WITHDRAW_CANDIDACY", did);
        return JSON.stringify(application);
    }

    async listCandidateApplications(ctx, electionId) {
        const applications = [];
        const iterator = await ctx.stub.getStateByRange(`application-${electionId}-`, `application-${electionId}-~`);
        for await (const res of iterator) applications.push(JSON.parse(res.value.toString()));
        return JSON.stringify(applications);
    }

    async getApprovedCandidates(ctx, electionId) {
        const key = `election-${electionId}`;
        const electionBytes = await ctx.stub.getState(key);
        if (!electionBytes || electionBytes.length === 0) throw new Error("Election not found");
        const election = JSON.parse(electionBytes.toString());
        return JSON.stringify(election.candidates);
    }

    async getCandidateProfile(ctx, did) {
        const key = `candidate-${did}`;
        const userBytes = await ctx.stub.getState(key);
        if (!userBytes || userBytes.length === 0) throw new Error("Candidate not found");
        return userBytes.toString();
    }
    async updateCandidateProfile(ctx, did, fullName, dob, birthplace, image) {
        const key = `candidate-${did}`;
        const candidate = JSON.parse((await ctx.stub.getState(key)).toString());
        if (!candidate) throw new Error("Candidate not found");
        candidate.fullName = fullName;
        candidate.dob = dob;
        candidate.birthplace = birthplace;
        candidate.image = image;
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(candidate))));
        await this._logAction(ctx, "UPDATE_CANDIDATE", did);
        return JSON.stringify(candidate);
    }
    async deleteCandidate(ctx, did) {
        const key = `candidate-${did}`;
        await ctx.stub.deleteState(key);
        await this._logAction(ctx, "DELETE_CANDIDATE", did);
        return `Candidate ${did} deleted`;
    }
    async listAllCandidates(ctx) {
        const candidates = [];
        const iterator = await ctx.stub.getStateByRange("candidate-", "candidate-~");
        for await (const res of iterator) candidates.push(JSON.parse(res.value.toString()));
        return JSON.stringify(candidates);
    }
    async getCandidateVoteCount(ctx, did) {
        const key = `candidate-${did}`;
        const candidate = JSON.parse((await ctx.stub.getState(key)).toString());
        if (!candidate) throw new Error("Candidate not found");
        return JSON.stringify({ voteCount: candidate.votes || 0 });
    }
    async getCandidateHistory(ctx, did) {
        const key = `candidate-${did}`;
        const history = [];
        const iterator = await ctx.stub.getHistoryForKey(key);
        for await (const res of iterator) {
            const data = JSON.parse(res.value.toString());
            history.push({ txId: res.txId, timestamp: res.timestamp, data });
        }
        return JSON.stringify(history);
    }
    async getCandidateNotifications(ctx, did) {
        const key = `candidate-${did}`;
        const notifications = [];
        const iterator = await ctx.stub.getStateByRange(key, `${key}~`);
        for await (const res of iterator) {
            const notification = JSON.parse(res.value.toString());
            notifications.push(notification);
        }
        return JSON.stringify(notifications);
    }
    // Voting Management ***********************************************
    async castVote(ctx, electionId, voterDid, candidateDid) {
        const voteKey = `vote-${electionId}-${voterDid}`;
        if (await this._checkIfExists(ctx, voteKey)) throw new Error("Already voted");
        const vote = { electionId, voterDid, candidateDid, timestamp: new Date().toISOString() };
        await ctx.stub.putState(voteKey, Buffer.from(stringify(sortKeysRecursive(vote))));
        await this._logAction(ctx, "CAST_VOTE", voterDid);
        return JSON.stringify(vote);
    }

    async countVotes(ctx, electionId) {
        const iterator = await ctx.stub.getStateByRange(`vote-${electionId}-`, `vote-${electionId}-~`);
        const result = {};
        for await (const res of iterator) {
            const vote = JSON.parse(res.value.toString());
            result[vote.candidateDid] = (result[vote.candidateDid] || 0) + 1;
        }
        return JSON.stringify(result);
    }

    async getVotingResult(ctx, electionId) {
        const counts = JSON.parse(await this.countVotes(ctx, electionId));
        let maxVotes = 0;
        let winner = null;
        for (const [candidate, votes] of Object.entries(counts)) {
            if (votes > maxVotes) {
                maxVotes = votes;
                winner = candidate;
            }
        }
        return JSON.stringify({ electionId, winner, maxVotes });
    }

    async getVoteReceipt(ctx, electionId, voterDid) {
        const voteKey = `vote-${electionId}-${voterDid}`;
        const voteBytes = await ctx.stub.getState(voteKey);
        if (!voteBytes || voteBytes.length === 0) throw new Error("Vote not found");
        return voteBytes.toString();
    }

    async hasVoted(ctx, electionId, voterDid) {
        const voteKey = `vote-${electionId}-${voterDid}`;
        const exists = await this._checkIfExists(ctx, voteKey);
        return JSON.stringify({ hasVoted: exists });
    }

    async listVotedElections(ctx, voterDid) {
        const voted = [];
        const iterator = await ctx.stub.getStateByRange("vote-", "vote-~");
        for await (const res of iterator) {
            const vote = JSON.parse(res.value.toString());
            if (vote.voterDid === voterDid) voted.push(vote.electionId);
        }
        return JSON.stringify([...new Set(voted)]);
    }

    async listUnvotedElections(ctx, voterDid) {
        const voted = JSON.parse(await this.listVotedElections(ctx, voterDid));
        const elections = JSON.parse(await this.getAllElections(ctx));
        const unvoted = elections.filter(e => e.active && !voted.includes(e.electionId));
        return JSON.stringify(unvoted);
    }

    async getTurnoutRate(ctx, electionId) {
        const votes = JSON.parse(await this.countVotes(ctx, electionId));
        const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
        const voters = JSON.parse(await this.listAllUsersByRole(ctx, "voter"));
        const rate = (totalVotes / voters.length) * 100;
        return JSON.stringify({ electionId, turnout: `${rate.toFixed(2)}%` });
    }
    async getVotingHistory(ctx, voterDid) {
        const history = [];
        const iterator = await ctx.stub.getStateByRange(`vote-`, `vote-~`);
        for await (const res of iterator) {
            const vote = JSON.parse(res.value.toString());
            if (vote.voterDid === voterDid) history.push(vote);
        }
        return JSON.stringify(history);
    }
    async getVoteHistory(ctx, electionId) {
        const history = [];
        const iterator = await ctx.stub.getStateByRange(`vote-${electionId}-`, `vote-${electionId}-~`);
        for await (const res of iterator) {
            const vote = JSON.parse(res.value.toString());
            history.push(vote);
        }
        return JSON.stringify(history);
    }
    async getVoteNotifications(ctx, voterDid) {
        const key = `vote-${voterDid}`;
        const notifications = [];
        const iterator = await ctx.stub.getStateByRange(key, `${key}~`);
        for await (const res of iterator) {
            const notification = JSON.parse(res.value.toString());
            notifications.push(notification);
        }
        return JSON.stringify(notifications);
    }
    async getVoteCount(ctx, electionId) {
        const key = `vote-${electionId}`;
        const count = await ctx.stub.getState(key);
        if (!count || count.length === 0) throw new Error("Vote count not found");
        return count.toString();
    }
    async getVoterCount(ctx, electionId) {
        const key = `voter-${electionId}`;
        const count = await ctx.stub.getState(key);
        if (!count || count.length === 0) throw new Error("Voter count not found");
        return count.toString();
    }
    // Complaint management ****************************************
    async submitComplain(ctx, did, content) {
        const key = `complain-${ctx.stub.getTxID()}`;
        const complaint = { did, content, timestamp: new Date().toISOString() };
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(complaint))));
        await this._logAction(ctx, "SUBMIT_COMPLAIN", did);
        return JSON.stringify(complaint);
    }

    async replyToComplaint(ctx, complaintId, responderDid, responseText) {
        const key = `complain-${complaintId}`;
        const complaintBytes = await ctx.stub.getState(key);
        if (!complaintBytes || complaintBytes.length === 0) throw new Error("Complaint not found");
        const complaint = JSON.parse(complaintBytes.toString());
        complaint.response = responseText;
        complaint.respondedBy = responderDid;
        complaint.responseAt = new Date().toISOString();
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(complaint))));
        await this._logAction(ctx, "REPLY_COMPLAINT", responderDid);
        return JSON.stringify(complaint);
    }

    async viewComplaints(ctx) {
        const complaints = [];
        const iterator = await ctx.stub.getStateByRange("complain-", "complain-~");
        for await (const res of iterator) complaints.push(JSON.parse(res.value.toString()));
        return JSON.stringify(complaints);
    }

    async listComplaintsByUser(ctx, did) {
        const complaints = [];
        const iterator = await ctx.stub.getStateByRange("complain-", "complain-~");
        for await (const res of iterator) {
            const complaint = JSON.parse(res.value.toString());
            if (complaint.did === did) complaints.push(complaint);
        }
        return JSON.stringify(complaints);
    }

    async deleteComplaint(ctx, complaintId) {
        const key = `complain-${complaintId}`;
        await ctx.stub.deleteState(key);
        await this._logAction(ctx, "DELETE_COMPLAINT", complaintId);
        return `Complaint ${complaintId} deleted`;
    }
    // Logs, Reports, and System Reset ****************************************
    async viewAuditLogs(ctx) {
        const logs = [];
        const iterator = await ctx.stub.getStateByRange("log-", "log-~");
        for await (const res of iterator) logs.push(JSON.parse(res.value.toString()));
        return JSON.stringify(logs);
    }

    async searchAuditLogsByUser(ctx, did) {
        const logs = [];
        const iterator = await ctx.stub.getStateByRange("log-", "log-~");
        for await (const res of iterator) {
            const log = JSON.parse(res.value.toString());
            if (log.did === did) logs.push(log);
        }
        return JSON.stringify(logs);
    }

    async generateElectionReport(ctx, electionId) {
        const election = JSON.parse(await ctx.stub.getState(`election-${electionId}`));
        const votes = JSON.parse(await this.countVotes(ctx, electionId));
        const result = JSON.parse(await this.getVotingResult(ctx, electionId));
        return JSON.stringify({ electionId, votes, winner: result.winner, maxVotes: result.maxVotes });
    }

    async downloadAuditReport(ctx) {
        const logs = await this.viewAuditLogs(ctx);
        return logs;
    }

    async resetSystem(ctx) {
        const iterator = await ctx.stub.getStateByRange("", "~");
        for await (const res of iterator) {
            await ctx.stub.deleteState(res.key);
        }
        await ctx.stub.putState("init", Buffer.from("VotingContract reset"));
        return "System reset complete";
    }
}

module.exports = VotingContract;
