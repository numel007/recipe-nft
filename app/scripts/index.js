import Web3 from "web3";
import recipeArtifact from "../../build/contracts/RecipeContract.json";
import fleek from '@fleekhq/fleek-storage-js';


const App = {
    web3: null,
    accountAddress: null,
    recipeContract: null,

    start: async function() {
        const { web3 } = this;

        try {
            const networkId = await web3.eth.net.getId();
            const newContract = recipeArtifact.networks[networkId];
            this.recipeContract = new web3.eth.Contract(
                recipeArtifact.abi,
                newContract.address,
            )

            const accounts = await web3.eth.getAccounts();
            this.accountAddress = accounts[0];

        } catch (error) {
            console.error("Couldn't connect", error);
        }
    },

    storeRecipe: async function(recipeName, method) {
        const metadata = {
            "name": "Recipe NFT",
            "description": `Recipe name: ${recipeName}`,
            "method": method,
            "timestamp": new Date().toISOString()
        };

        const uploadMetadata = {
            apiKey: '5IMtHxK6FwtjLOiNFZ1BxA==',
            apiSecret: '2wCDPZz3HstZ/wsPPUZx4eXJ7qSWtPShy8dT7/jjiDg=',
            key: `${metadata.timestamp}.json`,
            data: JSON.stringify(metadata),
        }

        console.log('beginning upload')
        const result = await fleek.upload(uploadMetadata)
        console.log("uploaded to fleek")
        this.createRecipe(recipeName, method, result.publicUrl)

    },

    createRecipe: async function(recipeName, method, URL) {
        await this.recipeContract.methods._createRecipe(recipeName, method).send({ from: this.accountAddress });
        this.displaySuccess(`You have created a recipe! View the data here: <a href="${URL}" target="_blank">here</a>.`);
        this.displayRecipes();
    },

    displaySuccess: async function(result) {
        $("#result").html(result)
    },

    displayRecipes: async function() {
        const fleekInput = {
            apiKey: '5IMtHxK6FwtjLOiNFZ1BxA==',
            apiSecret: '2wCDPZz3HstZ/wsPPUZx4eXJ7qSWtPShy8dT7/jjiDg=',
            bucket: 'xiliav-team-bucket',
            getOptions: ['publicUrl']
        }

        const result = await fleek.listFiles(fleekInput)
        $.each(result, function(index, value) {
            $.ajax({
                type: "GET",
                url: value['publicUrl'],
                dataType: "json",
                success: function (data) {
                    $("#all-recipes").append($(`<p></p>`).html(`${data['description']}<a href="#" class="transfer ${data['description']}">Get This Recipe</a>`))
                }
            })
        })
    }
}

window.App = App;

$(document).ready(async function () {
    if (window.ethereum) {
        App.web3 = new Web3(window.ethereum);
        window.ethereum.enable();

    } else {
        console.log("error")
    }

    window.App.start();

    $("#submit-button").on("click", function (e) {
        e.preventDefault();

        const recipeName = $("#name-input").val();
        const method = $("#method-input").val();
        
        window.App.storeRecipe(recipeName, method);
    });
})