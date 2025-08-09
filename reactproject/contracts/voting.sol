// SPDX-License-Identifier: MIT

// File: contracts/Migrations.sol
// This is a standard contract used by Truffle to manage migration history on the blockchain.
pragma solidity ^0.5.15;

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    modifier restricted() {
        require(msg.sender == owner, "Access restricted to owner");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

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
pragma solidity ^0.5.15;

contract Voting {

    // Struct to hold information about each candidate
    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    // Mappings to store data
    mapping(uint => Candidate) public candidates; // Maps candidate ID to Candidate struct
    mapping(address => bool) public voters;     // Maps voter address to a boolean indicating if they have voted

    // State variables
    uint public countCandidates; // Total number of candidates
    uint256 public votingEnd;    // Timestamp for when voting ends
    uint256 public votingStart;  // Timestamp for when voting starts

    // Event to be emitted when a vote is cast
    event Voted(uint indexed candidateId);

    // --- Functions ---

    /**
     * @dev Add a new candidate to the election.
     * Can only be called before voting has started.
     * @param _name The name of the candidate.
     * @param _party The party of the candidate.
     * @return The ID of the newly added candidate.
     */
    function addCandidate(string memory _name, string memory _party)
        public
        returns (uint)
    {
        require(votingStart == 0, "Voting has already been configured.");
        countCandidates++;
        candidates[countCandidates] = Candidate(countCandidates, _name, _party, 0);
        return countCandidates;
    }

    /**
     * @dev Allows a registered voter to cast their vote.
     * @param _candidateID The ID of the candidate to vote for.
     */
    function vote(uint _candidateID) public {
        // Require that voting is currently active
        require(votingStart > 0 && votingStart <= now && votingEnd > now, "Voting is not currently active.");
        
        // Require that the candidate ID is valid
        require(_candidateID > 0 && _candidateID <= countCandidates, "Invalid candidate ID.");
        
        // Require that the voter has not already voted
        require(!voters[msg.sender], "You have already voted.");

        // Record that the voter has voted
        voters[msg.sender] = true;
        
        // Increment the vote count for the chosen candidate
        candidates[_candidateID].voteCount++;

        // Emit the Voted event
        emit Voted(_candidateID);
    }

    /**
     * @dev Set the start and end dates for the voting period.
     * Can only be set once. Start date must be in the future. End date must be after start date.
     * @param _startDate The UNIX timestamp for the start of voting.
     * @param _endDate The UNIX timestamp for the end of voting.
     */
    function setDates(uint256 _startDate, uint256 _endDate) public {
        // This check from the PDF '(_startDate + 1000000 > now)' is unusual. A simple ' _startDate > now ' is more common.
        // We will implement a more standard check.
        require(votingStart == 0, "Voting dates have already been set.");
        require(_startDate > now, "Start date must be in the future.");
        require(_endDate > _startDate, "End date must be after start date.");

        votingStart = _startDate;
        votingEnd = _endDate;
    }

    /**
     * @dev Checks if the current message sender has already voted.
     * @return A boolean indicating the voting status.
     */
    function checkVote() public view returns (bool) {
        return voters[msg.sender];
    }

    /**
     * @dev Gets the total number of registered candidates.
     * @return The total candidate count.
     */
    function getCountCandidates() public view returns (uint) {
        return countCandidates;
    }

    /**
     * @dev Retrieves details for a specific candidate.
     * @param _candidateID The ID of the candidate.
     * @return The candidate's ID, name, party, and vote count.
     */
    function getCandidate(uint _candidateID)
        public
        view
        returns (uint, string memory, string memory, uint)
    {
        require(_candidateID > 0 && _candidateID <= countCandidates, "Invalid candidate ID.");
        Candidate memory c = candidates[_candidateID];
        return (c.id, c.name, c.party, c.voteCount);
    }

    /**
     * @dev Retrieves the start and end dates of the voting period.
     * @return The start and end UNIX timestamps.
     */
    function getDates() public view returns (uint256, uint256) {
        return (votingStart, votingEnd);
    }
}
