var FoodBankContract = artifacts.require("FoodBank");
var PlanCContract = artifacts.require("PlanC");
var RatingCContract = artifacts.require("RatingC");
var VotingContract = artifacts.require("Voting");
var FbTokenContract = artifacts.require("FBToken");

module.exports = function(deployer) {
  deployer.deploy(FoodBankContract);
  deployer.deploy(PlanCContract);
  deployer.deploy(RatingCContract);
  deployer.deploy(VotingContract);
  deployer.deploy(FbTokenContract);
};