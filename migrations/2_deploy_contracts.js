const RecipeContract = artifacts.require("RecipeContract");

module.exports = function (deployer) {
	deployer.deploy(RecipeContract);
};
