// backend/scripts/registerDemoVoters.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - UPDATED TO 500 VOTERS
const API_BASE_URL = 'http://localhost:5001/api/voting';
const TOTAL_VOTERS = 500;
const BATCH_SIZE = 15; // Increased batch size for faster processing
const DELAY_BETWEEN_BATCHES = 1500;
const DELAY_BETWEEN_REGISTRATIONS = 200;

// Demo data generators
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Jason', 'Rebecca', 'Edward', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas',
  'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna', 'Larry', 'Brenda',
  'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma', 'Benjamin', 'Samantha',
  'Samuel', 'Katherine', 'Gregory', 'Christine', 'Alexander', 'Debra', 'Patrick', 'Rachel',
  'Frank', 'Carolyn', 'Raymond', 'Janet', 'Jack', 'Catherine', 'Dennis', 'Maria',
  'Alex', 'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'William', 'Sophia', 'Mason', 'Isabella',
  'James', 'Mia', 'Benjamin', 'Charlotte', 'Jacob', 'Amelia', 'Michael', 'Harper', 'Elijah', 'Evelyn',
  'Ethan', 'Abigail', 'Alexander', 'Emily', 'Oliver', 'Elizabeth', 'Daniel', 'Sofia', 'Lucas', 'Avery',
  'Matthew', 'Ella', 'Aiden', 'Scarlett', 'Jackson', 'Grace', 'Logan', 'Chloe', 'David', 'Victoria',
  'Joseph', 'Riley', 'Samuel', 'Aria', 'Henry', 'Lily', 'Owen', 'Aubrey', 'Sebastian', 'Zoey',
  'Gabriel', 'Hannah', 'Carter', 'Lillian', 'Jayden', 'Addison', 'John', 'Eleanor', 'Luke', 'Natalie',
  'Anthony', 'Luna', 'Isaac', 'Savannah', 'Dylan', 'Brooklyn', 'Wyatt', 'Leah', 'Andrew', 'Zoe',
  'Joshua', 'Stella', 'Christopher', 'Hazel', 'Grayson', 'Ellie', 'Jack', 'Paisley', 'Julian', 'Audrey',
  'Ryan', 'Skylar', 'Jaxon', 'Violet', 'Levi', 'Claire', 'Nathan', 'Bella', 'Caleb', 'Aurora',
  'Hunter', 'Lucy', 'Christian', 'Anna', 'Isaiah', 'Samantha', 'Thomas', 'Caroline', 'Aaron', 'Genesis',
  'Lincoln', 'Aaliyah', 'Charles', 'Kennedy', 'Eli', 'Kinsley', 'Landon', 'Allison', 'Connor', 'Maya',
  'Josiah', 'Sarah', 'Jonathan', 'Madelyn', 'Cameron', 'Adeline', 'Jeremiah', 'Alexa', 'Mateo', 'Ariana',
  'Adrian', 'Elena', 'Colton', 'Gabriella', 'Jordan', 'Naomi', 'Brayden', 'Alice', 'Nicholas', 'Sadie',
  'Robert', 'Hailey', 'Angel', 'Eva', 'Hudson', 'Emilia', 'Dominic', 'Autumn', 'Jace', 'Quinn',
  'Kevin', 'Nevaeh', 'Zachary', 'Piper', 'Parker', 'Ruby', 'Adam', 'Serenity', 'Austin', 'Willow',
  'Nolan', 'Everly', 'Ian', 'Cora', 'Santiago', 'Kaylee', 'Chase', 'Lydia', 'Miles', 'Aubree'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson',
  'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster',
  'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Bell', 'Coleman',
  'Butler', 'Henderson', 'Barnes', 'Gonzales', 'Fisher', 'Vasquez', 'Simmons', 'Romero',
  'Jordan', 'Patterson', 'Alexander', 'Hamilton', 'Graham', 'Reynolds', 'Griffin', 'Wallace',
  'Moreno', 'West', 'Cole', 'Hayes', 'Bryant', 'Herrera', 'Gibson', 'Ellis', 'Tran', 'Cohen',
  'Owens', 'Porter', 'Dixon', 'Snyder', 'Hart', 'Cunningham', 'Bradley', 'Lane', 'Andrews',
  'Ruiz', 'Harper', 'Fox', 'Riley', 'Armstrong', 'Carpenter', 'Weaver', 'Greene', 'Lawrence',
  'Elliott', 'Chavez', 'Sims', 'Austin', 'Peters', 'Kelley', 'Franklin', 'Lawson', 'Fields',
  'Gutierrez', 'Ryan', 'Schmidt', 'Carr', 'Vasquez', 'Castillo', 'Wheeler', 'Chapman', 'Oliver',
  'Montgomery', 'Richards', 'Williamson', 'Johnston', 'Banks', 'Meyer', 'Bishop', 'McCoy',
  'Howell', 'Alvarez', 'Morrison', 'Hansen', 'Fernandez', 'Garza', 'Harvey', 'Little',
  'Burton', 'Stanley', 'Nguyen', 'George', 'Jacobs', 'Reid', 'Kim', 'Fuller', 'Lynch',
  'Dean', 'Gilbert', 'Garrett', 'Romero', 'Welch', 'Larson', 'Frazier', 'Burke', 'Hanson',
  'Day', 'Mendoza', 'Moreno', 'Bowman', 'Medina', 'Fowler', 'Brewer', 'Hoffman', 'Carlson',
  'Silva', 'Pearson', 'Holland', 'Douglas', 'Fleming', 'Jensen', 'Vargas', 'Byrd', 'Davidson',
  'Hopkins', 'May', 'Terry', 'Herrera', 'Wade', 'Soto', 'Walters', 'Curtis', 'Neal', 'Caldwell',
  'Lowe', 'Jennings', 'Barnett', 'Graves', 'Jimenez', 'Horton', 'Shelton', 'Barrett', 'Obrien',
  'Castro', 'Sutton', 'Gregory', 'McKinney', 'Lucas', 'Miles', 'Craig', 'Rodriquez', 'Chambers',
  'Holt', 'Lambert', 'Fletcher', 'Watts', 'Bates', 'Hale', 'Rhodes', 'Pena', 'Beck', 'Newman',
  'Haynes', 'McDaniel', 'Mendez', 'Bush', 'Vaughn', 'Parks', 'Dawson', 'Santiago', 'Norris',
  'Hardy', 'Love', 'Steele', 'Curry', 'Powers', 'Schultz', 'Barker', 'Guzman', 'Page', 'Munoz',
  'Ball', 'Keller', 'Chandler', 'Weber', 'Leonard', 'Walsh', 'Lyons', 'Ramsey', 'Wolfe', 'Schneider',
  'Mullins', 'Benson', 'Sharp', 'Bowen', 'Daniel', 'Barber', 'Cummings', 'Hines', 'Baldwin', 'Griffith',
  'Valdez', 'Hubbard', 'Salazar', 'Reeves', 'Warner', 'Stevenson', 'Burgess', 'Santos', 'Tate', 'Cross',
  'Garner', 'Mann', 'Mack', 'Moss', 'Thornton', 'Dennis', 'McGee', 'Farmer', 'Delgado', 'Aguilar',
  'Vega', 'Glover', 'Manning', 'Cohen', 'Harmon', 'Rodgers', 'Robbins', 'Newton', 'Todd', 'Blair',
  'Higgins', 'Ingram', 'Reese', 'Cannon', 'Strickland', 'Townsend', 'Potter', 'Goodwin', 'Walton',
  'Rowe', 'Hampton', 'Ortega', 'Patton', 'Swanson', 'Joseph', 'Francis', 'Goodman', 'Maldonado', 'Yates'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
  'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville',
  'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville',
  'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
  'Kansas City', 'Long Beach', 'Mesa', 'Atlanta', 'Colorado Springs', 'Miami',
  'Raleigh', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Cleveland', 'Wichita',
  'Arlington', 'New Orleans', 'Bakersfield', 'Tampa', 'Honolulu', 'Anaheim',
  'Aurora', 'Santa Ana', 'St. Louis', 'Riverside', 'Corpus Christi', 'Lexington',
  'Pittsburgh', 'Anchorage', 'Stockton', 'Cincinnati', 'St. Paul', 'Toledo',
  'Greensboro', 'Newark', 'Plano', 'Henderson', 'Lincoln', 'Buffalo', 'Jersey City',
  'Chula Vista', 'Fort Wayne', 'Orlando', 'St. Petersburg', 'Chandler', 'Laredo',
  'Norfolk', 'Durham', 'Madison', 'Lubbock', 'Irvine', 'Winston-Salem', 'Glendale',
  'Garland', 'Hialeah', 'Reno', 'Chesapeake', 'Gilbert', 'Baton Rouge', 'Irving',
  'Scottsdale', 'North Las Vegas', 'Fremont', 'Boise City', 'Richmond', 'San Bernardino'
];

