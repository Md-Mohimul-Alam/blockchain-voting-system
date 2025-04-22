# Project Overview


🔹 What This System Will Do?

This Blockchain Voting System will:
✅ Verify voter identity using Election Community digital credentials.
✅ Allow secure voting through blockchain smart contracts.
✅ Ensure transparent election results that cannot be altered.
✅ Follow Election Community regulations to make blockchain voting legally acceptable.


📌 2. System Architecture Diagram
🛠 Workflow of the System

1️⃣ Voter Registration:

    Government issues Verifiable Credentials (VCs) to eligible voters.
    Voter creates a Decentralized Identifier (DID) using Hyperledger Indy.

2️⃣ Voter Authentication:

    When a voter logs in, their identity is verified using Hyperledger Aries.
    If valid, they proceed to vote; otherwise, they cannot access the voting system.

3️⃣ Casting the Vote:

    Voter selects a candidate and submits their vote.
    Smart contracts (Chaincode) store the vote on Hyperledger Fabric.

4️⃣ Vote Counting & Transparency:

    The system automatically counts votes in real-time.
    No tampering is possible since votes are stored securely on blockchain.

5️⃣ Results Announcement:

    Election results are publicly available for verification.
    Any person can audit the blockchain to check election integrity.

📌 This process ensures a secure, fair, and government-compliant election.







📌 Features Implemented
    Admin Functions
        RegisterAdmin(did, UserName, DOB, Password) → 
        Login(did, UserName, DOB, Password) → Admin login
        UpdateAdmin(UserName, DOB, Password) → Update admin details
        GetAllVoters() → Retrieve all voters
        GetAllCandidates() → Retrieve all candidates
        CreateCandidate(did, Name, DOB, Logo, Birthplace) → Register a new candidate
        DeleteCandidate(did) → Remove a candidate
        UpdateCandidate(did, Name, DOB, Logo, Birthplace) → Update candidate details
        SeeVoteCount() → View votes for each candidate
        CloseElection() → End election process
        ResetElection() → Reset election data
        DeclareWinner() → Announce election winner
    User Functions
        RegisterUser(did, Name, DOB, Birthplace, UserName, Password) → Register a voter
        LoginUser(did, UserName, DOB, Password) → Voter login
        GetAllCandidates() → Retrieve all candidates
        CastVote(did, candidateDid) → Vote for a candidate
        SeeWinner() → View election winner
        SeeVoteCount() → View votes for each candidate
        GetPersonalInfo(did) → View personal details
        UpdatePersonalInfo(did, Name, DOB, Birthplace, UserName, Password) → Update voter details
