// static/js/managerUI.js

export function initManagerPage({
    game,
    PRODUCT_CATALOG,
    advanceGame,
    buyStock,
    roundMoney
}) {
    const manager_main = document.getElementById("main");
    const manager_console = document.getElementById("main2");
    const advanceButton = document.getElementById("advanceGame");

    const productGrid = document.getElementById("productGrid");
    const selectedProductName = document.getElementById("selectedProductName");
    const selectedProductOwned = document.getElementById("selectedProductOwned");
    const selectedProductBuyPrice = document.getElementById("selectedProductBuyPrice");
    const selectedProductSellPrice = document.getElementById("selectedProductSellPrice");
    const selectedProductTotal = document.getElementById("selectedProductTotal");
    const buySelectedStockButton = document.getElementById("buySelectedStock");
    const buyAmountButtons = document.querySelectorAll(".buyAmountButton");

    let selectedProductId = null;
    let selectedBuyAmount = 1;
    const page = document.body.dataset.page;

    function selectProduct(productId){
        selectedProductId = productId;
        selectedBuyAmount = 1;
        renderSelectedProductPanel();
    }

    function renderManagerShop(){
        if(page !== "manager" || !productGrid){
            return;
        }
        productGrid.innerHTML = "";

        for(const productId in PRODUCT_CATALOG){
            const product = PRODUCT_CATALOG[productId];
            const owned = game.stock[productId] ? game.stock[productId].quantity : 0;

            const button = document.createElement("button");
            button.className = " p-4 hover:bg-gray-200 hover:text-black hover:-translate-y-1 transition text-left";
            button.dataset.productId = productId;

            button.innerHTML = `
                <p class="sm:text-xs md:text-sm lg:text-xl font-bold letter-hover-text">${product.name}</p>
            `;

            button.addEventListener("click", function(){
                selectProduct(productId);
            });

            productGrid.appendChild(button);
        }
    }

    function renderSelectedProductPanel(){
        if(!selectedProductName){
            return;
        }

        if(!selectedProductId){
            selectedProductName.innerText = "Select an item";
            selectedProductOwned.innerText = "Owned: --";
            selectedProductBuyPrice.innerText = "Buy Price: --";
            selectedProductSellPrice.innerText = "Sell Price: --";
            selectedProductTotal.innerText = "Total Cost: --";
            return;
        }

        const product = PRODUCT_CATALOG[selectedProductId];
        const owned = game.stock[selectedProductId] ? game.stock[selectedProductId].quantity : 0;
        const totalCost = roundMoney(product.buyPrice * selectedBuyAmount);

        selectedProductName.innerText = product.name;
        selectedProductOwned.innerText = `Owned: ${owned}`;
        selectedProductBuyPrice.innerText = `Buy Price: $${product.buyPrice.toFixed(2)}`;
        selectedProductSellPrice.innerText = `Sell Price: $${product.sellPrice.toFixed(2)}`;
        selectedProductTotal.innerText = `Total Cost: $${totalCost.toFixed(2)} for x${selectedBuyAmount}`;
    }

    advanceButton.addEventListener("click", advanceGame);

    for(const button of buyAmountButtons){
        button.addEventListener("click", function(){
            selectedBuyAmount = Number(button.dataset.amount);
            renderSelectedProductPanel();
        });
    }

    buySelectedStockButton.addEventListener("click", function(){
        if(selectedProductId){
            buyStock(selectedProductId, selectedBuyAmount);
            renderManagerShop();
            renderSelectedProductPanel();
        }
    });

    renderManagerShop();
    renderSelectedProductPanel();

    return {
        manager_main,
        manager_console,
        renderManagerShop,
        renderSelectedProductPanel
    };
}