const generateRandomDate = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  const date = new Date(randomTime);
  return date.toISOString().split('T')[0];
};

const generateUsername = (firstName, lastName) => {
  const randomNum = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}`;
};

// UPDATED: Generate 3-digit DIDs for 500 voters
const generateDID = (index) => {
  return `VOTER${String(index).padStart(3, '0')}`;
};

const generateVoterData = (index) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  return {
    role: 'Voter',
    did: generateDID(index),
    fullName: `${firstName} ${lastName}`,
    dob: generateRandomDate('1950-01-01', '2005-12-31'),
    birthplace: `${city}, USA`,
    username: generateUsername(firstName, lastName),
    password: '12345678',
    image: ''
  };
};

const getImageBase64 = () => {
  try {
    const imagePath = path.join(__dirname, 'img', 'Voter.jpg');
    console.log(`🔍 Looking for image at: ${imagePath}`);
    
    if (!fs.existsSync(imagePath)) {
      console.warn('⚠️  Image file "img/Voter.jpg" not found. Checking alternative locations...');
      
      const altPaths = [
        path.join(__dirname, '../img/Voter.jpg'),
        path.join(__dirname, '../../img/Voter.jpg'),
        path.join(process.cwd(), 'img/Voter.jpg')
      ];
      
      for (const altPath of altPaths) {
        console.log(`🔍 Trying alternative path: ${altPath}`);
        if (fs.existsSync(altPath)) {
          console.log(`✅ Found image at: ${altPath}`);
          const imageBuffer = fs.readFileSync(altPath);
          return imageBuffer.toString('base64');
        }
      }
      
      console.warn('❌ Image file not found in any location. Continuing without image...');
      return '';
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    console.log(`✅ Successfully loaded image from: ${imagePath}`);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('❌ Error reading image file:', error.message);
    return '';
  }
};

// NEW: Check if user already exists
const checkUserExists = async (did) => {
  try {
    // Try to get user profile to check if exists
    const response = await axios.get(`${API_BASE_URL}/profile/Voter/${did}`, {
      timeout: 5000
    });
    return response.data.success;
  } catch (error) {
    // If we get a 404 or other error, user doesn't exist
    return false;
  }
};

// Network health check
const checkNetworkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 10000
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
    console.log('   3. Chaincode is deployed: ./network.sh deployCC -ccn votechain -ccp ../../chaincode/ -ccl javascript');
    return false;
  }
};

// UPDATED: Register voter with duplicate check
const registerVoter = async (voterData, imageBase64, retries = 3) => {
  // First check if user already exists
  const alreadyExists = await checkUserExists(voterData.did);
  if (alreadyExists) {
    console.log(`⏭️  Skipping ${voterData.fullName} (${voterData.did}) - already registered`);
    return { 
      success: true, 
      skipped: true,
      voter: voterData,
      message: 'User already exists, skipped registration'
    };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📝 Attempt ${attempt}/${retries}: Registering ${voterData.fullName} (${voterData.did})`);
      
      const payload = {
        ...voterData,
        image: imageBase64
      };

      const response = await axios.post(`${API_BASE_URL}/register`, payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        console.log(`✅ Success: ${voterData.fullName} - ${voterData.did}`);
        return { success: true, data: response.data.data, voter: voterData };
      } else {
        console.log(`❌ Failed: ${voterData.fullName} - ${response.data.error}`);
        
        if (response.data.error.includes('Blockchain network') && attempt < retries) {
          console.log(`🔄 Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        return { success: false, error: response.data.error, voter: voterData };
      }
    } catch (error) {
      console.log(`💥 Error (Attempt ${attempt}): ${voterData.fullName} - ${error.response?.data?.error || error.message}`);
      
      if (attempt < retries) {
        console.log(`🔄 Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        return { 
          success: false, 
          error: error.response?.data?.error || error.message,
          voter: voterData 
        };
      }
    }
  }
};

