// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract FaucetToken is ERC20, Ownable {
    // ─── Constants 
    uint256 public constant MAX_SUPPLY      = 10_000_000 * 1e18;
    uint256 public constant REQUEST_AMOUNT  = 100 * 1e18;   // 100 FTK per claim
    uint256 public constant REQUEST_COOLDOWN = 24 hours;

    // ─── State 
    mapping(address => uint256) public lastRequestTime;

    // ─── Events 
    event TokensRequested(address indexed requester, uint256 amount, uint256 timestamp);
    event TokensMinted(address indexed to, uint256 amount);

    // ─── Errors 
    error CooldownNotElapsed(uint256 retryAfter);
    error ExceedsMaxSupply(uint256 requested, uint256 available);
    error ZeroMintAmount();
    error ZeroAddress();

    // ─── Constructor 
    constructor(address initialOwner)
        ERC20("FaucetToken", "FTK")
        Ownable(initialOwner)
    {
        // Mint an initial supply of 1,000,000 FTK to the owner
        _mint(initialOwner, 1_000_000 * 1e18);
    }

    // Public / External 

    /**
     * @notice Claim REQUEST_AMOUNT FTK once every 24 hours.
     * @dev Reverts with the exact timestamp after which the user may retry.
     */
    function requestToken() external {
    // Only enforce cooldown after the first request
    if (lastRequestTime[msg.sender] != 0) {
        uint256 nextAllowed = lastRequestTime[msg.sender] + REQUEST_COOLDOWN;
        if (block.timestamp < nextAllowed) {
            revert CooldownNotElapsed(nextAllowed);
        }
    }

    uint256 available = MAX_SUPPLY - totalSupply();
    if (REQUEST_AMOUNT > available) {
        revert ExceedsMaxSupply(REQUEST_AMOUNT, available);
    }

    lastRequestTime[msg.sender] = block.timestamp;
    _mint(msg.sender, REQUEST_AMOUNT);

    emit TokensRequested(msg.sender, REQUEST_AMOUNT, block.timestamp);
}

    /**
     * @notice Owner-only: mint any amount as long as MAX_SUPPLY is not exceeded.
     * @param to     Recipient address.
     * @param amount Amount to mint (in wei, i.e. with 18 decimals).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0)      revert ZeroMintAmount();

        uint256 available = MAX_SUPPLY - totalSupply();
        if (amount > available) {
            revert ExceedsMaxSupply(amount, available);
        }

        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // ─── View Helpers


  function cooldownRemaining(address user) external view returns (uint256) {
    if (lastRequestTime[user] == 0) return 0;
    uint256 nextAllowed = lastRequestTime[user] + REQUEST_COOLDOWN;
    if (block.timestamp >= nextAllowed) return 0;
    return nextAllowed - block.timestamp;
}

    /// @notice Remaining mintable supply.
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
