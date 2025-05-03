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

    // === USER MANAGEMENT ===
    async registerUser(ctx, role, did, fullName, dob, birthplace, username, password, image) {
        const key = `${role.toLowerCase()}-${did}`;
        if (await this._checkIfExists(ctx, key)) throw new Error(`${role} already registered.`);
        if ((role === "Admin" || role === "ElectionCommunity") && await this._roleExists(ctx, role)) {
            throw new Error(`${role} can only be registered once.`);
        }
        const createdAt = new Date((await ctx.stub.getTxTimestamp()).seconds.low * 1000).toISOString();
        const user = { did, fullName, dob, birthplace, username, password: this._hashPassword(password), image, role, createdAt };
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(user))));
        await this._logAction(ctx, `REGISTER_${role.toUpperCase()}`, did);
        return JSON.stringify(user);
    }

    async login(ctx, role, did, dob, username, password) {
        const key = `${role.toLowerCase()}-${did}`;
        const data = await ctx.stub.getState(key);
        if (!data || data.length === 0) throw new Error("Invalid credentials");
        const user = JSON.parse(data.toString());
        if (user.dob !== dob || user.username !== username || user.password !== this._hashPassword(password)) {
            throw new Error("Invalid credentials");
        }
        await this._logAction(ctx, `LOGIN_${role.toUpperCase()}`, did);
        return JSON.stringify(user);
    }

    async _roleExists(ctx, role) {
        const iterator = await ctx.stub.getStateByRange("", "~");
        let exists = false;
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.key.startsWith(role.toLowerCase() + "-")) {
                exists = true;
                break;
            }
            if (res.done) break;
        }
        await iterator.close();
        return exists;
    }
    async getUserProfile(ctx, role, did) {
        const key = `${role.toLowerCase()}-${did}`;
        const userBytes = await ctx.stub.getState(key);
        if (!userBytes || userBytes.length === 0) throw new Error("User not found");
        return userBytes.toString();
    }

    async updateProfile(ctx, role, did, fullName, birthplace, image) {
        const key = `${role.toLowerCase()}-${did}`;
        const data = await ctx.stub.getState(key);
        if (!data || data.length === 0) throw new Error("User not found");
        const user = JSON.parse(data.toString());
        user.fullName = fullName;
        user.birthplace = birthplace;
        user.image = image;
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(user))));
        await this._logAction(ctx, "UPDATE_PROFILE", did);
        return JSON.stringify(user);
    }

    async listAllUsers(ctx) {
        const result = [];
        const iterator = await ctx.stub.getStateByRange("", "~");
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                const record = JSON.parse(res.value.value.toString());
                if (record.role) result.push(record);
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(result);
    }

    async listAllUsersByRole(ctx, role) {
        const result = [];
        const iterator = await ctx.stub.getStateByRange(`${role.toLowerCase()}-`, `${role.toLowerCase()}-~`);
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                result.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(result);
    }

    async deleteUser(ctx, role, did) {
        const key = `${role.toLowerCase()}-${did}`;
        await ctx.stub.deleteState(key);
        await this._logAction(ctx, "DELETE_USER", did);
        return `User ${did} deleted`;
    }

    async changePassword(ctx, role, did, oldPassword, newPassword) {
        const key = `${role.toLowerCase()}-${did}`;
        const data = await ctx.stub.getState(key);
        if (!data || data.length === 0) throw new Error("User not found");
        const user = JSON.parse(data.toString());
        if (user.password !== this._hashPassword(oldPassword)) throw new Error("Old password incorrect");
        user.password = this._hashPassword(newPassword);
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(user))));
        await this._logAction(ctx, "CHANGE_PASSWORD", did);
        return JSON.stringify(user);
    }

    async assignRole(ctx, did, newRole) {
        const oldKey = `voter-${did}`;
        const data = await ctx.stub.getState(oldKey);
        if (!data || data.length === 0) throw new Error("User not found");
        const user = JSON.parse(data.toString());
        user.role = newRole;
        await ctx.stub.deleteState(oldKey);
        const newKey = `${newRole.toLowerCase()}-${did}`;
        await ctx.stub.putState(newKey, Buffer.from(stringify(sortKeysRecursive(user))));
        await this._logAction(ctx, "ASSIGN_ROLE", did);
        return JSON.stringify(user);
    }

        // === ELECTION MANAGEMENT ===

        async createElection(ctx, electionId, title, description, startDate, endDate) {
            const key = `election-${electionId}`;
            if (await this._checkIfExists(ctx, key)) throw new Error("Election already exists.");
        
            const now = new Date().toISOString();
            const election = {
                electionId,
                title,
                description,
                startDate: new Date(startDate).toISOString(), // 👈 Fix this
                endDate: new Date(endDate).toISOString(),     // 👈 Fix this
                createdAt: now,
                candidates: [],
                voters: [],
                votes: [],
            };
            await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(election))));
            await this._logAction(ctx, "CREATE_ELECTION", electionId);
            return JSON.stringify(election);
        }
        
    
        async updateElectionDetails(ctx, electionId, title, description, startDate, endDate) {
            const key = `election-${electionId}`;
            const data = await ctx.stub.getState(key);
            if (!data || data.length === 0) throw new Error("Election not found");
            const election = JSON.parse(data.toString());
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
                if (res.value && res.value.value.length > 0) {
                    elections.push(JSON.parse(res.value.value.toString()));
                }
                if (res.done) break;
            }
            await iterator.close();
            return JSON.stringify(elections);
        }
    
        
        
        async viewElectionDetails(ctx, electionId) {
            const key = `election-${electionId}`;
            const data = await ctx.stub.getState(key);
            if (!data || data.length === 0) throw new Error("Election not found");
            return data.toString();
        }
    // === CANDIDATE MANAGEMENT ===

    async applyForCandidacy(ctx, electionId, did) {
        const electionKey = `election-${electionId}`;
        const electionBytes = await ctx.stub.getState(electionKey);
        if (!electionBytes || electionBytes.length === 0) throw new Error("Election not found");
    
        const applicationKey = `application-${electionId}-${did}`;
        if (await this._checkIfExists(ctx, applicationKey)) throw new Error("Already applied for candidacy");
    
        const txTimestamp = new Date((await ctx.stub.getTxTimestamp()).seconds.low * 1000).toISOString();
    
        const application = {
            did,
            electionId,  // 🔥 MUST ADD electionId
            status: "pending",
            appliedAt: txTimestamp
        };
    
        await ctx.stub.putState(applicationKey, Buffer.from(stringify(sortKeysRecursive(application))));
        await this._logAction(ctx, "APPLY_CANDIDATE", did);
        return JSON.stringify(application);
    }
    async approveCandidacy(ctx, electionId, did) {
        const applicationKey = `application-${electionId}-${did}`;
        const appBytes = await ctx.stub.getState(applicationKey);
        if (!appBytes || appBytes.length === 0) throw new Error("Application not found");
    
        const application = JSON.parse(appBytes.toString());
        if (application.status === "approved") throw new Error("Already approved");
    
        application.status = "approved";
        await ctx.stub.putState(applicationKey, Buffer.from(stringify(sortKeysRecursive(application))));
    
        const voterKey = `voter-${did}`;
        let voterBytes = await ctx.stub.getState(voterKey);
    
        if (!voterBytes || voterBytes.length === 0) {
            const userKey = `candidate-${did}`;
            voterBytes = await ctx.stub.getState(userKey);
            if (!voterBytes || voterBytes.length === 0) throw new Error("Voter record not found");
        }
    
        const voter = JSON.parse(voterBytes.toString());
        voter.role = "candidate";
    
        const candidateKey = `candidate-${did}`;
        await ctx.stub.putState(candidateKey, Buffer.from(stringify(sortKeysRecursive(voter))));
    
        if (await this._checkIfExists(ctx, voterKey)) {
            await ctx.stub.deleteState(voterKey);
        }
    
        const electionKey = `election-${electionId}`;
        const electionBytes = await ctx.stub.getState(electionKey);
        if (!electionBytes || electionBytes.length === 0) throw new Error("Election not found");
    
        const election = JSON.parse(electionBytes.toString());
    
        // 🔥 Store full candidate profile inside election (not just DID)
        const candidateProfile = {
            did: voter.did,
            fullName: voter.fullName,
            username: voter.username,
            birthplace: voter.birthplace,
            image: voter.image,
            dob: voter.dob,
            role: "candidate",
        };
    
        if (!election.candidates.find(c => c.did === did)) {
            election.candidates.push(candidateProfile);
            await ctx.stub.putState(electionKey, Buffer.from(stringify(sortKeysRecursive(election))));
        }
    
        await this._logAction(ctx, "APPROVE_CANDIDATE", did);
        return JSON.stringify(application);
    }
    
    
    

    async rejectCandidacy(ctx, electionId, did) {
        const appKey = `application-${electionId}-${did}`;
        const appBytes = await ctx.stub.getState(appKey);
        if (!appBytes || appBytes.length === 0) throw new Error("Application not found");
        
        const application = JSON.parse(appBytes.toString());
        if (application.status === "approved") throw new Error("Cannot reject approved candidate");

        application.status = "rejected";
        await ctx.stub.putState(appKey, Buffer.from(stringify(sortKeysRecursive(application))));
        await this._logAction(ctx, "REJECT_CANDIDATE", did);
        return JSON.stringify(application);
    }

    async withdrawCandidacy(ctx, electionId, did) {
        const appKey = `application-${electionId}-${did}`;
        const appBytes = await ctx.stub.getState(appKey);
        if (!appBytes || appBytes.length === 0) throw new Error("Application not found");

        const application = JSON.parse(appBytes.toString());
        application.status = "withdrawn";

        await ctx.stub.putState(appKey, Buffer.from(stringify(sortKeysRecursive(application))));
        await this._logAction(ctx, "WITHDRAW_CANDIDACY", did);
        return JSON.stringify(application);
    }

    async listCandidateApplicationsAll(ctx) {
        const result = [];
        const iterator = await ctx.stub.getStateByRange("application-", "application-~");

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                result.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(result);
    }

    async listAllCandidates(ctx) {
        const candidates = [];
        const iterator = await ctx.stub.getStateByRange("candidate-", "candidate-~");

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                candidates.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(candidates);
    }

    async getCandidateProfile(ctx, did) {
        const key = `candidate-${did}`;
        const data = await ctx.stub.getState(key);
        if (!data || data.length === 0) throw new Error("Candidate not found");
        return data.toString();
    }

    async deleteCandidate(ctx, did) {
        const key = `candidate-${did}`;
        await ctx.stub.deleteState(key);
        await this._logAction(ctx, "DELETE_CANDIDATE", did);
        return `Candidate ${did} deleted`;
    }

    async getApprovedCandidates(ctx, electionId) {
        const electionKey = `election-${electionId}`;
        const electionBytes = await ctx.stub.getState(electionKey);
        if (!electionBytes || electionBytes.length === 0) {
            throw new Error("Election not found");
        }
    
        const election = JSON.parse(electionBytes.toString());
    
        return JSON.stringify(election.candidates || []);
    }

    async filterRunningElections(ctx) {
        const now = new Date();
        const running = [];
        const iterator = await ctx.stub.getStateByRange("election-", "election-~");
    
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                const election = JSON.parse(res.value.value.toString());
                const startDate = new Date(election.startDate);
                const endDate = new Date(election.endDate);
    
                if (startDate <= now && endDate >= now) {
                    // ✅ Directly push the election (candidates are already full profile)
                    running.push(election);
                }
            }
            if (res.done) break;
        }
    
        await iterator.close();
        return JSON.stringify(running);
    }
    
    
    
        // === VOTING MANAGEMENT ===
        async castVote(ctx, electionId, voterDid, candidateDid) {
            const voteKey = `vote-${electionId}-${voterDid}`;
            const electionKey = `election-${electionId}`;
        
            if (await this._checkIfExists(ctx, voteKey)) {
                throw new Error("You have already voted for this election.");
            }
        
            const electionBytes = await ctx.stub.getState(electionKey);
            if (!electionBytes || electionBytes.length === 0) throw new Error("Election not found");
        
            const election = JSON.parse(electionBytes.toString());
        
            // Update election first (before any putState)
            if (!election.voters.includes(voterDid)) {
                election.voters.push(voterDid);
            }
            election.votes.push({
                voterDid,
                candidateDid,
                timestamp: new Date().toISOString(),
            });
        
            // Save election first
            await ctx.stub.putState(electionKey, Buffer.from(stringify(sortKeysRecursive(election))));
        
            // Then create vote record (optional)
            const vote = {
                electionId,
                voterDid,
                candidateDid,
                timestamp: new Date().toISOString(),
            };
            await ctx.stub.putState(voteKey, Buffer.from(stringify(sortKeysRecursive(vote))));
        
            await this._logAction(ctx, "CAST_VOTE", voterDid);
        
            return JSON.stringify(vote);
        }
        

    async countVotes(ctx, electionId) {
        const iterator = await ctx.stub.getStateByRange(`vote-${electionId}-`, `vote-${electionId}-~`);
        const result = {};

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                const vote = JSON.parse(res.value.value.toString());
                result[vote.candidateDid] = (result[vote.candidateDid] || 0) + 1;
            }
            if (res.done) break;
        }
        await iterator.close();
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
        const key = `vote-${electionId}-${voterDid}`;
        const voteBytes = await ctx.stub.getState(key);
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

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                const vote = JSON.parse(res.value.value.toString());
                if (vote.voterDid === voterDid) {
                    voted.push(vote.electionId);
                }
            }
            if (res.done) break;
        }
        await iterator.close();
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

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                const vote = JSON.parse(res.value.value.toString());
                if (vote.voterDid === voterDid) {
                    history.push(vote);
                }
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(history);
    }

    async getVoteHistory(ctx, electionId) {
        const history = [];
        const iterator = await ctx.stub.getStateByRange(`vote-${electionId}-`, `vote-${electionId}-~`);

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                history.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(history);
    }
    // === COMPLAINT MANAGEMENT ===

    async submitComplain(ctx, did, content) {
        const key = `complain-${ctx.stub.getTxID()}`;
        const complaint = {
            did,
            content,
            timestamp: new Date().toISOString()
        };
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

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                complaints.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(complaints);
    }

    async listComplaintsByUser(ctx, did) {
        const complaints = [];
        const iterator = await ctx.stub.getStateByRange("complain-", "complain-~");

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                const complaint = JSON.parse(res.value.value.toString());
                if (complaint.did === did) {
                    complaints.push(complaint);
                }
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(complaints);
    }

    async deleteComplaint(ctx, complaintId) {
        const key = `complain-${complaintId}`;
        await ctx.stub.deleteState(key);
        await this._logAction(ctx, "DELETE_COMPLAINT", complaintId);
        return `Complaint ${complaintId} deleted`;
    }
    // === AUDIT LOGS & SYSTEM MANAGEMENT ===

    async viewAuditLogs(ctx) {
        const logs = [];
        const iterator = await ctx.stub.getStateByRange("log-", "log-~");

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                logs.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(logs);
    }

    async searchAuditLogsByUser(ctx, did) {
        const logs = [];
        const iterator = await ctx.stub.getStateByRange("log-", "log-~");

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.length > 0) {
                const log = JSON.parse(res.value.value.toString());
                if (log.did === did) {
                    logs.push(log);
                }
            }
            if (res.done) break;
        }
        await iterator.close();
        return JSON.stringify(logs);
    }

    async generateElectionReport(ctx, electionId) {
        const electionBytes = await ctx.stub.getState(`election-${electionId}`);
        if (!electionBytes || electionBytes.length === 0) throw new Error("Election not found");

        const election = JSON.parse(electionBytes.toString());
        const votes = JSON.parse(await this.countVotes(ctx, electionId));
        const result = JSON.parse(await this.getVotingResult(ctx, electionId));

        return JSON.stringify({
            electionId,
            electionTitle: election.title,
            totalVotes: Object.values(votes).reduce((a, b) => a + b, 0),
            winner: result.winner,
            maxVotes: result.maxVotes,
            timestamp: new Date().toISOString()
        });
    }

    async downloadAuditReport(ctx) {
        return await this.viewAuditLogs(ctx);
    }

    async resetSystem(ctx) {
        const iterator = await ctx.stub.getStateByRange("", "~");

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.key !== "") {
                await ctx.stub.deleteState(res.value.key);
            }
            if (res.done) break;
        }
        await iterator.close();
        await ctx.stub.putState("init", Buffer.from("VotingContract reset"));
        return "System reset complete";
    }
}
module.exports = VotingContract;