const processBatch = async (voters, imageBase64, batchNumber) => {
  console.log(`\n🔄 Processing batch ${batchNumber} (${voters.length} voters)...`);
  
  const results = [];
  
  for (const voter of voters) {
    const result = await registerVoter(voter, imageBase64);
    results.push(result);
    
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REGISTRATIONS));
  }
  
  return results;
};

const registerDemoVoters = async () => {
  console.log('🚀 Starting demo voter registration...');
  console.log(`📊 Target: ${TOTAL_VOTERS} voters`);
  console.log(`⚙️  Batch size: ${BATCH_SIZE}`);
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

  const imageBase64 = getImageBase64();
  if (imageBase64) {
    console.log('🖼️  Voter image loaded successfully');
  } else {
    console.log('ℹ️  No profile image will be used');
  }

  // Generate all voter data
  const allVoters = [];
  for (let i = 1; i <= TOTAL_VOTERS; i++) {
    allVoters.push(generateVoterData(i));
  }

  console.log(`👥 Generated ${allVoters.length} voter profiles`);
  console.log('🎲 Sample voter data:');
  console.log(JSON.stringify(allVoters[0], null, 2));

  const allResults = [];
  const totalBatches = Math.ceil(TOTAL_VOTERS / BATCH_SIZE);

  console.log(`\n📦 Processing ${totalBatches} batches...`);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    const batchVoters = allVoters.slice(start, end);

    const batchResults = await processBatch(batchVoters, imageBase64, batchIndex + 1);
    allResults.push(...batchResults);

    // Progress update
    const processed = Math.min((batchIndex + 1) * BATCH_SIZE, TOTAL_VOTERS);
    const progress = ((processed / TOTAL_VOTERS) * 100).toFixed(1);
    console.log(`📊 Progress: ${processed}/${TOTAL_VOTERS} (${progress}%)`);

    if (batchIndex < totalBatches - 1) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  generateSummaryReport(allResults);
};

