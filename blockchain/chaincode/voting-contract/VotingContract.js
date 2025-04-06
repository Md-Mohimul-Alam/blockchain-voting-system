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
    const allVoters = [];
    const iterator = await ctx.stub.getStateByRange('user-', 'user~');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue); // Try to parse the record as JSON
      } catch (err) {
        console.log(err);
        record = strValue; // If JSON parsing fails, return the raw string
      }
  
      if (record.role === 'user') {
        allVoters.push(record); // Add user role to the result
      }
  
      result = await iterator.next();
    }
    await iterator.close();
    return allVoters;
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
  async getAllCandidates(ctx) {
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
        record = strValue; // If JSON parsing fails, return the raw string
      }
      allResults.push(record);
      result = await iterator.next();
    }
    await iterator.close();
    return allResults;
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

  async updateCandidate(ctx, did, name, dob, logo, birthplace, adminDID) {
    await this.verifyAdmin(ctx, adminDID);
  
    const key = `candidate-${did}`;
    const candidateAsBytes = await ctx.stub.getState(key);
    
    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(`Candidate with DID ${did} does not exist`);
    }
  
    // Ensure candidateAsBytes is not empty or undefined before parsing
    let candidate;
    try {
      candidate = JSON.parse(candidateAsBytes.toString());
    } catch (err) {
      throw new Error("Failed to parse candidate data.");
    }
  
    // Update candidate properties
    candidate.name = name;
    candidate.dob = dob;
    candidate.logo = logo;
    candidate.birthplace = birthplace;
  
    // Update the state with the new candidate data
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(candidate))));
  
    return JSON.stringify(candidate);
  }
  

  async createElection(ctx, electionID, status, startDate) {
    const key = `election-${electionID}`;
    const election = { electionID, status, startDate, winner: null };
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(election))));
    return JSON.stringify(election);
  }

  async closeElection(ctx, electionID) {
    const key = `election-${electionID}`;
    const electionAsBytes = await ctx.stub.getState(key);
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`);
    }
    const election = JSON.parse(electionAsBytes.toString());
    election.status = "closed";
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(election))));
    return `Election ${electionID} has been closed`;
  }

  async resetElection(ctx, electionID) {
    const key = `election-${electionID}`;
    const electionAsBytes = await ctx.stub.getState(key);

    // Check if the election exists
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`);
    }

    // Parse the election data
    const election = JSON.parse(electionAsBytes.toString());

    // If a winner is declared, you cannot reset the election
    if (election.winner) {
      throw new Error("Election cannot be reset after a winner is declared.");
    }

    // Change election status to "open"
    election.status = "open";

    // Save the updated election status
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(election))));

    // Delete the election from the ledger
    await ctx.stub.deleteState(key);

    return `Election ${electionID} has been reset and deleted`;
  }


  async declareWinner(ctx, electionID) {
    const iterator = await ctx.stub.getStateByRange('candidate-', 'candidate~');
    let winner = null;
    let maxVotes = 0;
    for await (const result of iterator) {
      const candidate = JSON.parse(result.value.value.toString());
      if (candidate.role === 'candidate' && candidate.votes > maxVotes) {
        maxVotes = candidate.votes;
        winner = candidate.did;
      }
    }
    const electionKey = `election-${electionID}`;
    const electionAsBytes = await ctx.stub.getState(electionKey);
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`);
    }
    const election = JSON.parse(electionAsBytes.toString());
    election.winner = winner;
    await ctx.stub.putState(electionKey, Buffer.from(stringify(sortKeysRecursive(election))));
    return `Winner of the election ${electionID} is Candidate ${winner}`;
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

  /** ******************************
   * ✅ USER FUNCTIONS
   ****************************** **/

  async registerUser(ctx, did, name, dob, birthplace, userName, hashedPassword) {
    // Define the key for storing user data in the ledger
    const key = `user-${did}`;
  
    // Create the user object
    const user = {
      did,               // User DID (Decentralized Identifier)
      name,              // User's name
      dob,               // Date of Birth
      birthplace,        // Place of Birth
      userName,          // Username
      password: hashedPassword,  // Hashed password (for security reasons)
      role: "user",      // Role of the user (default is 'user')
      voted: false       // Initially, the user has not voted
    };
  
    // Store the user object on the blockchain (ledger)
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
  
    // Return the user object as a confirmation (optional)
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

  async castVote(ctx, did, candidateDid, electionID) {
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
      throw new Error(`User ${did} has already voted`);
    }
    const candidateKey = `candidate-${candidateDid}`;
    const candidateAsBytes = await ctx.stub.getState(candidateKey);
    if (!candidateAsBytes || candidateAsBytes.length === 0) {
      throw new Error(`Candidate with DID ${candidateDid} does not exist`);
    }
    const candidate = JSON.parse(candidateAsBytes.toString());
    candidate.votes += 1;
    user.voted = true;
    await ctx.stub.putState(userKey, Buffer.from(stringify(sortKeysRecursive(user))));
    await ctx.stub.putState(candidateKey, Buffer.from(stringify(sortKeysRecursive(candidate))));
    return `Vote cast successfully for candidate ${candidateDid}`;
  }

  async seeWinner(ctx, electionID) {
    const key = `election-${electionID}`;
    const electionAsBytes = await ctx.stub.getState(key);
    if (!electionAsBytes || electionAsBytes.length === 0) {
      throw new Error(`Election with ID ${electionID} does not exist`);
    }
    return electionAsBytes.toString();
  }

  async getPersonalInfo(ctx, did) {
    const key = `user-${did}`;
    console.log("Fetching personal info for DID:", did);  // Log the DID
    const userAsBytes = await ctx.stub.getState(key);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User with DID ${did} does not exist`);
    }
    console.log("User data found:", userAsBytes.toString());  // Log the retrieved data
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
    async getTotalCandidatesCount(ctx) {
      let count = 0;
      const iterator = await ctx.stub.getStateByRange('candidate-', 'candidate~');  // Range query to get all candidate keys
      let result = await iterator.next();

      // Iterate through all the candidates in the world state
      while (!result.done) {
          // Check to ensure the result is valid before parsing
          if (result.value && result.value.value) {
              try {
                  const candidate = JSON.parse(result.value.value.toString());  // Parse the candidate data
                  if (candidate.role === 'candidate') {  // Ensure it's a candidate
                      count++;
                  }
              } catch (err) {
                  console.error('Error parsing candidate data:', err);
              }
          }
          result = await iterator.next(); // Move to the next result
      }

      await iterator.close();  // Close the iterator
      return { totalCandidates: count };  // Return the count of candidates
  }

  async getTotalVotersCount(ctx) {
      let count = 0;
      const iterator = await ctx.stub.getStateByRange('user-', 'user~');  // Range query to get all voter keys
      let result = await iterator.next();

      // Iterate through all the voters in the world state
      while (!result.done) {
          // Check to ensure the result is valid before parsing
          if (result.value && result.value.value) {
              try {
                  const user = JSON.parse(result.value.value.toString());  // Parse the user data
                  if (user.role === 'user') {  // Ensure it's a user (voter)
                      count++;
                  }
              } catch (err) {
                  console.error('Error parsing user data:', err);
              }
          }
          result = await iterator.next(); // Move to the next result
      }

      await iterator.close();  // Close the iterator
      return { totalVoters: count };  // Return the count of voters
  }

  async getTotalVoteCount(ctx) {
      let totalVotes = 0;
      const iterator = await ctx.stub.getStateByRange('candidate-', 'candidate~');  // Range query to get all candidate keys
      let result = await iterator.next();

      // Iterate through all the candidates to sum up their votes
      while (!result.done) {
          // Check to ensure the result is valid before parsing
          if (result.value && result.value.value) {
              try {
                  const candidate = JSON.parse(result.value.value.toString());  // Parse the candidate data
                  if (candidate.role === 'candidate') {  // Ensure it's a candidate
                      totalVotes += candidate.votes;  // Add up the votes of each candidate
                  }
              } catch (err) {
                  console.error('Error parsing candidate data:', err);
              }
          }
          result = await iterator.next(); // Move to the next result
      }

      await iterator.close();  // Close the iterator
      return { totalVoteCount: totalVotes };  // Return the total sum of votes
  }
}

module.exports = VotingContract;
