// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title GridFrames
 * @notice Transferable ERC-1155 cosmetic frames for Grid of the Day
 * @dev Frames are unlocked offchain and minted with server signature
 * 
 * Frame IDs:
 * - 1: "Perfect" frame (solved in 1 try)
 * - 2: "Quick Solver" frame (solved in 1-2 tries)
 * - 3: "On Fire" frame (3+ day streak)
 * - 4-100: Reserved for future frames
 */
contract GridFrames is ERC1155, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Server signer address
    address public serverSigner;

    // Track minted frames to prevent double minting
    mapping(address => mapping(uint256 => bool)) public minted;

    // Frame supply caps (0 = unlimited)
    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public totalMinted;

    // Events
    event FrameMinted(address indexed player, uint256 indexed frameId);
    event ServerSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event MaxSupplySet(uint256 indexed frameId, uint256 maxSupply);

    constructor(
        string memory uri_,
        address _serverSigner
    ) ERC1155(uri_) Ownable(msg.sender) {
        require(_serverSigner != address(0), "Invalid signer");
        serverSigner = _serverSigner;
    }

    /**
     * @notice Mint a cosmetic frame
     * @param frameId The frame ID to mint
     * @param signature Server signature authorizing the mint
     */
    function mintFrame(
        uint256 frameId,
        bytes calldata signature
    ) external {
        require(frameId > 0 && frameId <= 100, "Invalid frameId");
        require(!minted[msg.sender][frameId], "Already minted");
        
        // Check supply cap
        uint256 cap = maxSupply[frameId];
        if (cap > 0) {
            require(totalMinted[frameId] < cap, "Max supply reached");
        }

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            "frame",
            msg.sender,
            frameId
        ));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        require(signer == serverSigner, "Invalid signature");

        // Mark as minted and mint
        minted[msg.sender][frameId] = true;
        totalMinted[frameId]++;
        _mint(msg.sender, frameId, 1, "");

        emit FrameMinted(msg.sender, frameId);
    }

    /**
     * @notice Check if a player has minted a specific frame
     */
    function hasMinted(address player, uint256 frameId) external view returns (bool) {
        return minted[player][frameId];
    }

    /**
     * @notice Set max supply for a frame (0 = unlimited)
     */
    function setMaxSupply(uint256 frameId, uint256 _maxSupply) external onlyOwner {
        require(frameId > 0 && frameId <= 100, "Invalid frameId");
        maxSupply[frameId] = _maxSupply;
        emit MaxSupplySet(frameId, _maxSupply);
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
}