const generateSummaryReport = (results) => {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 VOTER REGISTRATION SUMMARY REPORT');
  console.log('═'.repeat(60));

  const successful = results.filter(r => r.success && !r.skipped);
  const skipped = results.filter(r => r.skipped);
  const failed = results.filter(r => !r.success);

  console.log(`✅ New registrations: ${successful.length}`);
  console.log(`⏭️  Skipped (already exists): ${skipped.length}`);
  console.log(`❌ Failed registrations: ${failed.length}`);
  console.log(`📈 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);

  // Generate voter credentials file (include all successful, including skipped)
  const allSuccessful = results.filter(r => r.success);
  const credentials = allSuccessful.map(r => ({
    did: r.voter.did,
    username: r.voter.username,
    password: r.voter.password,
    role: r.voter.role,
    fullName: r.voter.fullName,
    dob: r.voter.dob,
    birthplace: r.voter.birthplace,
    status: r.skipped ? 'existing' : 'new'
  }));

  const credentialsPath = path.join(__dirname, 'voter-credentials.json');
  fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
  console.log(`\n🔑 Voter credentials saved to: ${credentialsPath}`);

  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    totalAttempted: results.length,
    newRegistrations: successful.length,
    skippedRegistrations: skipped.length,
    failedRegistrations: failed.length,
    successRate: ((successful.length / results.length) * 100).toFixed(1),
    newVoters: successful.map(r => ({
      did: r.voter.did,
      fullName: r.voter.fullName,
      username: r.voter.username,
      dob: r.voter.dob,
      birthplace: r.voter.birthplace
    })),
    existingVoters: skipped.map(r => ({
      did: r.voter.did,
      fullName: r.voter.fullName,
      username: r.voter.username
    })),
    failedRegistrations: failed.map(r => ({
      did: r.voter.did,
      fullName: r.voter.fullName,
      error: r.error
    }))
  };

  const reportPath = path.join(__dirname, 'voter-registration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}`);

  // Display sample credentials
  console.log('\n👥 Sample Voter Credentials:');
  console.log('─'.repeat(50));
  credentials.slice(0, 8).forEach((cred, index) => {
    const statusIcon = cred.status === 'existing' ? '⏭️' : '✅';
    console.log(`${index + 1}. ${cred.fullName} ${statusIcon}`);
    console.log(`   DID: ${cred.did}`);
    console.log(`   Username: ${cred.username}`);
    console.log(`   Password: ${cred.password}`);
    console.log(`   Role: ${cred.role}`);
    console.log(`   Status: ${cred.status === 'existing' ? 'Already registered' : 'New registration'}`);
    console.log('');
  });

  if (failed.length > 0) {
    console.log('\n❌ Failed Registrations (First 5):');
    console.log('─'.repeat(50));
    failed.slice(0, 5).forEach((fail, index) => {
      console.log(`${index + 1}. ${fail.voter.fullName} (${fail.voter.did})`);
      console.log(`   Error: ${fail.error}`);
      console.log('');
    });
  }

  console.log('🎉 Demo voter registration completed!');
  console.log(`📊 Summary: ${successful.length} new + ${skipped.length} existing = ${allSuccessful.length} total voters`);
  console.log('💡 Use the voter-credentials.json file to test login with different voters.');
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the registration
registerDemoVoters().catch(error => {
  console.error('💥 Script execution failed:', error);
  process.exit(1);
});