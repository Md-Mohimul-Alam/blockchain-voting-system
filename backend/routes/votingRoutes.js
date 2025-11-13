import express from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import * as controller from '../controllers/votingController.js';
import { getContractSmart } from '../config/fabricConfig.js'; // ✅ ADDED IMPORT

const router = express.Router();

// ==================== HEALTH CHECK & TEST ROUTES ====================
router.get('/health', controller.healthCheck);
router.get('/test', controller.testChaincode);

// ==================== USER MANAGEMENT ROUTES ====================
router.post('/register', upload.single('image'), controller.registerUser);
router.post('/login', controller.login);
router.put('/profile', verifyToken, upload.single('image'), controller.updateProfile);
router.get('/profile/:role/:did', verifyToken, controller.getUserProfile);
router.get('/users/all', verifyToken, controller.listAllUsers);
router.get('/users/real', verifyToken, controller.getAllRealUsers);
router.get('/users/role/:role', verifyToken, controller.listAllUsersByRole);
router.put('/change-password', verifyToken, controller.changePassword);
router.delete('/user/:role/:did', verifyToken, authorizeRoles('Admin'), controller.deleteUser);
router.put('/assign-role', verifyToken, authorizeRoles('Admin'), controller.assignRole);

// ==================== ELECTION MANAGEMENT ROUTES ====================
router.post('/election', verifyToken, authorizeRoles('Admin', 'ElectionCommission'), controller.createElection);
router.get('/elections', controller.getAllElections);
router.get('/elections/calendar', controller.getCalendar);
router.get('/election/:electionId', controller.viewElectionDetails);
router.put('/election/:electionId', verifyToken, authorizeRoles('Admin', 'ElectionCommission'), controller.updateElectionDetails);
router.delete('/election/:electionId', verifyToken, authorizeRoles('Admin', 'ElectionCommission'), controller.deleteElection);
// Enhanced election routes with auto winner declaration
router.get('/election/:electionId/results/auto', controller.getElectionResultsWithAutoProcess);
router.post('/election/:electionId/declare-winner', verifyToken, authorizeRoles('Admin', 'ElectionCommission'), controller.forceDeclareWinner);
router.get('/election/:electionId/results/enhanced', controller.getElectionResults);

router.get('/election/:electionId/voter-count', controller.getElectionVoterCount);
router.get('/election/:electionId/vote-count', controller.getElectionVoteCount);
router.get('/election/:electionId/count-votes', controller.countVotes);
router.get('/election/:electionId/notifications', controller.getElectionNotifications);
router.get('/elections/running', controller.filterRunningElections);
router.get('/elections/upcoming', controller.filterUpcomingElections);

// ==================== CANDIDATE MANAGEMENT ROUTES ====================
router.post('/candidacy/apply', verifyToken, controller.applyForCandidacy);
router.get('/candidacy/applications', verifyToken, controller.listAllCandidateApplications);
router.get('/candidacy/applications/all', verifyToken, controller.listCandidateApplications);
router.get('/candidacy/applications/pending', verifyToken, controller.getPendingApplications);
router.get('/candidacy/applications/status/:status', verifyToken, controller.getCandidateApplicationsByStatus);
router.get('/candidacy/applications/election/:electionId', verifyToken, controller.getCandidateApplicationsByElection);
router.get('/candidacy/application/status/:electionId/:did', verifyToken, controller.getCandidateApplicationStatus);
router.post('/candidacy/approve', verifyToken, authorizeRoles('Admin', 'ElectionCommission'), controller.approveCandidacy);
router.post('/candidacy/bulk-approve', verifyToken, authorizeRoles('Admin', 'ElectionCommission'), controller.bulkApproveCandidates);
router.post('/candidacy/reject', verifyToken, authorizeRoles('Admin', 'ElectionCommission'), controller.rejectCandidacy);
router.post('/candidacy/withdraw', verifyToken, controller.withdrawCandidacy);
router.get('/candidates/approved/:electionId', controller.getApprovedCandidates);
router.get('/candidate/:did', controller.getCandidateProfile);
router.put('/candidate/profile', verifyToken, upload.single('image'), controller.updateCandidateProfile);
router.delete('/candidate/:did', verifyToken, authorizeRoles('Admin'), controller.deleteCandidate);
router.get('/candidates/all', controller.listAllCandidates);
router.get('/candidate/:did/vote-count', controller.getCandidateVoteCount);
router.get('/candidate/:did/notifications', controller.getCandidateNotifications);

