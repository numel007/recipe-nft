pragma solidity >=0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/solidity-string-utils/StringUtils.sol";

contract RecipeContract is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // constructor() public ERC721("Recipe", "RCP") {}

    struct Recipe {
        string name;
        string method;
        uint256 value;
        address owner;
    }

    mapping(string => Recipe) private recipes;
    mapping(string => address) public recipeOwner;
    string[] public recipeNames;

    function _createRecipe(string memory _name, string memory _method) public {
        // Create recipe from params, set value to 1, owner to msg.sender
        require(recipes[_name].value == 0);
        Recipe memory newRecipe = Recipe(_name, _method, 1, msg.sender);

        // Add to recipes mapping and recipeNames list
        recipes[_name] = newRecipe;
        recipeNames.push(_name);

        // Add recipe to dict, assign to msg.sender
        recipeOwner[_name] = msg.sender;
    }

    function _getOwner(string memory _name) public view returns (address) {
        return recipeOwner[_name];
    }

    function _getAllRecipes() public view returns (string[] memory) {
        string[] memory names;
        // string[] memory methods;
        // uint256[] memory values;
        // address[] memory owners;
        uint256 recipesLength = recipeNames.length;
        for (uint256 i = 0; i < recipesLength; i++) {
            names[i] = recipes[recipeNames[i]].name;
            // methods[i] = recipes[recipeNames[i]].method;
            // values[i] = recipes[recipeNames[i]].value;
            // owners[i] = recipes[recipeNames[i]].owner;
        }

        return (names);
    }

    function _getRecipeValue(string memory _recipeName)
        public
        view
        returns (uint256)
    {
        uint256 recipesLength = recipeNames.length;
        for (uint256 i = 0; i < recipesLength; i++) {
            if (StringUtils.equal(recipes[i].name, _recipeName)) {
                return uint256(recipes[i].value);
            }
        }
    }

    function _transferRecipe(address newOwner, string memory _recipeName)
        public
        returns (address)
    {
        // Ensure msg.sender is the one transferring the recipe
        require(recipeOwner[_recipeName] == msg.sender);

        // Transfer recipe to newOwner
        recipeOwner[_recipeName] = newOwner;
        recipes[_recipeName].owner = newOwner;

        // Increment recipe's value
        recipes[_recipeName].value++;

        return recipeOwner[_recipeName];
    }
}

// let instance = await RecipeContract.deployed()
// let bread = await instance._createRecipe("Bread", "yeast")
// let getAll = await instance._getAllRecipes()
