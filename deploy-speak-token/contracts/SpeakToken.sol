// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SPEAK Token
 * @notice BEP-20 compatible token for the SPEAK ecosystem.
 *
 * The owner may burn up to 100,000,000 SPEAK from the owner's balance
 * beginning on 1 January 2027. Regular holders may also burn their own
 * tokens through the inherited ERC-20 burn function.
 */
contract SpeakToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10 ** 18;
    uint256 public constant SCHEDULED_BURN_CAP = 100_000_000 * 10 ** 18;
    uint256 public constant BURN_START_TIMESTAMP = 1_798_761_600; // 2027-01-01 00:00:00 UTC

    uint256 public scheduledBurned;

    event ScheduledBurn(uint256 amount, uint256 totalScheduledBurned);

    constructor(address initialOwner)
        ERC20("SPEAK", "SPEAK")
        Ownable(initialOwner)
    {
        require(initialOwner != address(0), "SPEAK: zero owner");
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /**
     * @notice Burns SPEAK from the owner's balance after the burn start date.
     * @dev The scheduled burn total cannot exceed 100 million SPEAK.
     */
    function burnScheduled(uint256 amount) external onlyOwner {
        require(block.timestamp >= BURN_START_TIMESTAMP, "SPEAK: burn not started");
        require(amount > 0, "SPEAK: zero amount");
        require(scheduledBurned + amount <= SCHEDULED_BURN_CAP, "SPEAK: burn cap exceeded");

        scheduledBurned += amount;
        _burn(owner(), amount);
        emit ScheduledBurn(amount, scheduledBurned);
    }

    /**
     * @notice Burns all remaining scheduled allocation from the owner's balance.
     */
    function burnRemainingScheduled() external onlyOwner {
        uint256 amount = SCHEDULED_BURN_CAP - scheduledBurned;
        require(amount > 0, "SPEAK: burn cap reached");
        require(block.timestamp >= BURN_START_TIMESTAMP, "SPEAK: burn not started");

        scheduledBurned += amount;
        _burn(owner(), amount);
        emit ScheduledBurn(amount, scheduledBurned);
    }
}
