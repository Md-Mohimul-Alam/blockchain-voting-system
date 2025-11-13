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







# eVoting System using Hyperledger Fabric

A secure, transparent, and decentralized electronic voting platform built with **Hyperledger Fabric**, **React.js**, **Node.js**, and **MongoDB**. The system supports multiple user roles—**Admin**, **Election Commission**, **Voter**, and **Candidate**—with features including vote casting, candidacy application, complaint handling, result declaration, and role-based dashboards.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Chaincode Functions](#chaincode-functions)
- [API Routes](#api-routes)
- [Screenshots](#screenshots)
- [License](#license)

---

## Features

- Role-based authentication with JWT
- Election creation and management
- Secure vote casting (one person, one vote)
- Auto-declaration of winners
- Candidacy application and registration
- Complaint submission and response system
- Real-time results and audit logging
- Image upload for profiles and verification
- Protected admin routes and dashboard access

_____


---

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router
- Lucide Icons

### Backend
- Node.js
- Express.js
- JWT Authentication
- Multer (Image Upload)
- MongoDB Atlas

### Blockchain
- Hyperledger Fabric v2.x
- Chaincode in JavaScript
- Fabric CA for identity management

---

## Installation

### Prerequisites

- Node.js >= 16
- Docker & Docker Compose
- Hyperledger Fabric binaries & Docker images
- MongoDB (local or Atlas)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/evoting-hyperledger.git
   cd evoting-hyperledger

Set up Hyperledger Fabric network:
cd fabric-network/test-network
./network.sh up createChannel -c mychannel -ca -s couchdb 

cahincode installation::
./network.sh deployCC -ccn voting-contract -ccp ../chaincode2 -ccl javascript
./network.sh deployCC -ccn voting-contract -ccp ../Chaincode2/javascript/ -ccl javascript -ccv 2.0 -ccs 2

Start Backend Server:
cd backend
npm install
npm run dev

Run Frontend (React):
cd frontend
npm install
npm run dev



Chaincode Functions (Smart Contract)

    registerUser()

    loginUser()

    createElection()

    applyForCandidacy()

    castVote()

    getAllElections()

    getElectionResult()

    submitComplaint()

    replyToComplaint()

    listComplaintsByUser()

    resetSystem()

REST API Routes

    Base URL: http://localhost:5001/api

Method	Endpoint	Description
POST	/auth/register	Register a user with image
POST	/auth/login	Authenticate user and return token
POST	/elections/create	Create new election (admin only)
GET	    /elections	Get all elections
POST	/elections/apply-candidacy	Apply for candidacy
POST	/elections/cast-vote	Cast a vote
POST	/complaints/submit	Submit complaint
POST	/complaints/reply	Admin replies to complaint
