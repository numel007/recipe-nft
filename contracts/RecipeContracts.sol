pragma solidity >=0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

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
    mapping(uint256 => address) public recipeOwner;

    function _createRecipe(string memory _name, string memory _method) public {
        // Create recipe from params, set value to 1, owner to msg.sender
        require(recipes[_name].value != 0);
        Recipe memory newRecipe = Recipe(_name, _method, 1, msg.sender);

        // Push to recipes mapping
        recipes[_name] = newRecipe;

        // Add recipe to dict, assign to msg.sender
    }

    function _getOwner(uint256 recipeId) public view returns (address) {
        return recipeOwner[recipeId];
    }

    function _transferRecipe(
        address oldOwner,
        address newOwner,
        uint256 recipeId
    ) private returns (address) {
        require(recipeOwner[recipeId] == oldOwner);
        recipeOwner[recipeId] = newOwner;
        return recipeOwner[recipeId];
    }
}
