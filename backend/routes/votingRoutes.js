// routes/votingRoutes.js

import express from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import * as controller from '../controllers/votingController.js'; // ✅ Only one clean import

const router = express.Router();

// 🔐 User Management
router.post('/register', upload.single('image'), controller.registerUser);
router.post('/login', controller.login);
router.put('/profile', verifyToken, upload.single('image'), controller.updateProfile);
router.get('/profile/:role/:did', verifyToken, controller.getUserProfile);
router.get('/users/all', verifyToken, controller.listAllUsers);
router.put('/change-password', verifyToken, controller.changePassword);
router.delete('/user/:role/:did', verifyToken, authorizeRoles('admin'), controller.deleteUser);
router.put('/assign-role', verifyToken, authorizeRoles('admin'), controller.assignRole);

// 🗳️ Election Management
router.post('/election', verifyToken, controller.createElection);
router.get('/elections', controller.getAllElections);
router.get('/elections/calendar', controller.getCalendar);
router.get('/election/:electionId', controller.viewElectionDetails);
router.put('/election/:electionId', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.updateElectionDetails);
router.delete('/election/:electionId', verifyToken, controller.deleteElection);
router.post('/election/candidate/add', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.addCandidateToElection);
router.post('/election/candidate/remove', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.removeCandidateFromElection);
router.post('/election/winner', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.declareWinner);
router.get('/election/:electionId/results', controller.getVotingResult);
router.get('/election/:electionId/history', verifyToken, controller.getElectionHistory);
router.get('/election/:electionId/voters', verifyToken, controller.getElectionVoters);
router.get('/election/:electionId/voter-count', controller.getElectionVoterCount);
router.get('/election/:electionId/vote-count', controller.getElectionVoteCount);
router.get('/election/:electionId/voter-history', controller.getElectionVoterHistory);
router.get('/election/:electionId/vote-history', controller.getElectionVoteHistory);
router.get('/election/:electionId/notifications', controller.getElectionNotifications);
router.get('/elections/running', controller.filterRunningElections);

// 👤 Candidate Management
router.post('/candidacy/apply', verifyToken, controller.applyForCandidacy);
router.get('/candidacy/list', verifyToken, controller.listAllCandidateApplications);
router.post('/candidacy/approve', verifyToken, controller.approveCandidacy);
router.post('/candidacy/reject', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.rejectCandidacy);
router.post('/candidacy/withdraw', verifyToken, controller.withdrawCandidacy);
router.get('/candidacy/:electionId', controller.listAllCandidateApplications);
router.get('/candidates/approved/:electionId', controller.getApprovedCandidates);
router.get('/candidate/:did', controller.getCandidateProfile);
router.put('/candidate/update', verifyToken, upload.single('image'), controller.updateCandidateProfile);
router.delete('/candidate/:did', verifyToken, authorizeRoles('admin'), controller.deleteCandidate);
router.get('/candidates', controller.listAllCandidates);
router.get('/candidate/:did/votes', controller.getCandidateVoteCount);
router.get('/candidate/:did/history', verifyToken, controller.getCandidateHistory);
router.get('/candidate/:did/notifications', controller.getCandidateNotifications);

// 🗳️ Voting
router.post('/vote', verifyToken, controller.castVote);
router.get('/vote/result/:electionId', controller.getVotingResult);
router.get('/vote/count/all', controller.getTotalVotes);
router.get('/vote/receipt/:electionId/:voterDid', verifyToken, controller.getVoteReceipt);
router.get('/vote/has-voted/:electionId/:voterDid', verifyToken, controller.hasVoted);
router.get('/vote/voted/:voterDid', verifyToken, controller.listVotedElections);
router.get('/vote/unvoted/:voterDid', verifyToken, controller.listUnvotedElections);
router.get('/vote/turnout/:electionId', controller.getTurnoutRate);
router.get('/vote/history/:voterDid', verifyToken, controller.getVotingHistory);
router.get('/vote/election-history/:electionId', controller.getVoteHistory);
router.get('/vote/notifications/:voterDid', verifyToken, controller.getVoteNotifications);
router.get('/vote-count/:electionId', controller.getVoteCount);
router.get('/voter-count/:electionId', controller.getVoterCount);

// 📣 Complaints
router.post('/complaint', verifyToken, controller.submitComplain);
router.post('/complaint/reply', verifyToken, controller.replyToComplaint);
router.get('/complaints', controller.viewComplaints);
router.get('/complaints/user/:did', controller.listComplaintsByUser);
router.delete('/complaint/:complaintId', verifyToken, authorizeRoles('admin'), controller.deleteComplaint);

// 📊 Logs and Reports
router.get("/logs", verifyToken, controller.viewAuditLogs);
router.get('/logs/:did', verifyToken,  controller.searchAuditLogsByUser);
router.get('/report/election/:electionId', controller.generateElectionReport);
router.get('/report/download', verifyToken, controller.downloadAuditReport);

// ⚠️ System Management
router.post('/system/reset', verifyToken, authorizeRoles('admin'), controller.resetSystem);

// Export router
export default router;
