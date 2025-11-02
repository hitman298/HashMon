const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("HashMonModule", (m) => {
  // Deploy HashMon contract with deployer as initial owner
  const hashmon = m.contract("HashMon", [m.getAccount(0)]);

  return { hashmon };
});

