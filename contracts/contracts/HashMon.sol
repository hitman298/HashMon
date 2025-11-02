// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract HashMon is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Battle logging for TPS demonstration
    struct BattleLog {
        address player;
        uint256 hashmonId;
        uint256 xp;
        uint256 result;
        uint256 timestamp;
    }

    // Voucher structure for secure minting
    struct MintVoucher {
        address player;
        uint256 hashmonId;
        uint256 level;
        uint256 nonce;
        uint256 expiry;
        string metadataURI;
    }

    // HashMon attributes
    struct HashMonData {
        uint256 id;
        string name;
        uint256 level;
        uint256 xp;
        uint256 hp;
        uint256 attack;
        uint256 defense;
        uint256 speed;
        string type1;
        string type2;
        uint256 rarity;
        uint256 createdAt;
    }

    uint256 private _nextTokenId;
    uint256 private _nextBattleId;
    
    // Mappings
    mapping(uint256 => HashMonData) public hashmonData;
    mapping(address => uint256) public playerNonces;
    mapping(uint256 => bool) public usedNonces;
    mapping(address => bool) public authorizedSigners;
    
    // Battle logs for TPS demonstration
    BattleLog[] public battleLogs;
    
    // Events
    event HashMonMinted(address indexed to, uint256 indexed tokenId, HashMonData hashmon);
    event BattleLogged(address indexed player, uint256 indexed hashmonId, uint256 battleId);
    event VoucherUsed(address indexed player, uint256 indexed tokenId, uint256 nonce);

    constructor(address initialOwner) 
        ERC721("HashMon", "HMON") 
        Ownable(initialOwner) 
    {
        authorizedSigners[msg.sender] = true;
        // Set base URI for metadata - tokenURI will append tokenId
        // Format: http://localhost:3000/api/nft/metadata/
        _setBaseURI("http://localhost:3000/api/nft/metadata/");
    }
    
    // Override baseURI function
    function _baseURI() internal pure override returns (string memory) {
        return "http://localhost:3000/api/nft/metadata/";
    }

    // Add authorized signer (backend server)
    function addAuthorizedSigner(address signer) external onlyOwner {
        authorizedSigners[signer] = true;
    }

    // Remove authorized signer
    function removeAuthorizedSigner(address signer) external onlyOwner {
        authorizedSigners[signer] = false;
    }

    // Verify voucher signature
    function verifyVoucher(MintVoucher calldata voucher, bytes calldata signature) public view returns (bool) {
        require(block.timestamp <= voucher.expiry, "Voucher expired");
        require(!usedNonces[voucher.nonce], "Nonce already used");
        
        bytes32 messageHash = keccak256(abi.encodePacked(
            voucher.player,
            voucher.hashmonId,
            voucher.level,
            voucher.nonce,
            voucher.expiry,
            voucher.metadataURI
        ));
        
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        
        return authorizedSigners[signer];
    }

    // Mint HashMon with voucher
    function mintWithVoucher(
        MintVoucher calldata voucher,
        HashMonData calldata hashmon,
        bytes calldata signature
    ) external nonReentrant {
        require(msg.sender == voucher.player, "Not voucher owner");
        require(verifyVoucher(voucher, signature), "Invalid voucher");
        require(!usedNonces[voucher.nonce], "Nonce already used");
        
        usedNonces[voucher.nonce] = true;
        playerNonces[voucher.player]++;
        
        uint256 tokenId = _nextTokenId++;
        
        // Mint NFT
        _safeMint(voucher.player, tokenId);
        // Don't set static URI - use dynamic tokenURI() function instead
        // _setTokenURI(tokenId, voucher.metadataURI);
        
        // Store HashMon data
        hashmonData[tokenId] = hashmon;
        
        emit HashMonMinted(voucher.player, tokenId, hashmon);
        emit VoucherUsed(voucher.player, tokenId, voucher.nonce);
    }

    // Log battle result for TPS demonstration
    function logBattle(
        address player,
        uint256 hashmonId,
        uint256 xp,
        uint256 result
    ) external {
        require(authorizedSigners[msg.sender], "Not authorized");
        
        uint256 battleId = _nextBattleId++;
        battleLogs.push(BattleLog({
            player: player,
            hashmonId: hashmonId,
            xp: xp,
            result: result,
            timestamp: block.timestamp
        }));
        
        emit BattleLogged(player, hashmonId, battleId);
    }

    // Update HashMon stats after battle
    function updateHashMonStats(
        uint256 tokenId,
        uint256 newLevel,
        uint256 newXp,
        uint256 newHp,
        uint256 newAttack,
        uint256 newDefense,
        uint256 newSpeed
    ) external {
        require(authorizedSigners[msg.sender], "Not authorized");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        hashmonData[tokenId].level = newLevel;
        hashmonData[tokenId].xp = newXp;
        hashmonData[tokenId].hp = newHp;
        hashmonData[tokenId].attack = newAttack;
        hashmonData[tokenId].defense = newDefense;
        hashmonData[tokenId].speed = newSpeed;
    }

    // Get HashMon data
    function getHashMon(uint256 tokenId) external view returns (HashMonData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return hashmonData[tokenId];
    }

    // Get battle logs count for TPS stats
    function getBattleLogsCount() external view returns (uint256) {
        return battleLogs.length;
    }

    // Get recent battle logs
    function getRecentBattleLogs(uint256 count) external view returns (BattleLog[] memory) {
        uint256 total = battleLogs.length;
        if (count > total) count = total;
        
        BattleLog[] memory recent = new BattleLog[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = battleLogs[total - 1 - i];
        }
        
        return recent;
    }

    // Override required functions
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        // Override to dynamically generate metadata URI based on tokenId
        // This ensures metadata is fetched by tokenId, not the static hashmonId
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, Strings.toString(tokenId)))
            : super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

