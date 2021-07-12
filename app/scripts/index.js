import { $dataMetaSchema } from "ajv";
import Web3 from "web3";
import recipeArtifact from "../../build/contracts/RecipeContract.json";

const App = {
    web3: null,
    account: null,
    recipeContract: null,

    start: async function() {
        const { web3 } = this;

        try {
            const networkId = await web3.eth.net.getId();
            console.log("hi2");

        } catch (error) {
            console.log("???")
            console.error("Couldn't connect", error);
        }
    }
}

window.App = App;

$(document).ready(function () {
    console.log("hi")
})