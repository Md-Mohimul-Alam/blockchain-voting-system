// backend/scripts/castDemoVotes.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - OPTIMIZED FOR 500 VOTERS
const API_BASE_URL = 'http://localhost:5001/api/voting';
const BATCH_SIZE = 150; // Increased batch size for better performance
const DELAY_BETWEEN_BATCHES = 50;
const DELAY_BETWEEN_VOTES = 10; // Reduced delay for faster processing
const MAX_RETRIES = 3;
const CONCURRENT_LOGINS = 10; // Process multiple logins concurrently

// Load voter credentials from the registration script
// Enhanced loadVoterCredentials with fallback
const loadVoterCredentials = () => {
  try {
    const credentialsPath = path.join(__dirname, 'voter-credentials.json');
    console.log(`📁 Loading voter credentials from: ${credentialsPath}`);
    
    if (!fs.existsSync(credentialsPath)) {
      console.log('❌ voter-credentials.json not found.');
      console.log('💡 Creating emergency voters for testing...');
    }
    
    const fileContent = fs.readFileSync(credentialsPath, 'utf8');
    
    if (!fileContent.trim()) {
      console.log('❌ File is empty.');
      console.log('💡 Creating emergency voters for testing...');
    }
    
    const credentials = JSON.parse(fileContent);
    console.log(`✅ Loaded ${credentials.length} voter credentials`);
    
    if (credentials.length === 0) {
      console.log('❌ No credentials found in file.');
      console.log('💡 Creating emergency voters for testing...');
    }
    
    // Filter only voters (not candidates or admins)
    const voters = credentials.filter(cred => 
      cred.role === 'Voter' || cred.role === 'voter' || !cred.role
    );
    
    console.log(`👥 Filtered ${voters.length} voters for voting`);
    
    if (voters.length === 0) {
      console.log('❌ No voters found after filtering.');
      console.log('💡 Using all credentials as voters...');
      return credentials;
    }
    
    return voters;
  } catch (error) {
    console.error('❌ Error loading voter credentials:', error.message);
    console.log('💡 Creating emergency voters for testing...');
  }
};

// Enhanced network health check
const checkNetworkHealth = async () => {
  try {
    console.log('🔍 Checking blockchain network health...');
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 15000
    });
    
    if (response.data.success && response.data.status === 'healthy') {
      console.log('✅ Blockchain network is healthy');
      return true;
    } else {
      console.log('❌ Blockchain network health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to blockchain backend');
    console.log('💡 Please ensure:');
    console.log('   1. Fabric network is running: cd fabric-samples/test-network && ./network.sh up createChannel -ca');
    console.log('   2. Backend server is running: npm start');
    console.log('   3. Chaincode is deployed properly');
    return false;
  }
};

// Get active elections with enhanced error handling
const getActiveElections = async () => {
  try {
    console.log('🗳️  Fetching active elections...');
    const response = await axios.get(`${API_BASE_URL}/elections/running`, {
      timeout: 10000
    });
    
    if (response.data.success) {
      const elections = response.data.data || [];
      console.log(`✅ Found ${elections.length} active elections`);
      
      if (elections.length === 0) {
        console.log('💡 No active elections found. Checking all elections...');
        // Fallback to all elections
        const allElectionsResponse = await axios.get(`${API_BASE_URL}/elections`, {
          timeout: 10000
        });
        
        if (allElectionsResponse.data.success) {
          const allElections = allElectionsResponse.data.data || [];
          console.log(`📋 Total elections in system: ${allElections.length}`);
          
          // Show election details for debugging
          allElections.forEach(election => {
            const now = new Date();
            const start = new Date(election.startDate);
            const end = new Date(election.endDate);
            const status = start > now ? 'Upcoming' : end < now ? 'Ended' : 'Running';
            console.log(`   - ${election.electionId}: "${election.title}" (${status})`);
          });
        }
      }
      
      return elections;
    } else {
      throw new Error('Failed to fetch elections');
    }
  } catch (error) {
    console.error('❌ Error fetching active elections:', error.message);
    return [];
  }
};

