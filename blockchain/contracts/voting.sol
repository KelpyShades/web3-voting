// SPDX-License-Identifier: MIT
// This license identifier specifies that the code is released under the MIT License

// File: contracts/Migrations.sol
// This is a standard contract used by Truffle to manage migration history on the blockchain.
pragma solidity 0.8.0; // Specifies the Solidity compiler version to use

/**
 * @title Migrations
 * @dev This contract manages the migration history for Truffle deployments
 */
contract Migrations {
    // Address of the contract owner
    address public owner;
    // Tracks the last completed migration script
    uint public last_completed_migration;

    /**
     * @dev Modifier to restrict function access to the contract owner only
     */
    modifier restricted() {
        require(msg.sender == owner, "Access restricted to owner");
        _; // Continue execution if the requirement is met
    }

    /**
     * @dev Constructor sets the deployer as the contract owner
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Updates the last completed migration number
     * @param completed The migration number that was completed
     */
    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }

    // This function is commented out as it points to an older pattern and can cause confusion.
    // The core functionality for migrations is handled by Truffle's deployment scripts.
    /*
    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
    */
}


// File: contracts/Voting.sol
// This is the main smart contract for the decentralized voting application.
pragma solidity 0.8.0; // Specifies the Solidity compiler version to use

/**
 * @title Voting
 * @dev A smart contract for managing decentralized voting sessions
 */
