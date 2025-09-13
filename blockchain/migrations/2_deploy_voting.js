const Voting = artifacts.require('Voting')

// Deploy the Voting contract and call the constructor
module.exports = function (deployer) {
  deployer.deploy(Voting)
}
