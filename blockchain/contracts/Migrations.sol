
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

