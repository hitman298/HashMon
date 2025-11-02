/**
 * Storacha IPFS Service (formerly Web3.Storage)
 * Uses dynamic imports for ESM compatibility
 */

let storachaClient = null;

class StorachaService {
  constructor() {
    this.spaceDid = process.env.STORACHA_SPACE_DID;
    this.agentKey = process.env.STORACHA_AGENT_KEY;
    this.agentProof = process.env.STORACHA_AGENT_PROOF;
    this.gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';
    
    this.isConfigured = !!(this.agentKey && this.agentProof && this.spaceDid);
    
    if (!this.isConfigured) {
      console.warn('⚠️ Storacha not configured - IPFS uploads will be disabled');
      console.warn('   Get FREE account at: https://storacha.network/');
    } else {
      console.log('✅ Storacha service initialized (will connect on first upload)');
      console.log(`   Gateway: ${this.gatewayUrl}`);
    }
  }

  static isReady() {
    return !!(process.env.STORACHA_AGENT_KEY && process.env.STORACHA_AGENT_PROOF && process.env.STORACHA_SPACE_DID);
  }

  async initializeClient() {
    if (storachaClient) {
      return storachaClient;
    }

    try {
      // Use dynamic import for ESM modules
      const { create } = await import('@storacha/client');
      const { Signer } = await import('@storacha/client/principal/ed25519');
      const Proof = await import('@storacha/client/proof');
      
      // Parse principal from private key
      // Handle both named and default exports
      const SignerClass = Signer.Signer || Signer.default?.Signer || Signer.default || Signer;
      const principal = SignerClass.parse(this.agentKey);
      
      // Create client
      const client = await create({ principal });
      
      // Parse and add UCAN proof
      // Handle both named and default exports
      const ProofClass = Proof.Proof || Proof.default?.Proof || Proof.default || Proof;
      const proofParsed = await ProofClass.parse(this.agentProof);
      const space = await client.addSpace(proofParsed);
      const spaceDid = space.did();
      await client.setCurrentSpace(spaceDid);
      
      console.log(`✅ Storacha client connected`);
      console.log(`   Space DID: ${spaceDid}`);
      console.log(`   Expected Space: ${this.spaceDid}`);
      
      // Verify we're using the correct space
      if (spaceDid !== this.spaceDid) {
        console.warn(`⚠️ Space DID mismatch!`);
        console.warn(`   Connected to: ${spaceDid}`);
        console.warn(`   Expected: ${this.spaceDid}`);
        console.warn(`   This might cause uploads to go to the wrong space!`);
      }
      
      storachaClient = client;
      return client;
    } catch (error) {
      console.error('❌ Failed to initialize Storacha client:', error.message);
      console.error('   Full error:', error);
      throw new Error(`Failed to initialize Storacha: ${error.message}`);
    }
  }

  async uploadFile(fileBuffer, fileName, contentType = 'application/octet-stream') {
    try {
      if (!this.isConfigured) {
        throw new Error('Storacha not configured');
      }

      const client = await this.initializeClient();

      console.log(`📤 Uploading file to Storacha IPFS: ${fileName} (${contentType})`);
      console.log(`   Buffer length: ${fileBuffer.length} bytes`);

      // Create File object from Buffer
      let file;
      if (typeof File !== 'undefined') {
        file = new File([fileBuffer], fileName, { type: contentType });
      } else {
        const { Readable } = require('stream');
        file = {
          name: fileName,
          type: contentType,
          size: fileBuffer.length,
          stream: () => Readable.from(fileBuffer),
          arrayBuffer: async () => fileBuffer.buffer || fileBuffer,
          text: async () => fileBuffer.toString('utf-8')
        };
      }

      // Upload file
      console.log(`   Initializing upload to space: ${this.spaceDid}`);
      const directoryCid = await client.uploadFile(file);
      const cid = directoryCid.toString();
      
      console.log(`✅ File uploaded successfully to Storacha IPFS!`);
      console.log(`   File: ${fileName}`);
      console.log(`   Directory CID: ${cid}`);
      console.log(`   File URL: https://${cid}.ipfs.storacha.link/${fileName}`);
      console.log(`   IPFS Gateway: ${this.gatewayUrl}${cid}/${fileName}`);
      console.log(`   Space DID: ${this.spaceDid}`);

      return cid;
    } catch (error) {
      console.error('❌ Storacha upload error:', error.message);
      console.error('   Error details:', error);
      if (error.stack) {
        console.error('   Stack trace:', error.stack);
      }
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  async uploadMetadata(metadata, filename = 'metadata.json') {
    try {
      const jsonString = JSON.stringify(metadata, null, 2);
      const jsonBuffer = Buffer.from(jsonString, 'utf-8');
      return await this.uploadFile(jsonBuffer, filename, 'application/json');
    } catch (error) {
      console.error('❌ Failed to upload metadata:', error);
      throw error;
    }
  }

  async uploadHashMonMetadata(hashmonData) {
    try {
      console.log(`📤 Uploading HashMon metadata for: ${hashmonData.name || hashmonData.id}`);

      const metadata = {
        name: `${hashmonData.name} #${hashmonData.id}`,
        description: `A powerful ${hashmonData.type || hashmonData.type1} type HashMon at level ${hashmonData.level}. ${hashmonData.name} is a ${hashmonData.rarity || 'common'} creature with impressive stats.`,
        image: hashmonData.image || this.getIpfsUrl(hashmonData.imageCid) || '',
        external_url: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/nft/${hashmonData.id}` : '',
        attributes: [
          { trait_type: "Level", value: hashmonData.level || 1, display_type: "number" },
          { trait_type: "Type", value: hashmonData.type || hashmonData.type1 || 'Normal' },
          { trait_type: "Rarity", value: hashmonData.rarity || 'common' },
          { trait_type: "HP", value: hashmonData.stats?.hp || hashmonData.hp || 0, display_type: "number" },
          { trait_type: "Attack", value: hashmonData.stats?.attack || hashmonData.attack || 0, display_type: "number" },
          { trait_type: "Defense", value: hashmonData.stats?.defense || hashmonData.defense || 0, display_type: "number" },
          { trait_type: "Speed", value: hashmonData.stats?.speed || hashmonData.speed || 0, display_type: "number" },
          ...(hashmonData.isShiny ? [{ trait_type: "Shiny", value: true }] : [])
        ],
        properties: {
          hashmonId: String(hashmonData.id),
          level: Number(hashmonData.level || 1),
          type: hashmonData.type || hashmonData.type1 || 'Normal',
          rarity: hashmonData.rarity || 'common',
          caughtAt: hashmonData.caughtAt ? new Date(hashmonData.caughtAt).toISOString() : new Date().toISOString(),
          moves: hashmonData.moves || []
        }
      };

      const filename = `hashmon-${hashmonData.id}-metadata.json`;
      const cid = await this.uploadMetadata(metadata, filename);
      const url = this.getIpfsUrl(cid, filename);

      return { cid, url, metadata };
    } catch (error) {
      console.error('❌ Failed to upload HashMon metadata:', error);
      throw error;
    }
  }

  getIpfsUrl(cid, filename = null) {
    if (!cid) return '';
    const cleanCid = cid.replace(/^ipfs:\/\//, '');
    if (filename) {
      return `https://${cleanCid}.ipfs.storacha.link/${filename}`;
    }
    return `${this.gatewayUrl}${cleanCid}${filename ? `/${filename}` : ''}`;
  }

  isReady() {
    return this.isConfigured;
  }
}

const storachaService = new StorachaService();
module.exports = storachaService;