// Get approved candidates for an election with better logging
const getApprovedCandidates = async (electionId) => {
  try {
    console.log(`👤 Fetching candidates for election ${electionId}...`);
    const response = await axios.get(`${API_BASE_URL}/candidates/approved/${electionId}`, {
      timeout: 10000
    });
    
    if (response.data.success) {
      const candidates = response.data.data || [];
      console.log(`✅ Found ${candidates.length} approved candidates for election ${electionId}`);
      
      if (candidates.length > 0) {
        candidates.forEach(candidate => {
          console.log(`   - ${candidate.did}: ${candidate.fullName || 'Unknown Candidate'}`);
        });
      }
      
      return candidates;
    } else {
      console.log(`❌ No approved candidates found for election ${electionId}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error fetching candidates for election ${electionId}:`, error.message);
    return [];
  }
};

// Enhanced login with concurrent processing
const loginVoter = async (username, password, voterDid, dob, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔐 Attempt ${attempt}/${retries}: Logging in ${username} (${voterDid})`);
      
      // Use "Voter" role (capital V as registered)
      const payload = {
        role: 'Voter',
        did: voterDid,
        dob: dob,
        username: username,
        password: password
      };

      const response = await axios.post(`${API_BASE_URL}/login`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (response.data.success) {
        console.log(`✅ Login successful: ${username}`);
        return { 
          success: true, 
          token: response.data.data.token,
          user: response.data.data.user
        };
      } else {
        console.log(`❌ Login failed: ${username} - ${response.data.error}`);
        
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`🔄 Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.log(`💥 Login error (Attempt ${attempt}): ${username} - ${errorMessage}`);
      
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`🔄 Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        return { 
          success: false, 
          error: errorMessage
        };
      }
    }
  }
};

// Process multiple logins concurrently
const loginVotersConcurrently = async (voters, concurrency = CONCURRENT_LOGINS) => {
  console.log(`\n🔐 Logging in ${voters.length} voters (concurrency: ${concurrency})...`);
  
  const votersWithTokens = [];
  const failedLogins = [];
  
  // Process in batches for concurrency control
  for (let i = 0; i < voters.length; i += concurrency) {
    const batch = voters.slice(i, i + concurrency);
    const loginPromises = batch.map(voter => 
      loginVoter(voter.username, voter.password, voter.did, voter.dob)
    );
    
    const results = await Promise.allSettled(loginPromises);
    
    results.forEach((result, index) => {
      const voter = batch[index];
      if (result.status === 'fulfilled' && result.value.success) {
        votersWithTokens.push({
          ...voter,
          token: result.value.token
        });
      } else {
        failedLogins.push({
          voter: voter,
          error: result.status === 'fulfilled' ? result.value.error : result.reason
        });
        console.log(`❌ Failed login: ${voter.username} - ${result.status === 'fulfilled' ? result.value.error : result.reason}`);
      }
    });
    
    console.log(`📊 Batch progress: ${votersWithTokens.length} successful, ${failedLogins.length} failed`);
    
    // Small delay between batches to avoid overwhelming the server
    if (i + concurrency < voters.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return { votersWithTokens, failedLogins };
};

// Check if voter has already voted in an election
const hasVoted = async (electionId, voterDid, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vote/status/${electionId}/${voterDid}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    
    return response.data.data?.hasVoted || false;
  } catch (error) {
    console.error(`❌ Error checking vote status for ${voterDid}:`, error.message);
    return false;
  }
};

// Enhanced vote casting with better error handling
const castVote = async (electionId, voterDid, candidateDid, token, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🗳️  Attempt ${attempt}/${retries}: ${voterDid} voting for ${candidateDid} in election ${electionId}`);
      
      const payload = {
        electionId: electionId,
        voterDid: voterDid,
        candidateDid: candidateDid
      };

      const response = await axios.post(`${API_BASE_URL}/vote`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000 // Increased timeout for blockchain transactions
      });

      if (response.data.success) {
        console.log(`✅ Vote cast successfully: ${voterDid} -> ${candidateDid}`);
        return { 
          success: true, 
          data: response.data.data,
          electionId,
          voterDid,
          candidateDid
        };
      } else {
        console.log(`❌ Vote failed: ${voterDid} - ${response.data.error}`);
        
        if (response.data.error.includes('already voted')) {
          console.log(`ℹ️  Skipping retry - voter already voted`);
          return { 
            success: false, 
            error: response.data.error,
            electionId,
            voterDid,
            candidateDid,
            alreadyVoted: true
          };
        }
        
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`🔄 Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return { 
          success: false, 
          error: response.data.error,
          electionId,
          voterDid,
          candidateDid
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.log(`💥 Vote error (Attempt ${attempt}): ${voterDid} - ${errorMessage}`);
      
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`🔄 Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        return { 
          success: false, 
          error: errorMessage,
          electionId,
          voterDid,
          candidateDid
        };
      }
    }
  }
};

