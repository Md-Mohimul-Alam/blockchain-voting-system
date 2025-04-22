const { Contract } = require('fabric-contract-api');
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');

class VotingContract extends Contract {

  /** ******************************
   * ✅ ADMIN FUNCTIONS
   ****************************** **/

  async registerAdmin(ctx, did, userName, dob, hashedPassword) {
    const existingAdmins = await this.getAllAdmins(ctx);
    if (existingAdmins.length > 0) {
      throw new Error("An admin already exists. Only one admin is allowed.");
    }
    const admin = { did, userName, dob, password: hashedPassword, role: "admin" };
    const key = `admin-${did}`;
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(admin))));
    return JSON.stringify(admin);
  }

  async loginAdmin(ctx, did, userName, dob) {
    const key = `admin-${did}`;
    const adminAsBytes = await ctx.stub.getState(key);
    if (!adminAsBytes || adminAsBytes.length === 0) {
      throw new Error(`Admin with DID ${did} does not exist`);
    }
    const admin = JSON.parse(adminAsBytes.toString());
    if (admin.userName === userName && admin.dob === dob) {
      return JSON.stringify(admin);
    }
    throw new Error('Invalid credentials');
  }

  async getAllAdmins(ctx) {
    const iterator = await ctx.stub.getStateByRange('admin-', 'admin~');
    const allAdmins = [];
    let result = await iterator.next();
    while (!result.done) {
      const admin = JSON.parse(result.value.value.toString());
      if (admin.role === 'admin') {
        allAdmins.push(admin);
      }
      result = await iterator.next();
    }
    await iterator.close();
    return allAdmins;
  }

  async updateAdmin(ctx, did, userName, dob, hashedPassword) {
    const key = `admin-${did}`;
    const adminAsBytes = await ctx.stub.getState(key);
    if (!adminAsBytes || adminAsBytes.length === 0) {
      throw new Error(`Admin with DID ${did} does not exist`);
    }
    const admin = JSON.parse(adminAsBytes.toString());
    admin.userName = userName;
    admin.dob = dob;
    admin.password = hashedPassword;
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(admin))));
    return JSON.stringify(admin);
  }

  async getAllVoters(ctx) {
    const iterator = await ctx.stub.getStateByRange('user-', 'user~');
    const allVoters = [];
    let result = await iterator.next();
    while (!result.done) {
      const user = JSON.parse(result.value.value.toString());
      if (user.role === 'user') {
        allVoters.push(user);
      }
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(allVoters);
  }

  async getAllVotersUsers(ctx) {
    const iterator = await ctx.stub.getStateByRange('user-', 'user~');
    const allVoters = [];
    let result = await iterator.next();
    while (!result.done) {
      const user = JSON.parse(result.value.value.toString());
      if (user.role === 'user') {
        allVoters.push(user);
      }
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(allVoters);
  }

  async verifyAdmin(ctx, did) {
    const key = `admin-${did}`;
    const adminAsBytes = await ctx.stub.getState(key);
    if (!adminAsBytes || adminAsBytes.length === 0) {
      throw new Error(`Admin with DID ${did} does not exist`);
    }
    const admin = JSON.parse(adminAsBytes.toString());
    if (admin.role !== 'admin') {
      throw new Error(`User with DID ${did} is not an admin`);
    }
  }

  async getAllCandidates(ctx, did) {
    // First check if the did exists, meaning we have a valid user
    if (!did) {
      // If there is no DID provided, the user is not authenticated.
      throw new Error("User is not authenticated.");
    }

    // Check if the DID belongs to an admin (only verifyAdmin if you need admin access)
    if (did) {
      await this.verifyAdmin(ctx, did); // Will throw error if not admin
    }

    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('candidate-', 'candidate~');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(allResults);
  }

  async getAllCandidatesUsers(ctx, did) {
    // First check if the did exists, meaning we have a valid user
    if (!did) {
      // If there is no DID provided, the user is not authenticated.
      throw new Error("User is not authenticated.");
    }
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('candidate-', 'candidate~');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(allResults);
  }

  async createCandidate(ctx, adminDID, did, name, dob, logo, birthplace) {
    // Verify the admin is authorized
    await this.verifyAdmin(ctx, adminDID);

    // Check if there is an open election
    const electionIterator = await ctx.stub.getStateByRange('election-', 'election~');
    let electionFound = false;
    let electionOpen = false;

    let result = await electionIterator.next();
    while (!result.done) {
      const election = JSON.parse(result.value.value.toString());
      if (election.status === 'open') {
        electionFound = true;
        electionOpen = true;
        break;
      }
      result = await electionIterator.next();
    }

    await electionIterator.close();

    // If no open election is found, throw an error
    if (!electionFound || !electionOpen) {
      throw new Error("No open election found. Candidates can only be created when an election is open.");
    }

    // Proceed with candidate creation
    const key = `candidate-${did}`;
    const candidateAsBytes = await ctx.stub.getState(key);
    if (candidateAsBytes && candidateAsBytes.length > 0) {
      throw new Error(`Candidate with DID ${did} already exists`);
    }

    const candidate = { did, name, dob, logo, birthplace, role: 'candidate', votes: 0 };
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(candidate))));
    return JSON.stringify(candidate);
  }

  // Update Candidate
  async updateCandidate(ctx, did, name, dob, logo, birthplace) {
    const key = `candidate-${did}`;

    const candidateAsBytes = await ctx.stub.getState(key);
    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(`Candidate with DID ${did} does not exist`);
    }

    const candidate = JSON.parse(candidateAsBytes.toString());

    if (name !== undefined) {
      candidate.name = name;
    }
    if (dob !== undefined) {
      candidate.dob = dob;
    }
    if (logo !== undefined) {
      candidate.logo = logo;
    }
    if (birthplace !== undefined) {
      candidate.birthplace = birthplace;
    }

    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(candidate))));

    return JSON.stringify(candidate);
  }

  // Create Election
  async createElection(ctx, electionID, status, startDate) {
    const key = `election-${electionID}`;

    const existingElection = await ctx.stub.getState(key);
    if (existingElection && existingElection.length > 0) {
      throw new Error(`Election with ID ${electionID} already exists`);
    }

    const election = {
      electionID,
      status,
      startDate,
      winner: null,
    };

    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(election))));
    return JSON.stringify(election);
  }

  async getAllElections(ctx) {
    const allElections = [];
    const iterator = await ctx.stub.getStateByRange('election-', 'election~');
    let result = await iterator.next();

    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let election;
      try {
        election = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        election = strValue;
      }
      allElections.push(election);
      result = await iterator.next();
    }

    await iterator.close();
    return JSON.stringify(allElections);
  }

  async closeElection(ctx, electionID) {
    const key = `election-${electionID}`;
    const electionAsBytes = await ctx.stub.getState(key);
    
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`); // Error if election does not exist
    }
    
    const election = JSON.parse(electionAsBytes.toString());
    
    if (election.status === "closed") {
      throw new Error(`Election ${electionID} is already closed`); // Error if election is already closed
    }
    
    // Set the status of the election to closed
    election.status = "closed";
    
    // Save updated election data back to the ledger
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(election))));
    
    return `Election ${electionID} has been closed`;  // Return confirmation
  }
  // Chaincode: Delete Candidate
  async deleteCandidate(ctx, adminDID, candidateDID) {
    // Ensure the admin is authorized
    await this.verifyAdmin(ctx, adminDID);

    // Get the candidate data using the candidate DID (c2)
    const key = `candidate-${candidateDID}`;
    const candidateAsBytes = await ctx.stub.getState(key);

    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(`Candidate with DID ${candidateDID} does not exist`);
    }

    // Delete the candidate from the world state
    await ctx.stub.deleteState(key);

    return `Candidate with DID ${candidateDID} has been deleted`;
  }
  async resetElection(ctx, electionID) {
    const electionKey = `election-${electionID}`;
    const electionAsBytes = await ctx.stub.getState(electionKey);
    
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`);
    }
    const election = JSON.parse(electionAsBytes.toString());
    delete election.status;  // Unset the status field
    const candidateIterator = await ctx.stub.getStateByRange('candidate-', 'candidate~');
    let result = await candidateIterator.next();
    while (!result.done) {
      const candidate = JSON.parse(result.value.value.toString());
      if (candidate.electionID === electionID) {
        await ctx.stub.deleteState(result.value.key);
      }
      result = await candidateIterator.next();
    }
    await candidateIterator.close();
    const voteIterator = await ctx.stub.getStateByRange('vote-', 'vote~');
    result = await voteIterator.next();
    while (!result.done) {
      const vote = JSON.parse(result.value.value.toString());
      if (vote.electionID === electionID) {
        await ctx.stub.deleteState(result.value.key);
      }
      result = await voteIterator.next();
    }
    await voteIterator.close();
    const userIterator = await ctx.stub.getStateByRange('user-', 'user~');
    result = await userIterator.next();
    while (!result.done) {
      const user = JSON.parse(result.value.value.toString());
      if (user.role !== "admin") {
        await ctx.stub.deleteState(result.value.key);
      }
      result = await userIterator.next();
    }
    await userIterator.close();
    await ctx.stub.deleteState(electionKey);
    return `Election ${electionID} and all related data (except admin data) have been deleted and reset. Election status has been unset.`;
  }

  // Declare Winner
  async resetElection(ctx, electionID) {
    const electionKey = `election-${electionID}`;
    const electionAsBytes = await ctx.stub.getState(electionKey);
    
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`);
    }
  
    const election = JSON.parse(electionAsBytes.toString());
    
    // Unset the status field
    delete election.status;
  
    // Delete candidates associated with the election
    const candidateIterator = await ctx.stub.getStateByRange('candidate-', 'candidate~');
    let result = await candidateIterator.next();
  
    while (!result.done) {
      const candidate = JSON.parse(result.value.value.toString());
      console.log(`Checking candidate: ${candidate.did}, electionID: ${candidate.electionID}`);
  
      // Delete candidates that belong to the current election
      if (candidate.electionID === electionID) {
        console.log(`Deleting candidate: ${candidate.did}`);
        await ctx.stub.deleteState(result.value.key);
      }
      result = await candidateIterator.next();
    }
    await candidateIterator.close();
  
    // Delete votes associated with the election
    const voteIterator = await ctx.stub.getStateByRange('vote-', 'vote~');
    result = await voteIterator.next();
  
    while (!result.done) {
      const vote = JSON.parse(result.value.value.toString());
      if (vote.electionID === electionID) {
        await ctx.stub.deleteState(result.value.key);
      }
      result = await voteIterator.next();
    }
    await voteIterator.close();
  
    // Delete all user data except admin
    const userIterator = await ctx.stub.getStateByRange('user-', 'user~');
    result = await userIterator.next();
  
    while (!result.done) {
      const user = JSON.parse(result.value.value.toString());
      if (user.role !== "admin") {
        await ctx.stub.deleteState(result.value.key);
      }
      result = await userIterator.next();
    }
    await userIterator.close();
  
    // Delete the election record
    await ctx.stub.deleteState(electionKey);
  
    return `Election ${electionID} and all related data (except admin data) have been deleted and reset. Election status has been unset.`;
  }                            
  async seeVoteCount(ctx) {
    const iterator = await ctx.stub.getStateByRange('candidate-', 'candidate~');
    const voteCounts = [];
    let result = await iterator.next();
    while (!result.done) {
      const candidate = JSON.parse(result.value.value.toString());
      if (candidate.role === 'candidate') {
        voteCounts.push({ did: candidate.did, name: candidate.name, votes: candidate.votes });
      }
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(voteCounts);
  }

  async castVote(ctx, did, candidateDid, electionID) {
    // Fetch the election details
    const electionKey = `election-${electionID}`;
    const electionAsBytes = await ctx.stub.getState(electionKey);
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`);
    }

    const election = JSON.parse(electionAsBytes.toString());
    if (election.status !== "open") {
      throw new Error("Voting is not allowed. Election is closed.");
    }
    const userKey = `user-${did}`;
    const userAsBytes = await ctx.stub.getState(userKey);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User with DID ${did} does not exist`);
    }

    const user = JSON.parse(userAsBytes.toString());
    if (user.voted) {
      throw new Error(`User with DID ${did} has already voted`);
    }
    const candidateKey = `candidate-${candidateDid}`;
    const candidateAsBytes = await ctx.stub.getState(candidateKey);
    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(`Candidate with DID ${candidateDid} does not exist`);
    }

    const candidate = JSON.parse(candidateAsBytes.toString());
    candidate.votes += 1;
    user.voted = true;
    await ctx.stub.putState(candidateKey, Buffer.from(stringify(sortKeysRecursive(candidate))));
    await ctx.stub.putState(userKey, Buffer.from(stringify(sortKeysRecursive(user))));

    return `Vote successfully cast for candidate ${candidateDid}`;
  }

  async seeWinner(ctx, electionID) {
    // Fetch the election details
    const electionKey = `election-${electionID}`;
    const electionAsBytes = await ctx.stub.getState(electionKey);
  
    // Check if the election exists
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`);
    }
  
    // Parse the election data
    const election = JSON.parse(electionAsBytes.toString());
  
    // Check if the winner is declared
    if (!election.winner) {
      throw new Error(`Winner for Election ID ${electionID} has not been declared yet`);
    }
  
    // Fetch the winner's candidate details using the winner's DID
    const winnerDID = election.winner;
    const candidateKey = `candidate-${winnerDID}`;
    const candidateAsBytes = await ctx.stub.getState(candidateKey);
  
    // If the candidate with that DID doesn't exist
    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(`Candidate with DID ${winnerDID} does not exist`);
    }
  
    // Parse the candidate details
    const candidate = JSON.parse(candidateAsBytes.toString());
  
    // Return election details along with winner information
    return JSON.stringify({
      electionID,
      electionStatus: election.status,  // Election status (open/closed)
      winner: {
        did: candidate.did,             // Winner's DID
        name: candidate.name,           // Winner's name
        votes: candidate.votes,         // Winner's votes
        dob: candidate.dob,             // Winner's Date of Birth
        birthplace: candidate.birthplace, // Winner's birthplace
        logo: candidate.logo            // Winner's logo
      }
    });
  }

  async getPersonalInfo(ctx, did) {
    const key = `user-${did}`;
    const userAsBytes = await ctx.stub.getState(key);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User with DID ${did} does not exist`);
    }
    return userAsBytes.toString();
  }

  async updatePersonalInfo(ctx, did, name, dob, birthplace, userName, hashedPassword) {
    const key = `user-${did}`;
    const userAsBytes = await ctx.stub.getState(key);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User with DID ${did} does not exist`);
    }
    const user = JSON.parse(userAsBytes.toString());
    user.name = name;
    user.dob = dob;
    user.birthplace = birthplace;
    user.userName = userName;
    user.password = hashedPassword;
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(user))));
    return JSON.stringify(user);
  }
  async registerUser(ctx, did, name, dob, birthplace, userName, hashedPassword) {
    const key = `user-${did}`;
    const user = { did, name, dob, birthplace, userName, password: hashedPassword, role: "user", voted: false };
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(user))));
    return JSON.stringify(user);
  }
  async loginUser(ctx, did, userName, dob) {
    const key = `user-${did}`;
    const userAsBytes = await ctx.stub.getState(key);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User with DID ${did} does not exist`);
    }
    const user = JSON.parse(userAsBytes.toString());
    if (user.userName === userName && user.dob === dob) {
      return JSON.stringify(user);
    }
    throw new Error('Invalid credentials');
  }
  // Update User Details
  async updateUser(ctx, did, name, dob, birthplace, userName, hashedPassword) {
    const key = `user-${did}`;
    
    // Fetch the existing user data from the ledger
    const userAsBytes = await ctx.stub.getState(key);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User with DID ${did} does not exist`);
    }
    
    // Parse the existing user data
    const user = JSON.parse(userAsBytes.toString());
      if (name !== undefined) {
        user.name = name;
      }
      if (dob !== undefined) {
        user.dob = dob;
      }
      if (birthplace !== undefined) {
        user.birthplace = birthplace;s
      }
      if (userName !== undefined) {
        user.userName = userName;
      }
      if (hashedPassword !== undefined) {
        user.password = hashedPassword; // Update password if provided
      }
      await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(user))));
      
    return JSON.stringify(user);
  }
    // Add this to your VotingContract class
  async getElection(ctx, electionID) {
    const electionKey = `election-${electionID}`;  // Construct the election key
    const electionAsBytes = await ctx.stub.getState(electionKey);  // Retrieve the election data by key
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`);
    }
    return electionAsBytes.toString();  // Return the election data as a string
  }
}

module.exports = VotingContract;