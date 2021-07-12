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
    mapping(string => address) public recipeOwner;

    function _createRecipe(string memory _name, string memory _method) public {
        // Create recipe from params, set value to 1, owner to msg.sender
        require(recipes[_name].value == 0);
        Recipe memory newRecipe = Recipe(_name, _method, 1, msg.sender);

        // Add to recipes mapping
        recipes[_name] = newRecipe;

        // Add recipe to dict, assign to msg.sender
        recipeOwner[_name] = msg.sender;
    }

    function _getOwner(string memory _name) public view returns (address) {
        return recipeOwner[_name];
    }

    function _transferRecipe(
        address oldOwner,
        address newOwner,
        string memory _recipeName
    ) public returns (address) {
        // Ensure recipe belongs to old owner
        require(recipeOwner[_recipeName] == oldOwner);

        // Transfer recipe to newOwner
        recipeOwner[_recipeName] = newOwner;
        recipes[_recipeName].owner = newOwner;

        // Increment recipe's value
        recipes[_recipeName].value++;

        return recipeOwner[_recipeName];
    }
}