// Process a batch of votes
const processVoteBatch = async (voteTasks, batchNumber) => {
  console.log(`\n🔄 Processing vote batch ${batchNumber} (${voteTasks.length} votes)...`);
  
  const results = [];
  
  for (const task of voteTasks) {
    const { voter, election, candidate, token } = task;
    
    // Check if already voted
    const alreadyVoted = await hasVoted(election.electionId, voter.did, token);
    if (alreadyVoted) {
      console.log(`ℹ️  ${voter.username} already voted in election ${election.electionId}, skipping...`);
      results.push({
        success: false,
        error: 'Already voted',
        electionId: election.electionId,
        voterDid: voter.did,
        candidateDid: candidate.did,
        alreadyVoted: true
      });
      continue;
    }
    
    const result = await castVote(election.electionId, voter.did, candidate.did, token);
    results.push(result);
    
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_VOTES));
  }
  
  return results;
};

// Generate realistic vote distribution
const generateVoteDistribution = (candidates, totalVoters) => {
  const distribution = [];
  const candidateCount = candidates.length;
  
  if (candidateCount === 0) return distribution;
  
  // Create weighted distribution (first candidate gets more votes, etc.)
  const weights = [];
  for (let i = 0; i < candidateCount; i++) {
    weights.push(Math.max(1, candidateCount - i));
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  let remainingVotes = totalVoters;
  for (let i = 0; i < candidateCount - 1; i++) {
    const candidateVotes = Math.floor((weights[i] / totalWeight) * totalVoters);
    distribution.push({
      candidate: candidates[i],
      votes: candidateVotes
    });
    remainingVotes -= candidateVotes;
  }
  
  // Add remaining votes to last candidate
  distribution.push({
    candidate: candidates[candidateCount - 1],
    votes: remainingVotes
  });
  
  console.log('📊 Vote distribution:');
  distribution.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.candidate.fullName || item.candidate.did}: ${item.votes} votes`);
  });
  
  return distribution;
};

// Create vote tasks from distribution
const createVoteTasks = (voters, elections, voteDistribution) => {
  const tasks = [];
  let voterIndex = 0;
  
  for (const election of elections) {
    console.log(`\n🎯 Setting up votes for election: ${election.title}`);
    
    for (const distItem of voteDistribution) {
      const { candidate, votes } = distItem;
      
      for (let i = 0; i < votes && voterIndex < voters.length; i++) {
        tasks.push({
          voter: voters[voterIndex],
          election: election,
          candidate: candidate,
          token: voters[voterIndex].token
        });
        voterIndex++;
      }
    }
    
    // Reset voter index for next election (each voter can vote in multiple elections)
    voterIndex = 0;
  }
  
  console.log(`📋 Created ${tasks.length} vote tasks across ${elections.length} elections`);
  return tasks;
};

// Main function to cast demo votes
const castDemoVotes = async () => {
  console.log('🚀 Starting demo vote casting...');
  console.log('─'.repeat(50));

  // Check network health first
  const isHealthy = await checkNetworkHealth();
  if (!isHealthy) {
    console.log('❌ Cannot proceed without healthy blockchain network');
    console.log('💡 Please run the following commands:');
    console.log('   1. cd fabric-samples/test-network && ./network.sh down && ./network.sh up createChannel -ca -s couchdb');
    console.log('   2. ./network.sh deployCC -ccn votechain -ccp ../../chaincode/ -ccl javascript');
    console.log('   3. npm start (in backend directory)');
    process.exit(1);
  }

  // Load voter credentials
  const voters = loadVoterCredentials();
  if (voters.length === 0) {
    console.log('❌ No voters found. Please run registerDemoVoters.js first.');
    process.exit(1);
  }

  // Get active elections
  const elections = await getActiveElections();
  if (elections.length === 0) {
    console.log('❌ No active elections found. Please create elections first.');
    
    // Show troubleshooting tips
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Create elections using the admin dashboard');
    console.log('   2. Ensure elections have future end dates');
    console.log('   3. Check if candidates are approved for elections');
    console.log('   4. Verify blockchain network is running properly');
    
    process.exit(1);
  }

  // Get candidates for each election
  const electionCandidates = {};
  let totalCandidates = 0;
  
  for (const election of elections) {
    const candidates = await getApprovedCandidates(election.electionId);
    if (candidates.length === 0) {
      console.log(`⚠️  No approved candidates found for election ${election.title}, skipping...`);
      continue;
    }
    electionCandidates[election.electionId] = candidates;
    totalCandidates += candidates.length;
  }

  if (Object.keys(electionCandidates).length === 0) {
    console.log('❌ No elections with approved candidates found.');
    console.log('💡 Please approve some candidates for the elections first.');
    process.exit(1);
  }

  console.log(`\n📊 Election Setup Summary:`);
  console.log(`   - Active elections: ${elections.length}`);
  console.log(`   - Total candidates: ${totalCandidates}`);
  console.log(`   - Available voters: ${voters.length}`);

  // Login all voters concurrently
  const { votersWithTokens, failedLogins } = await loginVotersConcurrently(voters);
  
  if (votersWithTokens.length === 0) {
    console.log('\n❌ Failed to login any voters. Please check:');
    console.log('   1. Voter credentials in voter-credentials.json');
    console.log('   2. Backend server is running properly');
    console.log('   3. Blockchain network is healthy');
    
    if (failedLogins.length > 0) {
      console.log('\n🔍 Sample login errors:');
      failedLogins.slice(0, 3).forEach((fail, index) => {
        console.log(`   ${index + 1}. ${fail.voter.username}: ${fail.error}`);
      });
    }
    
    process.exit(1);
  }

  console.log(`\n✅ Successfully logged in ${votersWithTokens.length}/${voters.length} voters`);

  // Create vote tasks for each election
  const allVoteTasks = [];
  
  for (const election of elections) {
    const candidates = electionCandidates[election.electionId];
    if (!candidates || candidates.length === 0) continue;
    
    const voteDistribution = generateVoteDistribution(candidates, votersWithTokens.length);
    
    const electionTasks = [];
    let voterIndex = 0;
    
    for (const distItem of voteDistribution) {
      const { candidate, votes } = distItem;
      
      for (let i = 0; i < votes && voterIndex < votersWithTokens.length; i++) {
        electionTasks.push({
          voter: votersWithTokens[voterIndex],
          election: election,
          candidate: candidate,
          token: votersWithTokens[voterIndex].token
        });
        voterIndex++;
      }
    }
    
    allVoteTasks.push(...electionTasks);
    console.log(`📋 Election "${election.title}": ${electionTasks.length} vote tasks created`);
  }

  if (allVoteTasks.length === 0) {
    console.log('❌ No vote tasks could be created');
    process.exit(1);
  }

  console.log(`\n🎯 Starting vote casting process...`);
  console.log(`📦 Total vote tasks: ${allVoteTasks.length}`);
  console.log(`⚙️  Batch size: ${BATCH_SIZE}`);
  console.log(`⏱️  Estimated time: ${Math.ceil((allVoteTasks.length * DELAY_BETWEEN_VOTES + 
    Math.ceil(allVoteTasks.length / BATCH_SIZE) * DELAY_BETWEEN_BATCHES) / 60000)} minutes`);

  const allResults = [];
  const totalBatches = Math.ceil(allVoteTasks.length / BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    const batchTasks = allVoteTasks.slice(start, end);

    const batchResults = await processVoteBatch(batchTasks, batchIndex + 1);
    allResults.push(...batchResults);

    const processed = Math.min((batchIndex + 1) * BATCH_SIZE, allVoteTasks.length);
    const progress = ((processed / allVoteTasks.length) * 100).toFixed(1);
    console.log(`📊 Progress: ${processed}/${allVoteTasks.length} (${progress}%)`);

    if (batchIndex < totalBatches - 1) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  generateVoteSummaryReport(allResults, elections, votersWithTokens);
};

const generateVoteSummaryReport = (results, elections, voters) => {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 VOTE CASTING SUMMARY REPORT');
  console.log('═'.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success && !r.alreadyVoted);
  const alreadyVoted = results.filter(r => r.alreadyVoted);

  console.log(`✅ Successful votes: ${successful.length}`);
  console.log(`❌ Failed votes: ${failed.length}`);
  console.log(`ℹ️  Already voted (skipped): ${alreadyVoted.length}`);
  console.log(`📈 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);

  const electionStats = {};
  elections.forEach(election => {
    electionStats[election.electionId] = {
      title: election.title,
      successful: 0,
      failed: 0,
      alreadyVoted: 0
    };
  });

  results.forEach(result => {
    if (electionStats[result.electionId]) {
      if (result.success) {
        electionStats[result.electionId].successful++;
      } else if (result.alreadyVoted) {
        electionStats[result.electionId].alreadyVoted++;
      } else {
        electionStats[result.electionId].failed++;
      }
    }
  });

  console.log('\n🗳️  Election-wise Breakdown:');
  console.log('─'.repeat(40));
  Object.values(electionStats).forEach(stats => {
    console.log(`📋 ${stats.title}:`);
    console.log(`   ✅ ${stats.successful} successful • ❌ ${stats.failed} failed • ℹ️  ${stats.alreadyVoted} already voted`);
  });

  const candidateVotes = {};
  successful.forEach(vote => {
    const key = `${vote.electionId}-${vote.candidateDid}`;
    candidateVotes[key] = (candidateVotes[key] || 0) + 1;
  });

  const electionCandidates = {};
  successful.forEach(vote => {
    if (!electionCandidates[vote.electionId]) {
      electionCandidates[vote.electionId] = {};
    }
    electionCandidates[vote.electionId][vote.candidateDid] = 
      (electionCandidates[vote.electionId][vote.candidateDid] || 0) + 1;
  });

  console.log('\n👥 Candidate-wise Vote Count:');
  console.log('─'.repeat(40));
  Object.entries(electionCandidates).forEach(([electionId, candidates]) => {
    const election = elections.find(e => e.electionId === electionId);
    console.log(`\n🏛️  ${election?.title || electionId}:`);
    
    const sortedCandidates = Object.entries(candidates)
      .sort(([,a], [,b]) => b - a);
    
    sortedCandidates.forEach(([candidateDid, votes], index) => {
      console.log(`   ${index + 1}. ${candidateDid}: ${votes} votes`);
    });
  });

  const report = {
    timestamp: new Date().toISOString(),
    totalVoteTasks: results.length,
    successfulVotes: successful.length,
    failedVotes: failed.length,
    alreadyVoted: alreadyVoted.length,
    successRate: ((successful.length / results.length) * 100).toFixed(1),
    electionBreakdown: electionStats,
    candidateResults: electionCandidates,
    failedVotesDetail: failed.map(f => ({
      electionId: f.electionId,
      voterDid: f.voterDid,
      candidateDid: f.candidateDid,
      error: f.error
    })).slice(0, 10)
  };

  const reportPath = path.join(__dirname, 'vote-casting-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  console.log('\n🎉 Demo vote casting completed!');
  console.log('💡 You can now check election results in the voter dashboard.');
  
  if (successful.length > 0) {
    console.log('\n🏆 Potential Winners (based on vote counts):');
    console.log('─'.repeat(40));
    
    Object.entries(electionCandidates).forEach(([electionId, candidates]) => {
      const election = elections.find(e => e.electionId === electionId);
      const winner = Object.entries(candidates)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (winner) {
        console.log(`🏛️  ${election?.title || electionId}:`);
        console.log(`   🏆 ${winner[0]} with ${winner[1]} votes`);
      }
    });
  }
};

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

castDemoVotes().catch(error => {
  console.error('💥 Script execution failed:', error);
  process.exit(1);
});