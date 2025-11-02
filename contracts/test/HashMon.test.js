const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HashMon Contract", function () {
  let hashmon;
  let owner;
  let player;
  let backend;
  let addrs;

  beforeEach(async function () {
    [owner, player, backend, ...addrs] = await ethers.getSigners();
    
    const HashMon = await ethers.getContractFactory("HashMon");
    hashmon = await HashMon.deploy(owner.address);
    await hashmon.waitForDeployment();
    
    // Add backend as authorized signer
    await hashmon.addAuthorizedSigner(backend.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hashmon.owner()).to.equal(owner.address);
    });

    it("Should add authorized signer", async function () {
      await hashmon.addAuthorizedSigner(backend.address);
      // Note: We can't directly check authorizedSigners mapping from outside
      // This would require a getter function in the contract
    });
  });

  describe("Minting with Voucher", function () {
    it("Should mint HashMon with valid voucher", async function () {
      const nonce = 1;
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      
      const voucher = {
        player: player.address,
        hashmonId: 1,
        level: 5,
        nonce: nonce,
        expiry: expiry,
        metadataURI: "https://ipfs.io/ipfs/QmTestHashMon"
      };

      const hashmonData = {
        id: 1,
        name: "Pikachu",
        level: 5,
        xp: 1000,
        hp: 100,
        attack: 80,
        defense: 60,
        speed: 90,
        type1: "Electric",
        type2: "",
        rarity: 3,
        createdAt: Math.floor(Date.now() / 1000)
      };

      // Create signature with backend wallet
      const messageHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "uint256", "uint256", "uint256", "string"],
        [voucher.player, voucher.hashmonId, voucher.level, voucher.nonce, voucher.expiry, voucher.metadataURI]
      ));
      
      const signature = await backend.signMessage(ethers.getBytes(messageHash));

      // Mint HashMon
      await hashmon.connect(player).mintWithVoucher(voucher, hashmonData, signature);

      // Check if token was minted
      expect(await hashmon.ownerOf(0)).to.equal(player.address);
      expect(await hashmon.tokenURI(0)).to.equal(voucher.metadataURI);
    });

    it("Should reject expired voucher", async function () {
      const nonce = 2;
      const expiry = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago (expired)
      
      const voucher = {
        player: player.address,
        hashmonId: 2,
        level: 5,
        nonce: nonce,
        expiry: expiry,
        metadataURI: "https://ipfs.io/ipfs/QmTestHashMon2"
      };

      const hashmonData = {
        id: 2,
        name: "Charmander",
        level: 5,
        xp: 1000,
        hp: 100,
        attack: 80,
        defense: 60,
        speed: 90,
        type1: "Fire",
        type2: "",
        rarity: 2,
        createdAt: Math.floor(Date.now() / 1000)
      };

      const messageHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "uint256", "uint256", "uint256", "string"],
        [voucher.player, voucher.hashmonId, voucher.level, voucher.nonce, voucher.expiry, voucher.metadataURI]
      ));
      
      const signature = await backend.signMessage(ethers.getBytes(messageHash));

      await expect(
        hashmon.connect(player).mintWithVoucher(voucher, hashmonData, signature)
      ).to.be.revertedWith("Voucher expired");
    });
  });

  describe("Battle Logging", function () {
    it("Should log battle result", async function () {
      await hashmon.connect(backend).logBattle(
        player.address,
        1,
        100,
        1 // 1 = victory
      );

      expect(await hashmon.getBattleLogsCount()).to.equal(1);
    });

    it("Should reject battle logging from unauthorized address", async function () {
      await expect(
        hashmon.connect(player).logBattle(
          player.address,
          1,
          100,
          1
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("HashMon Data Management", function () {
    beforeEach(async function () {
      // Mint a HashMon first
      const nonce = 3;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      
      const voucher = {
        player: player.address,
        hashmonId: 3,
        level: 5,
        nonce: nonce,
        expiry: expiry,
        metadataURI: "https://ipfs.io/ipfs/QmTestHashMon3"
      };

      const hashmonData = {
        id: 3,
        name: "Squirtle",
        level: 5,
        xp: 1000,
        hp: 100,
        attack: 70,
        defense: 80,
        speed: 70,
        type1: "Water",
        type2: "",
        rarity: 2,
        createdAt: Math.floor(Date.now() / 1000)
      };

      const messageHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "uint256", "uint256", "uint256", "string"],
        [voucher.player, voucher.hashmonId, voucher.level, voucher.nonce, voucher.expiry, voucher.metadataURI]
      ));
      
      const signature = await backend.signMessage(ethers.getBytes(messageHash));

      await hashmon.connect(player).mintWithVoucher(voucher, hashmonData, signature);
    });

    it("Should update HashMon stats", async function () {
      await hashmon.connect(backend).updateHashMonStats(
        0, // tokenId
        6, // new level
        1200, // new xp
        110, // new hp
        85, // new attack
        65, // new defense
        95 // new speed
      );

      const updatedHashmon = await hashmon.getHashMon(0);
      expect(updatedHashmon.level).to.equal(6);
      expect(updatedHashmon.xp).to.equal(1200);
      expect(updatedHashmon.hp).to.equal(110);
    });

    it("Should retrieve HashMon data", async function () {
      const hashmonData = await hashmon.getHashMon(0);
      expect(hashmonData.name).to.equal("Squirtle");
      expect(hashmonData.level).to.equal(5);
      expect(hashmonData.type1).to.equal("Water");
    });
  });
});

