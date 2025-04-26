// routes/votingRoutes.js
import express from 'express';
import * as controller from '../controllers/votingController.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router();
import { updateElectionDetails } from '../controllers/votingController.js';

;

// 🔐 User Management
router.post('/register', upload.single('image'), controller.registerUser); // image as 'image' field
router.post('/login', controller.login);
router.put('/profile', verifyToken, upload.single('image'), controller.updateProfile);
router.get('/profile/:role/:did', verifyToken, controller.getUserProfile);
router.get('/users/all', verifyToken, controller.listAllUsers);  // To get all users
router.put('/change-password', verifyToken, controller.changePassword);
router.delete('/user/:role/:did', verifyToken, authorizeRoles('admin'), controller.deleteUser);
router.put('/assign-role', verifyToken, authorizeRoles('admin'), controller.assignRole);

// 🗳️ Election Management
router.post('/election', verifyToken, authorizeRoles('admin','electioncommunity'), controller.createElection);
router.post('/election/el', verifyToken, authorizeRoles('electioncommunity'), controller.createElection);

router.get('/elections', controller.getAllElections);
router.get('/elections/upcoming', controller.filterUpcomingElections);
router.get('/elections/calendar', controller.getCalendar);
router.get('/election/:electionId', controller.viewElectionDetails);

router.put('/api/voting/election/update/:electionId', updateElectionDetails);

router.delete('/election/:electionId', verifyToken, authorizeRoles('admin'), controller.deleteElection);
router.post('/election/candidate/add', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.addCandidateToElection);
router.post('/election/candidate/remove', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.removeCandidateFromElection);
router.post('/election/winner', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.declareWinner);

router.get('/election/:electionId/results', controller.getElectionResults);
router.get('/election/:electionId/history', verifyToken, controller.getElectionHistory);
router.get('/election/:electionId/voters', verifyToken, controller.getElectionVoters);
router.get('/election/:electionId/voter-count', controller.getElectionVoterCount);
router.get('/election/:electionId/vote-count', controller.getElectionVoteCount);
router.get('/election/:electionId/voter-history', controller.getElectionVoterHistory);
router.get('/election/:electionId/vote-history', controller.getElectionVoteHistory);
router.get('/election/:electionId/notifications', controller.getElectionNotifications);

// 👤 Candidate Management
router.post('/candidacy/apply', verifyToken, controller.applyForCandidacy);
router.post('/candidacy/approve', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.approveCandidacy);
router.post('/candidacy/reject', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.rejectCandidacy);
router.post('/candidacy/withdraw', verifyToken, controller.withdrawCandidacy);
router.get('/candidacy/:electionId', controller.listCandidateApplications);
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
router.get('/vote/count/:electionId', controller.countVotes);
router.get('/vote/result/:electionId', controller.getVotingResult);
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
router.post('/complaint/reply', verifyToken, authorizeRoles('admin', 'electioncommunity'), controller.replyToComplaint);
router.get('/complaints', controller.viewComplaints);
router.get('/complaints/user/:did', controller.listComplaintsByUser);
router.delete('/complaint/:complaintId', verifyToken, authorizeRoles('admin'), controller.deleteComplaint);

// 📊 Logs and Reports
router.get('/logs', verifyToken, authorizeRoles('admin'), controller.viewAuditLogs);
router.get('/logs/:did', verifyToken, authorizeRoles('admin'), controller.searchAuditLogsByUser);
router.get('/report/election/:electionId', controller.generateElectionReport);
router.get('/report/download', verifyToken, authorizeRoles('admin'), controller.downloadAuditReport);

// ⚠️ System
router.post('/system/reset', verifyToken, authorizeRoles('admin'), controller.resetSystem);

export default router;