// ==================== VOTING ROUTES ====================
router.post('/vote', verifyToken, controller.castVote);
router.post('/vote/enhanced', verifyToken, controller.castVoteEnhanced);
router.get('/vote/total', controller.getTotalVotes);
router.get('/vote/receipt/:electionId/:voterDid', verifyToken, controller.getVoteReceipt);
router.get('/vote/status/:electionId/:voterDid', verifyToken, controller.hasVoted);
router.get('/vote/voted-elections/:voterDid', verifyToken, controller.listVotedElections);
router.get('/vote/unvoted-elections/:voterDid', verifyToken, controller.listUnvotedElections);
router.get('/vote/turnout/:electionId', controller.getTurnoutRate);
router.get('/vote/history/:voterDid', verifyToken, controller.getVotingHistory);
router.get('/vote/election-history/:electionId', controller.getVoteHistory);
router.get('/vote/notifications/:voterDid', verifyToken, controller.getVoteNotifications);

// ==================== COMPLAINT ROUTES ====================
router.post('/complaint', verifyToken, controller.submitComplain);
router.post('/complaint/reply', verifyToken, authorizeRoles('Admin', 'ElectionCommission'), controller.replyToComplaint);
router.get('/complaints', verifyToken, controller.viewComplaints);
router.get('/complaints/user/:did', verifyToken, controller.listComplaintsByUser);
router.delete('/complaint/:complaintId', verifyToken, authorizeRoles('Admin'), controller.deleteComplaint);

// ==================== LOGS & REPORTS ROUTES ====================
router.get('/logs/audit', verifyToken, controller.viewAuditLogs);
router.get('/logs/user/:did', verifyToken, controller.searchAuditLogsByUser);
router.get('/report/election/:electionId', controller.generateElectionReport);
router.get('/report/audit', verifyToken, controller.downloadAuditReport);

// ==================== ANALYTICS & PERFORMANCE ROUTES ====================
router.get('/analytics/performance', controller.getSystemPerformance);
router.get('/analytics/system', controller.getSystemAnalytics);
router.get('/analytics/security', verifyToken, controller.getSecurityAuditReport);

// ==================== SYSTEM METRICS ROUTES ====================
router.get('/metrics/uptime', controller.getSystemUptime);
router.get('/metrics/performance', controller.getSystemPerformanceMetrics);
router.get('/metrics/storage', controller.getStorageUsage);
router.get('/metrics/security', controller.getSecurityMetrics);
router.get('/metrics/health', controller.getSystemHealth);
router.get('/metrics/all', controller.getSystemMetrics);
router.get('/metrics/live', controller.getLiveSystemMetrics);
router.get('/metrics/history', controller.getSystemMetricsHistory);
router.get('/metrics/alerts', controller.getSystemAlerts);

// ==================== SYSTEM MANAGEMENT ROUTES ====================
router.post('/system/reset', verifyToken, authorizeRoles('Admin'), controller.resetSystem);
router.post('/system/archive-elections', verifyToken, authorizeRoles('Admin'), controller.archiveEndedElections);

// ==================== EMERGENCY PASSWORD RESET ROUTE ====================
// In your backend controller - FIXED VERSION
router.post('/candidate/reset-password/:did', verifyToken, authorizeRoles('Admin'), async (req, res) => {
    try {
        const { did } = req.params;
        const { newPassword = "12345678" } = req.body;
        
        console.log(`🔐 Resetting password for candidate: ${did}`);
        
        const contract = await getContractSmart();
        
        // Combine parameters into one string
        const combinedParam = `${did}:${newPassword}`;
        
        const result = await contract.submitTransaction("resetCandidatePassword", combinedParam);
        const response = JSON.parse(result.toString());
        
        res.json({
            success: true,
            data: response,
            message: "Candidate password reset successfully"
        });
    } catch (error) {
        console.error("Error resetting candidate password:", error);
        res.status(500).json({
            success: false,
            error: "Failed to reset candidate password",
            message: error.message
        });
    }
});

export default router;