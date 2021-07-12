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
            return this.accountAddress

        } catch (error) {
            console.error("Couldn't connect", error);
        }
    },

    // This method stores newly minted recipe's data to fleek
    storeRecipe: async function(recipeName, method) {
        const metadata = {
            "name": "Recipe NFT",
            "recipeName": recipeName,
            "ownerAddress": this.accountAddress,
            "timestamp": new Date().toISOString()
        };

        const uploadMetadata = {
            apiKey: '5IMtHxK6FwtjLOiNFZ1BxA==',
            apiSecret: '2wCDPZz3HstZ/wsPPUZx4eXJ7qSWtPShy8dT7/jjiDg=',
            key: `${recipeName}.json`,
            data: JSON.stringify(metadata),
        }

        const result = await fleek.upload(uploadMetadata)
    },

    // This method mints a brand new recipe and adds it to the blockchain
    createRecipe: async function(recipeName, method, URL) {
        await this.recipeContract.methods._createRecipe(recipeName, method).send({ from: this.accountAddress });
        this.displayMessage(`You have created a recipe! View the data here: <a href="${URL}" target="_blank">here</a>.`);

        $("#all-recipes").append($(`<p class=${recipeName}></p>`).html(`<b>Recipe Name:</b> ${recipeName} -- <b>Owner Address:</b> You are the owner of this recipe! <b style="color: #00ff00">(Recipe minted successfully!)</b>`));
    },

    // Transfer a recipe that you own to another user by specifying their address
    transferRecipe: async function(otherUsersAddress, recipeName) {
        try {
            await this.recipeContract.methods._transferRecipe(otherUsersAddress, recipeName).send({ from: this.accountAddress });

        } catch (error) { // Display error message if failed to transfer. This likely occurs if you are trying to transfer a recipe you don't own
            this.displayMessage(`<b style="color: #ff0000">Error. You cannot transfer a recipe that you don't own!</b>`);
            $(`.${recipeName}`).text(`<p class=${recipeName}></p>`).html(`<b>Recipe Name:</b> ${recipeName} -- <b>Owner Address:</b> ${otherUsersAddress} <b style="color: #ff0000">(Failed to transfer ownership.)</b>`);
            return;
        }

        // Parameters to delete metadata of previous recipe's owner
        const fleekDelete = {
            apiKey: '5IMtHxK6FwtjLOiNFZ1BxA==',
            apiSecret: '2wCDPZz3HstZ/wsPPUZx4eXJ7qSWtPShy8dT7/jjiDg=',
            key: `${recipeName}.json`,
            bucket: 'xiliav-team-bucket'
        }

        // Parameters to update metadata of recipe to new owner
        const newMetaData = {
            "name": "Recipe NFT",
            "recipeName": recipeName,
            "ownerAddress": otherUsersAddress,
            "timestamp": new Date().toISOString()
        }

        const fleekUpdate = {
            apiKey: '5IMtHxK6FwtjLOiNFZ1BxA==',
            apiSecret: '2wCDPZz3HstZ/wsPPUZx4eXJ7qSWtPShy8dT7/jjiDg=',
            key: `${recipeName}.json`,
            data: JSON.stringify(newMetaData),
        }

        // Call fleek's delete method with desired parameters
        const deleteFile = await fleek.deleteFile(fleekDelete);
        // Call fleek's upload method with desired parameters
        const updateFile = await fleek.upload(fleekUpdate);
        // Replace transferred recipe's original owner with new owner on webpage
        $(`.${recipeName}`).text(`<p class=${recipeName}></p>`).html(`<b>Recipe Name:</b> ${recipeName} -- <b>Owner Address:</b> ${otherUsersAddress} <b style="color: #00ff00">(Ownership Transferred!)</b>`);
    },

    // Display a success message and link to data on successful creation of new recipe
    displayMessage: async function(result) {
        $("#result").html(result)
    },

}

window.App = App;

$(document).ready(async function () {
    if (window.ethereum) {
        App.web3 = new Web3(window.ethereum);
        window.ethereum.enable();

    } else {
        console.log("error")
    }

    const address = await window.App.start();

    // Initialize data needed to pull information from fleek
    const fleekInput = {
        apiKey: '5IMtHxK6FwtjLOiNFZ1BxA==',
        apiSecret: '2wCDPZz3HstZ/wsPPUZx4eXJ7qSWtPShy8dT7/jjiDg=',
        bucket: 'xiliav-team-bucket',
        getOptions: ['publicUrl']
    }

    // Grab information about all recipes from fleek
    const result = await fleek.listFiles(fleekInput)

        // Loop through all data and display on homepage
        $.each(result, function(index, value) {
            $.ajax({
                type: "GET",
                url: value['publicUrl'],
                dataType: "json",
                success: function (data) {
                    let owner = ''

                    if (data.ownerAddress == address) {
                        owner = "You are the owner of this recipe!"
                    } else {
                        owner = data.ownerAddress
                    }

                    $("#all-recipes").append($(`<p class=${data.recipeName}></p>`).html(`<b>Recipe Name:</b> ${data.recipeName} -- <b>Owner Address:</b> ${owner}`));
                }
            })
        })

    // Submit form data needed to mint a new recipe
    $("#submit-button").on("click", function (e) {
        e.preventDefault();

        const recipeName = $("#name-input").val();
        const method = $("#method-input").val();
        
        window.App.storeRecipe(recipeName, method);
    });

    // Submit data needed to transfer ownership of a recipe from one user to another
    $("#transfer-submit").on("click", function (e) {
        e.preventDefault();

        const recipeName = $("#recipe-name").val();
        const transferAddress = $("#other-user-address").val();

        window.App.transferRecipe(transferAddress, recipeName);
    });
})