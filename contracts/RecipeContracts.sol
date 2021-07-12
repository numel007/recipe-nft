pragma solidity >=0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract RecipeContract is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() public ERC721("Recipe", "RCP") {}

    struct Recipe {
        string name;
        string method;
        uint256 value;
    }

    Recipe[] public recipes;
    mapping(uint256 => address) public recipeOwner;

    function _createRecipe(string memory _name, string memory _method) private {
        // Create recipe from params, set value to 1
        Recipe memory newRecipe = Recipe(_name, _method, 1);

        // Push to recipes array and return id
        recipes.push(newRecipe);
        uint256 id = recipes.length - 1;

        // Add recipe to dict, assign to msg.sender
        recipeOwner[id] = msg.sender;
    }
}
