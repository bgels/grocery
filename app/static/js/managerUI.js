// static/js/managerUI.js

export function initManagerPage({
    game,
    PRODUCT_CATALOG,
    UPGRADES,
    ITEMS,
    RARITY_ORDER,
    advanceGame,
    buyStock,
    buyUpgrade,
    buyItem, 
    getUpgradeCost,
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
    const amountSelectorContainer = document.getElementById("amountSelectorContainer");
    const buyAmountButtons = document.querySelectorAll(".buyAmountButton");

    let selectedId = null;
    let selectedType = null; // 'upgrade', 'item', or 'product'
    let selectedBuyAmount = 1;
    const page = document.body.dataset.page;


    function selectShopItem(id, type) {
        selectedId = id;
        selectedType = type;
        selectedBuyAmount = 1; 
        renderSelectedProductPanel();
        renderManagerShop();
    }

    function renderManagerShop() {
        if (page !== "manager" || !productGrid) return;
        productGrid.innerHTML = "";
        // const upgradeHeader = document.createElement("div");
        // upgradeHeader.className = "col-span-2 text-left text-lg font-bold text-yellow-400 mt-2 mb-1 border-b border-gray-700 pb-1";
        // upgradeHeader.innerText = "Upgrades";
        // productGrid.appendChild(upgradeHeader);

        for (const id in UPGRADES) {
            const btn = document.createElement("button");
            btn.className = `border border-gray-500 p-2 transition flex flex-col items-center justify-center gap-2 ${selectedId === id ? 'bg-gray-200 text-black font-bold' : 'hover:bg-gray-100'}`;
            
            btn.innerHTML = `
                <img src="/static/images/upgrades/${UPGRADES[id].name}.png" class="w-10 h-10 image-rendering-pixelated object-contain" />
                <span class="text-xs text-center">${UPGRADES[id].name}</span>
            `;
            btn.onclick = () => selectShopItem(id, 'upgrade');
            productGrid.appendChild(btn);
        }
        // const itemHeader = document.createElement("div");
        // itemHeader.className = "col-span-2 text-left text-lg font-bold text-green-400 mt-4 mb-1 border-b border-gray-700 pb-1";
        // itemHeader.innerText = "Items";
        // productGrid.appendChild(itemHeader);

        for (const id in ITEMS) {
            const btn = document.createElement("button");
            btn.className = `border border-gray-500 p-2 transition flex flex-col items-center justify-center gap-2 ${selectedId === id ? 'bg-gray-200 text-black font-bold' : 'hover:bg-gray-100'}`;
            
            btn.innerHTML = `
                <img src="/static/images/items/${ITEMS[id].name}.png" class="w-10 h-10 image-rendering-pixelated object-contain" />
                <span class="text-xs text-center">${ITEMS[id].name}</span>
            `;
            btn.onclick = () => selectShopItem(id, 'item');
            productGrid.appendChild(btn);
        }
        // const productHeader = document.createElement("div");
        // productHeader.className = "col-span-2 text-left text-lg font-bold text-blue-400 mt-4 mb-1 border-b border-gray-700 pb-1";
        // productHeader.innerText = "Products";
        // productGrid.appendChild(productHeader);

        for (const id in PRODUCT_CATALOG) {
            const product = PRODUCT_CATALOG[id];
            const requiredLevel = RARITY_ORDER.indexOf(product.rarity);
            const isLocked = game.upgrades.shelf < requiredLevel;

            const btn = document.createElement("button");
            if(isLocked){
            btn.className = `border border-gray-700 bg-gray-800 rounded p-2 flex flex-col items-center justify-center gap-2 opacity-50 cursor-not-allowed`;
            btn.innerHTML = `
                <img src="/static/images/ingredients/${product.name}.png" class="w-12 h-12 image-rendering-pixelated object-contain grayscale"/>
                <span class="text-xs text-center text-gray-400">Logistics Lvl ${requiredLevel}</span>
            `;
            btn.onclick = () => {selectShopItem(null, null);};
            }else{
            btn.className = `border border-gray-500 p-2 transition flex flex-col items-center justify-center gap-2 ${selectedId === id ? 'bg-gray-200 text-black font-bold' : 'hover:bg-gray-100'}`;
            btn.innerHTML = `
                <img src="/static/images/ingredients/${PRODUCT_CATALOG[id].name}.png" class="w-12 h-12 image-rendering-pixelated object-contain"/>
                <span class="text-xs text-center">${PRODUCT_CATALOG[id].name}</span>
            `;
            btn.onclick = () => selectShopItem(id, 'product');
            }

            productGrid.appendChild(btn);
        }
    }

    function renderSelectedProductPanel() {
        if (page !== "manager" || !selectedProductName) return;
        if (!selectedId) {
            selectedProductName.innerText = "Select an item";
            selectedProductOwned.innerText = "Owned: --";
            selectedProductBuyPrice.innerText = "Buy Price: --";
            selectedProductSellPrice.innerText = "Sell Price: --";
            selectedProductTotal.innerText = "Total Cost: --";
            if (buySelectedStockButton) buySelectedStockButton.classList.add("hidden");
            if (amountSelectorContainer) amountSelectorContainer.classList.add("hidden");
            return;
        }

        if (buySelectedStockButton) buySelectedStockButton.classList.remove("hidden");

        if (selectedType === 'upgrade') {
            if (amountSelectorContainer) amountSelectorContainer.classList.add("hidden");
            const upgrade = UPGRADES[selectedId];
            const currentLevel = game.upgrades[selectedId];
            const isMax = currentLevel >= upgrade.maxLevel;
            const cost = isMax ? 0 : getUpgradeCost(selectedId);

            selectedProductName.innerText = upgrade.name;
            selectedProductOwned.innerText = `Level: ${currentLevel} / ${upgrade.maxLevel}`;
            selectedProductBuyPrice.innerText = isMax ? `Buy Price: MAXED` : `Buy Price: $${cost.toFixed(2)}`;
            selectedProductSellPrice.innerText = `Sell Price: You can't sell this y'know...`;
            selectedProductTotal.innerText = isMax ? `Total Cost: N/A` : `Total Cost: $${cost.toFixed(2)}`;
        } 
        else if (selectedType === 'item') {
            if (amountSelectorContainer) amountSelectorContainer.classList.remove("hidden");
            const item = ITEMS[selectedId];
            const owned = game.items[selectedId] || 0;
            const cost = item.price;
            const totalCost = roundMoney(cost * selectedBuyAmount);

            selectedProductName.innerText = item.name;
            selectedProductOwned.innerText = `Owned: ${owned}`;
            selectedProductBuyPrice.innerText = `Buy Price: $${cost.toFixed(2)}`;
            selectedProductSellPrice.innerText = `Sell Price: You can't sell this y'know...`;
            selectedProductTotal.innerText = `Total Cost: $${totalCost.toFixed(2)} for x${selectedBuyAmount}`;
        } 
        else if (selectedType === 'product') {
            if (amountSelectorContainer) amountSelectorContainer.classList.remove("hidden");
            const product = PRODUCT_CATALOG[selectedId];
            const owned = game.stock[selectedId] ? game.stock[selectedId].quantity : 0;
            const totalCost = roundMoney(product.buyPrice * selectedBuyAmount);

            selectedProductName.innerText = product.name;
            selectedProductOwned.innerText = `Owned: ${owned}`;
            selectedProductBuyPrice.innerText = `Buy Price: $${product.buyPrice.toFixed(2)}`;
            selectedProductSellPrice.innerText = `Sell Price: $${product.sellPrice.toFixed(2)}`;
            selectedProductTotal.innerText = `Total Cost: $${totalCost.toFixed(2)} for x${selectedBuyAmount}`;
        }
    }

    if (advanceButton) advanceButton.addEventListener("click", advanceGame);
    for (const button of buyAmountButtons) {
        button.addEventListener("click", function() {
            if (selectedType !== 'upgrade') {
                selectedBuyAmount = Number(button.dataset.amount);
                renderSelectedProductPanel();
            }
        });
    }

    if (buySelectedStockButton) {
        buySelectedStockButton.addEventListener("click", function() {
            if (!selectedId) return;

            if (selectedType === 'upgrade') {
                buyUpgrade(selectedId);
            } else if (selectedType === 'item') {
                buyItem(selectedId, selectedBuyAmount);
            } else if (selectedType === 'product') {
                buyStock(selectedId, selectedBuyAmount);
            }
            
            renderManagerShop();
            renderSelectedProductPanel();
        });
    }

    renderManagerShop();
    renderSelectedProductPanel();

    return {
        manager_main,
        manager_console,
        renderManagerShop,
        renderSelectedProductPanel
    };
}