contract Voting {

    // Admin address that has special privileges
    address public admin;

    /**
     * @dev Struct to hold information about each candidate
     */
    struct Candidate {
        uint id;          // Unique identifier for the candidate
        string name;      // Name of the candidate
        string party;     // Political party or affiliation of the candidate
        uint voteCount;   // Number of votes received by the candidate
    }

    // Mappings to store data
    mapping(uint => Candidate) private candidates; // Maps candidate ID to Candidate struct
    mapping(uint => string) private voters;        // Maps voter index to voter ID string

    // State variables
    uint private votingId;        // ID of the current voting session
    string private votingTitle;   // Title of the current voting session
    uint private countCandidates; // Total number of candidates in the current session
    uint256 private votingEnd;    // Timestamp for when voting ends
    uint256 private votingStart;  // Timestamp for when voting starts
    uint private votingCount;     // Number of votes cast in the current session
    bool private votingCreated;   // Boolean indicating if a voting session has been created

    // Events
    /**
     * @dev Event emitted when a vote is cast
     * @param candidateId ID of the candidate who received the vote
     * @param voteCount Updated vote count for the candidate
     */
    event Voted(uint indexed candidateId, uint indexed voteCount);
    
    /**
     * @dev Event emitted when a voting session is created
     * @param votingId ID of the created voting session
     * @param votingStart Timestamp when voting starts
     * @param votingEnd Timestamp when voting ends
     * @param votingTitle Title of the voting session
     * @param candidates Array of candidates in the voting session
     */
    event VotingCreated(uint indexed votingId, uint indexed votingStart, uint indexed votingEnd, string votingTitle, Candidate[] candidates);

    /**
     * @dev Event emitted when a voting session is deleted
     */
    event VotingDeleted();


    /**
     * @dev Constructor to set initial values when the contract is deployed
     */
    constructor() {
        votingCreated = false;    // No voting session created initially
        countCandidates = 0;      // No candidates initially
        votingCount = 0;          // No votes cast initially
        admin = msg.sender;       // Set deployer as admin
    }

    // --- Functions ---

    /**
     * @dev Creates a new voting session
     * @param _votingId Unique identifier for the voting session
     * @param _title The title of the voting session
     * @param _startDate The UNIX timestamp for the start of voting
     * @param _endDate The UNIX timestamp for the end of voting
     * @param _candidates Array of candidate structs to add to the voting session
     */
    function createVoting(uint _votingId, string memory _title, uint256 _startDate, uint256 _endDate, Candidate[] memory _candidates) public {
        // Verify that only the admin can create a voting session
        require(msg.sender == admin, "Only admin can create a voting.");
        // Verify that no voting session exists already
        require(!votingCreated, "Voting has already been created.");
        // Verify that the start date is in the future
        require(_startDate > block.timestamp, "Start date must be in the future.");
        // Verify that the end date is after the start date
        require(_endDate > _startDate, "End date must be after start date.");
        // Verify that no voting session has been configured
        require(votingStart <= block.timestamp, "Voting has already been configured.");

        // Set voting session details
        votingId = _votingId;
        votingTitle = _title;
        setDates(_startDate, _endDate);
        
        // Add all candidates to the voting session
        for (uint i = 0; i < _candidates.length; i++) {
            addCandidate(_candidates[i].id, _candidates[i].name, _candidates[i].party);
        }
        
        // Mark that a voting session has been created
        votingCreated = true;

        // Emit event for the created voting session
        emit VotingCreated(votingId, votingStart, votingEnd, votingTitle, getCandidates());
    }

    /**
     * @dev Deletes the current voting session
     * Can only be called by the admin when voting is not ongoing
     */
    function deleteVoting() public {
        // Verify that only the admin can delete a voting session
        require(msg.sender == admin, "Only admin can delete a voting.");
        // Verify that a voting session exists
        require(votingCreated, "Voting has not been created.");
        // Verify that voting is not currently ongoing
        require(votingStart > block.timestamp || votingEnd < block.timestamp, "Voting is ongoing.");
        
        // Reset all voting session data
        votingCreated = false;
        votingStart = 0;
        votingEnd = 0;
        votingId = 0;
        votingTitle = "";
        
        // Delete all candidates
        for (uint i = 1; i <= countCandidates; i++) {
            delete candidates[i];
        }
        
        // Reset vote count and candidate count
        votingCount = 0;
        countCandidates = 0;

        // Emit event for the deleted voting session
        emit VotingDeleted();
    }

    /**
     * @dev Cancels the current voting session (functionally identical to deleteVoting)
     * Can only be called by the admin when voting is not ongoing
     */
    function cancelVoting() public {
        // Verify that only the admin can cancel a voting session
        require(msg.sender == admin, "Only admin can cancel a voting.");
        // Verify that a voting session exists
        require(votingCreated, "Voting has not been created.");
        // Verify that voting is not currently ongoing
        require(votingStart > block.timestamp || votingEnd < block.timestamp, "Voting is ongoing.");
        
        // Reset all voting session data
        votingCreated = false;
        votingStart = 0;
        votingEnd = 0;
        votingId = 0;
        votingTitle = "";
        
        // Delete all candidates
        for (uint i = 1; i <= countCandidates; i++) {
            delete candidates[i];
        }
        
        // Reset vote count and candidate count
        votingCount = 0;
        countCandidates = 0;

        // Emit event for the deleted voting session
        emit VotingDeleted();
    }


    
    /**
     * @dev Set the start and end dates for the voting period
     * @param _startDate The UNIX timestamp for the start of voting
     * @param _endDate The UNIX timestamp for the end of voting
     */
    function setDates(uint256 _startDate, uint256 _endDate) private {
        // This check from the PDF '(_startDate + 1000000 > now)' is unusual. A simple ' _startDate > now ' is more common.
        // We will implement a more standard check.

        // Note: These requirements are already checked in the createVoting function
        // require(votingStart == 0, "Voting dates have already been set.");
        // require(_startDate > now, "Start date must be in the future.");
        // require(_endDate > _startDate, "End date must be after start date.");

        // Set the voting period timestamps
        votingStart = _startDate;
        votingEnd = _endDate;
    }

    /**
     * @dev Add a new candidate to the election
     * @param _id The ID of the candidate
     * @param _name The name of the candidate
     * @param _party The party of the candidate
     */
    function addCandidate(uint _id, string memory _name, string memory _party) private {
        // Verify that only the admin can add a candidate
        require(msg.sender == admin, "Only admin can add a candidate.");
        
        // Increment the candidate count
        countCandidates++;
        
        // Create and store the new candidate
        candidates[countCandidates] = Candidate(_id, _name, _party, 0);
    }




    /**
     * @dev Allows a voter to cast their vote for a candidate
     * @param _candidateID The ID of the candidate to vote for
     * @param _voterId The unique identifier of the voter
     */
    function vote(uint _candidateID, string memory _voterId) public {
        // Verify that voting is currently active
        require(votingStart <= block.timestamp && votingEnd > block.timestamp, "Voting is not currently active.");

        // Verify that the candidate ID is valid
        require(_candidateID > 0 && _candidateID <= countCandidates, "Invalid candidate ID.");
        
        // Verify that the voter has not already voted
        require(!checkVote(_voterId), "You have already voted.");

        // Record the voter's ID
        voters[votingCount + 1] = _voterId;
        // Increment the vote count
        votingCount++;
        
        // Increment the vote count for the chosen candidate
        candidates[_candidateID].voteCount++;

        // Emit the Voted event
        emit Voted(_candidateID, candidates[_candidateID].voteCount);
    }




    /**
     * @dev Checks if a voter has already voted
     * @param _voterId The unique identifier of the voter
     * @return A boolean indicating whether the voter has already voted
     */
    function checkVote(string memory _voterId) public view returns (bool) {
        // Verify that a voting session exists
        require(votingCreated, "Voting has not been created.");
        
        // Check if the voter ID exists in the voters mapping
        for (uint i = 1; i <= votingCount; i++) {
            if (keccak256(bytes(voters[i])) == keccak256(bytes(_voterId))) {
                return true; // Voter has already voted
            }
        }
        return false; // Voter has not voted
    }

    /**
     * @dev Gets the total number of registered candidates
     * @return The total candidate count
     */
    function getCountCandidates() public view returns (uint) {
        return countCandidates;
    }

    /**
     * @dev Retrieves details for a specific candidate
     * @param _candidateID The ID of the candidate
     * @return The candidate's ID, name, party, and vote count
     */
    function getCandidate(uint _candidateID)
        public
        view
        returns (uint, string memory, string memory, uint)
    {
        // Verify that only the admin can get candidate details
        require(msg.sender == admin, "Only admin can get a candidate.");
        // Verify that a voting session exists
        require(votingCreated, "Voting has not been created.");
        // Verify that the candidate ID is valid
        require(_candidateID > 0 && _candidateID <= countCandidates, "Invalid candidate ID.");
        
        // Get the candidate struct
        Candidate memory c = candidates[_candidateID];
        
        // Return the candidate details
        return (c.id, c.name, c.party, c.voteCount);
    }

    /**
     * @dev Retrieves all candidates in the current voting session
     * @return An array of all candidates
     */
    function getCandidates() public view returns (Candidate[] memory) {
        // Verify that only the admin can get all candidates
        require(msg.sender == admin, "Only admin can get the candidates.");
        // Verify that a voting session exists
        require(votingCreated, "Voting has not been created.");
        
        // Create an array to hold all candidates
        Candidate[] memory candidatesList = new Candidate[](countCandidates);
        
        // Populate the array with all candidates
        for (uint i = 1; i <= countCandidates; i++) {
            candidatesList[i - 1] = candidates[i];
        }
        
        // Return the array of candidates
        return candidatesList;
    }

    /**
     * @dev Retrieves the start and end dates of the voting period
     * @return The start and end UNIX timestamps
     */
    function getDates() public view returns (uint256, uint256) {
        // Verify that only the admin can get the voting dates
        require(msg.sender == admin, "Only admin can get the dates.");
        // Verify that a voting session exists
        require(votingCreated, "Voting has not been created.");
        
        // Return the start and end timestamps
        return (votingStart, votingEnd);
    }
}
