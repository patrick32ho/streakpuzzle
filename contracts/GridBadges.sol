// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title GridBadges
 * @notice Non-transferable ERC-1155 badges for Grid of the Day
 * @dev Soulbound tokens - transfers are disabled except for minting
 * 
 * Token ID ranges:
 * - 1-999999: Daily completion badges (tokenId = dayId)
 * - 1000000-1000006: Weekly streak badges (7 days)
 * - 1000007-1000013: Bi-weekly streak badges (14 days)
 * - 1000014-1000020: Monthly streak badges (30 days)
 */
contract GridBadges is ERC1155, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Server signer address - validates claims
    address public serverSigner;

    // Track claimed badges to prevent double claims
    mapping(address => mapping(uint256 => bool)) public claimed;

    // Badge type constants
    uint256 public constant WEEKLY_STREAK_BASE = 1000000;
    uint256 public constant BIWEEKLY_STREAK_BASE = 1000007;
    uint256 public constant MONTHLY_STREAK_BASE = 1000014;

    // Events
    event DailyBadgeClaimed(address indexed player, uint256 dayId);
    event StreakBadgeClaimed(address indexed player, uint256 streakDays, uint256 tokenId);
    event ServerSignerUpdated(address indexed oldSigner, address indexed newSigner);

    constructor(
        string memory uri_,
        address _serverSigner
    ) ERC1155(uri_) Ownable(msg.sender) {
        require(_serverSigner != address(0), "Invalid signer");
        serverSigner = _serverSigner;
    }

    /**
     * @notice Claim a daily completion badge
     * @param dayId The day ID (1 = Jan 1, 2024)
     * @param signature Server signature authorizing the claim
     */
    function claimDaily(
        uint256 dayId,
        bytes calldata signature
    ) external {
        require(dayId > 0 && dayId < WEEKLY_STREAK_BASE, "Invalid dayId");
        require(!claimed[msg.sender][dayId], "Already claimed");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            "daily",
            msg.sender,
            dayId
        ));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        require(signer == serverSigner, "Invalid signature");

        // Mark as claimed and mint
        claimed[msg.sender][dayId] = true;
        _mint(msg.sender, dayId, 1, "");

        emit DailyBadgeClaimed(msg.sender, dayId);
    }

    /**
     * @notice Claim a streak badge
     * @param streakDays The streak tier (7, 14, or 30)
     * @param signature Server signature authorizing the claim
     */
    function claimStreakBadge(
        uint256 streakDays,
        bytes calldata signature
    ) external {
        uint256 tokenId;
        
        if (streakDays == 7) {
            tokenId = WEEKLY_STREAK_BASE;
        } else if (streakDays == 14) {
            tokenId = BIWEEKLY_STREAK_BASE;
        } else if (streakDays == 30) {
            tokenId = MONTHLY_STREAK_BASE;
        } else {
            revert("Invalid streak tier");
        }

        require(!claimed[msg.sender][tokenId], "Already claimed");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            "streak",
            msg.sender,
            streakDays
        ));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        require(signer == serverSigner, "Invalid signature");

        // Mark as claimed and mint
        claimed[msg.sender][tokenId] = true;
        _mint(msg.sender, tokenId, 1, "");

        emit StreakBadgeClaimed(msg.sender, streakDays, tokenId);
    }

    /**
     * @notice Check if a player has claimed a specific badge
     */
    function hasClaimed(address player, uint256 tokenId) external view returns (bool) {
        return claimed[player][tokenId];
    }

    /**
     * @notice Update the server signer address
     */
    function setServerSigner(address _newSigner) external onlyOwner {
        require(_newSigner != address(0), "Invalid signer");
        address oldSigner = serverSigner;
        serverSigner = _newSigner;
        emit ServerSignerUpdated(oldSigner, _newSigner);
    }

    /**
     * @notice Update the token URI
     */
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    // ============ Soulbound Logic ============

    /**
     * @dev Override to make tokens non-transferable (soulbound)
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        require(from == address(0), "Soulbound: transfers disabled");
        super.safeTransferFrom(from, to, id, amount, data);
    }

    /**
     * @dev Override to make tokens non-transferable (soulbound)
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
        require(from == address(0), "Soulbound: transfers disabled");
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    /**
     * @dev Override to disable approvals for soulbound tokens
     */
    function setApprovalForAll(address, bool) public virtual override {
        revert("Soulbound: approvals disabled");
    }
}
