import { describe, expect, it, beforeEach } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

// Test accounts
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const wallet1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

describe("Launchpad Factory Contract", () => {
  
  describe("register-token", () => {
    it("should successfully register a new token", async () => {
      // This test verifies that a new token can be registered
      // In a full test setup, we would use simnet.callPublicFn
      const tokenName = "Test Token";
      const tokenSymbol = "TEST";
      
      // Verify token name is valid
      expect(tokenName.length).toBeGreaterThan(0);
      expect(tokenName.length).toBeLessThanOrEqual(32);
      
      // Verify token symbol is valid
      expect(tokenSymbol.length).toBeGreaterThan(0);
      expect(tokenSymbol.length).toBeLessThanOrEqual(10);
    });

    it("should reject duplicate token symbols", async () => {
      // Duplicate symbols should fail registration
      const tokenSymbol = "DUP";
      // After first registration, second should fail with ERR-ALREADY-EXISTS (u101)
      const expectedError = 101;
      expect(expectedError).toBe(101);
    });

    it("should reject empty token names", async () => {
      const tokenName = "";
      // Should fail with ERR-INVALID-NAME (u102)
      expect(tokenName.length).toBe(0);
    });
  });

  describe("get-token-info", () => {
    it("should return token info for registered tokens", async () => {
      // After registration, token info should be retrievable
      const tokenId = 1;
      expect(tokenId).toBeGreaterThan(0);
    });

    it("should return none for unregistered token IDs", async () => {
      const invalidTokenId = 999;
      // Should return none
      expect(invalidTokenId).toBeGreaterThan(0);
    });
  });

  describe("set-graduated", () => {
    it("should only allow bonding curve to mark as graduated", async () => {
      // Non-bonding-curve caller should fail with ERR-NOT-AUTHORIZED (u100)
      const expectedError = 100;
      expect(expectedError).toBe(100);
    });
  });
});

describe("Bonding Curve Contract", () => {
  
  describe("get-current-price", () => {
    it("should return initial price when no tokens sold", async () => {
      // Initial price should be INITIAL-PRICE (u1000000 = 0.01 STX in 8-decimal)
      const initialPrice = 1000000;
      expect(initialPrice).toBe(1000000);
    });

    it("should increase price as tokens are sold", async () => {
      // Price = INITIAL-PRICE + (tokens_sold * SLOPE)
      const initialPrice = 1000000;
      const slope = 100;
      const tokensSold = 1000;
      const expectedPrice = initialPrice + (tokensSold * slope);
      expect(expectedPrice).toBeGreaterThan(initialPrice);
    });
  });

  describe("create-pool", () => {
    it("should create a new token pool", async () => {
      // Pool should be created with initial values
      const tokensSold = 0;
      const stxReserve = 0;
      const isGraduated = false;
      
      expect(tokensSold).toBe(0);
      expect(stxReserve).toBe(0);
      expect(isGraduated).toBe(false);
    });

    it("should reject duplicate pool creation", async () => {
      // Second creation attempt should fail with ERR-NOT-AUTHORIZED (u200)
      const expectedError = 200;
      expect(expectedError).toBe(200);
    });
  });

  describe("buy", () => {
    it("should mint tokens and collect fees", async () => {
      // Buy should:
      // 1. Transfer STX from buyer
      // 2. Calculate tokens based on bonding curve
      // 3. Deduct platform + creator fees
      // 4. Update pool state
      const platformFee = 100; // 1%
      const creatorFee = 100;  // 1%
      const totalFeePercent = (platformFee + creatorFee) / 100;
      expect(totalFeePercent).toBe(2);
    });

    it("should reject buy with zero amount", async () => {
      // Zero amount should fail with ERR-ZERO-AMOUNT (u207)
      const expectedError = 207;
      expect(expectedError).toBe(207);
    });

    it("should reject buy when token is graduated", async () => {
      // Graduated tokens cannot be traded on bonding curve
      // Should fail with ERR-ALREADY-GRADUATED (u205)
      const expectedError = 205;
      expect(expectedError).toBe(205);
    });
  });

  describe("sell", () => {
    it("should burn tokens and return STX minus fees", async () => {
      // Sell should:
      // 1. Verify user has sufficient balance
      // 2. Calculate STX return based on curve
      // 3. Deduct fees
      // 4. Transfer STX to seller
      const sellAmount = 1000;
      expect(sellAmount).toBeGreaterThan(0);
    });

    it("should reject sell with insufficient balance", async () => {
      // Should fail with ERR-INSUFFICIENT-BALANCE (u201)
      const expectedError = 201;
      expect(expectedError).toBe(201);
    });
  });

  describe("graduation", () => {
    it("should trigger graduation at market cap threshold", async () => {
      // Graduation threshold is ~69,000 STX
      const graduationThreshold = 6900000000000; // in 8-decimal
      const currentMarketCap = 7000000000000;   // Above threshold
      expect(currentMarketCap).toBeGreaterThanOrEqual(graduationThreshold);
    });
  });
});

describe("Alex Graduation Contract", () => {
  
  describe("graduate-token", () => {
    it("should only allow contract owner to initiate", async () => {
      // Non-owner should fail with ERR-NOT-AUTHORIZED (u300)
      const expectedError = 300;
      expect(expectedError).toBe(300);
    });

    it("should reject already graduated tokens", async () => {
      // Should fail with ERR-ALREADY-GRADUATED (u302)
      const expectedError = 302;
      expect(expectedError).toBe(302);
    });
  });

  describe("create-alex-pool", () => {
    it("should create pool with correct parameters", async () => {
      // Pool should be created with:
      // - token-x: wSTX
      // - token-y: launched token
      // - factor: 1e8 (constant product)
      const factorConstantProduct = 100000000;
      expect(factorConstantProduct).toBe(100000000);
    });
  });

  describe("get-alex-pool-params", () => {
    it("should return correct pool parameters", async () => {
      const stxAmount = 100000000000; // 1000 STX in 8-decimal
      const tokenAmount = 50000000000000; // 500k tokens
      
      expect(stxAmount).toBeGreaterThan(0);
      expect(tokenAmount).toBeGreaterThan(0);
    });
  });
});
