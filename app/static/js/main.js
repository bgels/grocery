import { GAMESTATE, CUSTOMER_PRESETS, PRODUCT_CATALOG, UPGRADES, ITEMS, RARITY_ORDER } from "./constants.js";
import { initCashierPage } from "./cashierUI.js";
import { initManagerPage } from "./managerUI.js";
import { renderRandomCharacter } from "./animate.js";
export { game, rejectCustomer };
// To do:
// GAME:
// 1. Make function to decline a customer and generate a new one, this will incur a money penalty on the player by subtracting the store's current money by %2-3 percent (DONE)
// 2. Add a time limit for player to check out, if they don't check out in time incur a money penalty
// 3. Make gun upgrade system, take a look at the amount of ammo in upgrades for stock, if there is sufficent ammo and player uses gun they skip to next customer instantly without incurring any money penalities 
// 4. Make other upgrades as needed


const usingLocalstorage = true;
const dailyMoneyGoal = 20;
const budgetVariance = Math.floor(Math.random() * 10) - 5; // change/nerf later
const budgetMultiplier = .5;
const timeLimit = 10;

async function saveGame(){

    const gameToSave = { ...game };
    delete gameToSave.timeRemaining;
    delete gameToSave.dailyGoal;

    if(usingLocalstorage){
        console.warn("saving game to localStorage...");
        localStorage.setItem("saveFile", JSON.stringify(gameToSave));
        console.warn("saved!");
    }else{
        console.warn("saving game to database...");
        const route = "/save";
        try {
            const response = await fetch(route, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(gameToSave),
            });
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error("Save failed:", error);
        }
    }
}

async function loadGame(){
    if(usingLocalstorage){
        console.warn("loading save file from localStorage...")
        const savedString = localStorage.getItem("saveFile");
        if(savedString){
            Object.assign(game, JSON.parse(savedString));
            console.warn("Game loaded!");
        }
    }else{
        const route = "/load";
        try {
            const response = await fetch(route);
            if (response.ok) {
                const savedData = await response.json();
                Object.assign(game, savedData);
            } else {
                console.warn("WARNING! Save file could not be located on server!");
            }
        } catch (error) {
            console.error("Fetch error during load:", error);
        }
    }
}

async function resetGame(){
    if(usingLocalstorage){
        console.warn("Resetting save from localStorage");
        localStorage.removeItem("saveFile");
        console.warn("removed!");
    }else{
        console.warn("Resetting save from db");
        const route = "/reset";
        try{
            await fetch(route, {method: "POST"});
            changeUrl("homepage");
        }
        catch (error){
            console.error("Fetch error during reset:", error);
        }
    }

}


const game = {
    day: 1,
    maxDay: 7,
    money: 100,
    dailyGoal: 0,
    timeRemaining: 10,
    message: "Console here",
    state: GAMESTATE.DAY_START,
    hours: 2,

    customerQueue: [],
    currentCustomer: null,

    upgrades:{
        shelf: 0,
        register: 0, // advertising 
        decor: 0, // decoration
        firepower: 0
    },
    items:{
        ammo: 6
    },

    stock:{
        apple: {...PRODUCT_CATALOG.apple, quantity: 10},
        milk: {...PRODUCT_CATALOG.milk, quantity: 10},
        pilk: {...PRODUCT_CATALOG.pilk, quantity: 10},
        banana: {...PRODUCT_CATALOG.banana, quantity: 10}
    },
    stats:{
        served: 0,
        killed: 0,
        revenue: 0,
    },
};
// ----  Init and rendering starts below

// ---- Cashier Timer
let timerInterval = null;

function startCustomerTimer() {
    stopCustomerTimer();
    if (game.day === 1 && game.stats.served === 0 && game.stats.killed === 0) {
        game.timeRemaining = "∞";
        render();
        return;
    }
    const timeLimitBuff = game.upgrades.firepower * 2; 
    game.timeRemaining = timeLimit + timeLimitBuff;
    timerInterval = setInterval(() => {
        if (game.state === GAMESTATE.WAITING_FOR_CHANGE) return;

        game.timeRemaining--;
        if (game.timeRemaining <= 0) {
            timeOutCustomer();
        } else {
            render();
        }
    }, 1000);
}

function stopCustomerTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

async function timeOutCustomer() {
    stopCustomerTimer();
    const penalty = roundMoney((game.money * 0.05) + 2); // 5% + $2 flat penalty
    game.money = roundMoney(game.money - penalty);
    game.message = `Customer left angrily. -$${penalty.toFixed(2)} penalty.`;

    await checkBankruptcy();
    if (game.state === GAMESTATE.GAME_OVER) return;

    replaceCurrentCustomer();
    await saveGame();
    render();
}

async function rejectCustomer() {
    if (!game.currentCustomer || game.state !== GAMESTATE.CUSTOMER_CHECKOUT) return;

    stopCustomerTimer();
    if (game.items.ammo > 0) {
        game.items.ammo--;
        game.stats.killed++;
        game.message = `BANG. No Penalty Incurred.`;
    } else {
        const penalty = roundMoney((game.money * 0.05) + 2);
        game.money = roundMoney(game.money - penalty);
        game.message = `Warning: Kicked customer out! -$${penalty.toFixed(2)} penalty.`;
        await checkBankruptcy();
    }

    if (game.state === GAMESTATE.GAME_OVER) return;

    replaceCurrentCustomer();
    await saveGame();
    render();
}

async function checkBankruptcy() {
    if (game.money <= 0) {
        game.money = 0;
        game.state = GAMESTATE.GAME_OVER;
        game.message = "BANKRUPT! You ran out of money.";
        stopCustomerTimer();
        await saveGame();
        render();
    }
}

async function advanceGame() {
    switch(game.state){
        case GAMESTATE.DAY_START:
            getQueue(game.hours, budgetMultiplier); // change multiplier later
            const currentCustomers = game.hours + game.upgrades.register;
            const currentMultiplier = 0.5 + (game.upgrades.decor * 0.1);
            game.dailyGoal = roundMoney(game.money + (game.day * dailyMoneyGoal)); // dailyMoneyGoal
            game.message = `Day ${game.day} has begun.\n${game.customerQueue.length} customers today.`;
            game.state = GAMESTATE.CUSTOMER_CHECKOUT;
            nextCustomer();
            await saveGame();
            break;

        case GAMESTATE.DAY_END:
            startNight();
            await saveGame();
            if (game.state !== GAMESTATE.GAME_OVER) {
                changeUrl("manager");
            }
            break;

        case GAMESTATE.NIGHT_START:
            game.state = GAMESTATE.DAY_START;
            game.message = `Press Next to begin Day ${game.day}.`;
            await saveGame();
            changeUrl("cashier");
            break;

        case GAMESTATE.GAME_OVER:
        window.location.href = "/leaderboard";
        break;

        default:
            game.message = "Cannot do that right now.";
            render();
            break;
    }
}

// ----- main functions

// calculates budget pool for customers based on (total sell price of stock * multiplier)
function BudgetPool(multiplier){
    let total = 0;
    for(const i in game.stock){
        const item = game.stock[i];
        total += item.quantity * item.sellPrice;
    }
    return Math.floor(total * multiplier);
}

// generates a list of customer objects, assigned to game.customerQueue, and gives each customer a budget based on (budgetPool / customerCount)
function getQueue(customerCount, multiplier){
    const budgetPool = BudgetPool(multiplier);
    const averageBudget = Math.floor(budgetPool / customerCount);
    game.customerQueue = [];

    for (let i = 0; i < customerCount; i++) {
        const varianceBase = 10 + (game.upgrades.decor * 4);
        const budgetVariance = Math.floor(Math.random() * varianceBase) - 5; 

        const customerBudget = Math.max(3, averageBudget + budgetVariance);
        const customer = generateCustomer(customerBudget);
        game.customerQueue.push(customer);
    }
}

// generates a random customer with random appearance and money (to give to cashier) based on budget allocated to it
function generateCustomer(customerBudget){
    const firstNames = CUSTOMER_PRESETS.firstNames;
    const traits = CUSTOMER_PRESETS.traits;
    const bills = CUSTOMER_PRESETS.bills;

    const name = firstNames[Math.floor(Math.random() * firstNames.length)];
    const trait = traits[Math.floor(Math.random() * traits.length)];

    const cart = getCart(customerBudget);
    let totalCost = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
    }, 0);
    totalCost = roundMoney(totalCost * 1); // tax here

    let moneyGiven = bills.find(bill => bill >= totalCost);

    if (!moneyGiven) {
        moneyGiven = roundMoney(totalCost);
    }

    return{
        name,
        trait,
        cart,
        totalCost,
        moneyGiven
    }
}

// generates a cart of items from current stock based on budget provided
function getCart(cartBudget) {
    const cart = [];
    let remainingBudget = cartBudget;

    const tempStock = {};
    for(const itemId in game.stock){
        tempStock[itemId] = game.stock[itemId].quantity;
    }
    // const availableItems = Object.entries(game.stock).filter(([id, item]) => item.quantity > 0);

    let attempts = 0;

    while (remainingBudget > 0 && attempts < 20) { // how many attempts to retrieve stock?
        const availableItems = Object.entries(game.stock).filter(([id, item]) => {
            return tempStock[id] > 0 && item.sellPrice <= remainingBudget;
        });

        if (availableItems.length === 0) {
            break;
        }

        const [itemId, item] = availableItems[Math.floor(Math.random() * availableItems.length)];

        const cartItem = cart.find(cartEntry => cartEntry.id === itemId);
        if(cartItem){
            cartItem.quantity++;
        }else{
            cart.push({
            id: itemId,
            name: item.name,
            price: item.sellPrice,
            quantity: 1
            });
        }
        tempStock[itemId]--;
        remainingBudget = roundMoney(remainingBudget - item.sellPrice);
        attempts++;
    }
    return cart;
}

// checks if cashier's change is given correctly
function processPayment(changeGiven) {
    changeGiven = roundMoney(changeGiven);
    const customer = game.currentCustomer;
    if (!customer) {
        game.message = "There is no customer right now.";
        render();
        return;
    }

    game.state = GAMESTATE.WAITING_FOR_CHANGE;
    const expectedChange = roundMoney(customer.moneyGiven - customer.totalCost);
    if (changeGiven === expectedChange) {
        stopCustomerTimer();
        removeStockFromCart(customer.cart);

        let tipAmount = 0;
        const tipChance = game.upgrades.decor * 0.15;
        if (game.upgrades.decor > 0 && Math.random() < tipChance) {
            tipAmount = roundMoney(Math.random() * 6 + 1); 
        }
        let timeBonus = 0;
        if (game.upgrades.firepower > 0 && typeof game.timeRemaining === "number") {
            timeBonus = roundMoney(game.timeRemaining * (game.upgrades.firepower * 0.5));
        }
        const totalEarned = roundMoney(customer.totalCost + tipAmount + timeBonus);
        game.money = roundMoney(game.money + totalEarned);
        game.stats.served++;
        game.stats.revenue += totalEarned;

        let successMsg = `Correct change! +$${customer.totalCost.toFixed(2)}`;
        if (tipAmount > 0) successMsg += ` (Tip: +$${tipAmount.toFixed(2)})`;
        if (timeBonus > 0) successMsg += ` (Time Bonus: +$${timeBonus.toFixed(2)})`;
        game.message = successMsg;
        nextCustomer();
    } else {
        game.state = GAMESTATE.CUSTOMER_CHECKOUT;
        game.message = `Wrong change! Expected: $${expectedChange.toFixed(2)}`;
        render();
    }
}


// Stock, Upgrades, and Items

function getUpgradeCost(upgradeId) {
    const upgrade = UPGRADES[upgradeId];
    const level = game.upgrades[upgradeId];
    return roundMoney(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
}

function buyUpgrade(upgradeId) {
    if (game.state !== GAMESTATE.NIGHT_START || !UPGRADES[upgradeId]) return false;
    
    if (game.upgrades[upgradeId] >= UPGRADES[upgradeId].maxLevel) {
        game.message = "Upgrade is already at Max Level.";
        render(); return false;
    }

    const cost = getUpgradeCost(upgradeId);
    if (game.money < cost) {
        game.message = `Need $${cost.toFixed(2)} to upgrade ${UPGRADES[upgradeId].name}.`;
        render(); return false;
    }

    game.money = roundMoney(game.money - cost);
    game.upgrades[upgradeId]++;
    game.message = `Upgraded ${UPGRADES[upgradeId].name} to level ${game.upgrades[upgradeId]}!`;
    render();
    return true;
}
function buyItem(itemId, amount) {
    amount = Number(amount);
    if (!ITEMS[itemId] || !Number.isInteger(amount) || amount <= 0) return false;
    
    if (game.state !== GAMESTATE.NIGHT_START) {
        game.message = "Shop is closed.";
        render(); return false;
    }

    const item = ITEMS[itemId];
    const totalCost = roundMoney(amount * item.price);

    if (game.money < totalCost) {
        game.message = `Need $${totalCost.toFixed(2)} to buy ${amount} ${item.name}.`;
        render(); return false;
    }

    game.money = roundMoney(game.money - totalCost);
    if (game.items[itemId] === undefined) {
        game.items[itemId] = 0;
    }
    game.items[itemId] += amount;
    game.message = `Bought ${amount} ${item.name}! Total: ${game.items[itemId]}`;
    render();
    return true;
}

function buyStock(productId, amount){
    amount = Number(amount);
    if(!PRODUCT_CATALOG[productId]){
        game.message = "That product does not exist.";
        render();
        return false;
    }
    if(!Number.isInteger(amount) || amount <= 0){
        game.message = "Enter a valid amount to buy";
        render();
        return false;
    }
    if(game.state !== GAMESTATE.NIGHT_START){
        game.message = "You can only buy stock during the manager phase.";
        render();
        return false;
    }
    const product = PRODUCT_CATALOG[productId];
    const requiredLevel = RARITY_ORDER.indexOf(product.rarity);
    if (game.upgrades.shelf < requiredLevel) {
        game.message = `Logistics Level ${requiredLevel} required to buy ${product.rarity} items.`;
        render(); return false;
    }
    const maxStock = 20 + (game.upgrades.shelf * 20); 
    const currentAmount = game.stock[productId] ? game.stock[productId].quantity : 0;
    
    if (currentAmount + amount > maxStock) {
        game.message = `You can currently only store ${maxStock} units of ${product.name}.`;
        render(); return false;
    }
    const totalCost = roundMoney(amount * product.buyPrice);
    if(game.money < totalCost){
        game.message = `Not enough money to buy. need $${totalCost.toFixed(2)}`;
        render();
        return false;
    }
    if(!game.stock[productId]){
        game.stock[productId] = createStockItem(productId, 0);
    }
    game.money = roundMoney(game.money - totalCost);
    game.stock[productId].quantity += amount;

    game.message = `Bought ${amount} ${product.name} for $${totalCost.toFixed(2)}.`;
    render();
    return true;
}

// ---  helpers
function createStockItem(productId, quantity = 0) {
    const product = PRODUCT_CATALOG[productId];
    if (!product) {
        return null;
    }
    return {
        ...product,
        quantity: quantity
    };
}

function removeStockFromCart(cart){
    for(const item of cart){
        game.stock[item.id].quantity -= item.quantity;
    }
}
function roundMoney(amount) {
    return Math.round(amount * 100) / 100;
}

function nextCustomer() {
    stopCustomerTimer();
    game.currentCustomer = game.customerQueue.shift() || null;
    if(game.currentCustomer){
        game.state = GAMESTATE.CUSTOMER_CHECKOUT;
        game.message = `${game.currentCustomer.name} has arrived`;
        renderRandomCharacter();
        startCustomerTimer();
    }else{
        game.state = GAMESTATE.DAY_END;
        game.message = `No more customers for today. Head to the shop screen!`;
    }
    render();
}

function replaceCurrentCustomer() {
    const budgetPool = BudgetPool(budgetMultiplier);
    const averageBudget = Math.floor(budgetPool / game.hours);
    const replacementBudget = Math.max(3, averageBudget + budgetVariance);

    game.currentCustomer = generateCustomer(replacementBudget);
    game.message += `\n${game.currentCustomer.name} steps up in line.`;
    renderRandomCharacter();
    startCustomerTimer();
}
function changeUrl(url){
    window.location.href = "/route/" + url;
}

const isLocalhost = () => {
    const hostname = window.location.hostname;
    return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
    );
};

// -- Interactivity specifics
// Cashier
let main;
let gameMain;
// Manager
let manager_main;
let manager_console;

let renderManagerShop;
let renderSelectedProductPanel;

function render() {
    console.log(`Render(): ${game.state}`);
    if(game.timeRemaining){
        console.log(`Render(): time remaining for this customer -> ${game.timeRemaining}`);
    }
    const timerUI = document.getElementById("timerDisplay");
    if (timerUI) {
        if (page === "cashier" && game.currentCustomer && game.state === GAMESTATE.CUSTOMER_CHECKOUT) {
            timerUI.classList.remove("hidden");
            timerUI.innerText = `${game.timeRemaining}`;
            if (typeof game.timeRemaining === "number" && game.timeRemaining <= 5) {
                timerUI.classList.add("animate-pulse", "animate-bounce", "text-red-400");
                timerUI.classList.remove("text-red-500");
            } else {
                timerUI.classList.remove("animate-pulse", "animate-bounce", "text-red-400");
                timerUI.classList.add("text-red-500");
            }
        } else {
            timerUI.classList.add("hidden"); // Hide it during night/manager phases
        }
    }

    let text = "";
    // --- GAME_OVER screen
    if(game.state === GAMESTATE.GAME_OVER){
        main.innerText = `GG! \n\nFinal Stats:\n  Money: $${game.money.toFixed(2)}\n  Customers Served: ${game.stats.served}\n  Total Revenue: $${game.stats.revenue.toFixed(2)}`;
        gameMain.innerText = `Game Over.\n\n`;
        return;
    }

    // --- NIGHT_START screen
    if(game.state === GAMESTATE.NIGHT_START){
        if(page === "manager"){
            manager_main.innerText = `[Shop Screen]\n\nDay ${game.day - 1} complete!\n\nMoney: $${game.money.toFixed(2)}\n\nPreparing for Day ${game.day}...`;
            manager_console.innerText = `${game.message}\n\n`;
            return;
        }
    }
    if(game.state === GAMESTATE.GAME_OVER){
        main.innerText = `GG! \n\nFinal Stats:\n  Money: $${game.money.toFixed(2)}\n  Customers Served: ${game.stats.served}\n  Total Revenue: $${game.stats.revenue.toFixed(2)}`;
        gameMain.innerText = `Game Over.\n\nPress 'Next' to view the Leaderboard.`;
        return;
    }

    // --- Normal gameplay screen
    text += `Day: ${game.day} / ${game.maxDay}\n`;
    // text += `State: ${game.state}\n`;
    text += `Money: $${game.money.toFixed(2)}\n`;
    text += `Ammo: ${game.items.ammo}\n\n`;
    // text += `Served: ${game.stats.served}\n`;
    // text += `Revenue: $${game.stats.revenue.toFixed(2)}\n\n`;

    if (page === "cashier"){
        if(game.currentCustomer){
            const customer = game.currentCustomer;
            text += `Customer: ${customer.name}\n`;
            // text += `Trait: ${customer.trait}\n\n`;
            text += `Cart:\n`;

            for(const i of customer.cart){
                const subtotal = i.price * i.quantity;
                text += `  ${i.name} x${i.quantity}: $${subtotal.toFixed(2)}\n`
            }

            text += `Customer gave you: $${customer.moneyGiven.toFixed(2)}\n`;
            text += `\nTotal + tax: $${customer.totalCost.toFixed(2)}\n`;
            // text += `Change needed: $${customer.moneyGiven - customer.totalCost}\n`;
        }
    main.innerText = text;
    gameMain.innerText = `${game.message}\n\n`;
    }
    else if(page === "manager"){
        let stock = "";
        manager_main.innerText = text;
        stock += `${game.message}\n\n`;
        stock += "Current Stock:\n";
        for (const i in game.stock){
            stock += `${i}: ${game.stock[i].quantity}\n`;
        }
        manager_console.innerText = stock;
        if (renderManagerShop) renderManagerShop();
        if (renderSelectedProductPanel) renderSelectedProductPanel();
    }
}

function startNight(){
    game.day++; // +1 to day count at night
    game.currentCustomer = null;
    game.customerQueue = [];

    if(game.day > game.maxDay){ // all days complete
        game.state = GAMESTATE.GAME_OVER;
        render();
        return;
    }

    game.state = GAMESTATE.NIGHT_START;
    game.message = `[Shop Screen] — End of day ${game.day - 1}. Preparing for Day ${game.day}.`; // placeholder for upgrade screen
    render();
}

const page = document.body.dataset.page;
document.addEventListener("DOMContentLoaded", init);
async function init() {
    await loadGame();
    console.log(game);
    if (page === "cashier") {
        console.log("loading page cashier");
        const cashierUI = initCashierPage({
            advanceGame,
            processPayment,
            rejectCustomer
        });

        main = cashierUI.main;
        gameMain = cashierUI.gameMain;
        if (game.state === GAMESTATE.CUSTOMER_CHECKOUT && game.currentCustomer) {
            startCustomerTimer();
        }
    }
    if (page === "manager") {
        console.log("loading page manager");
        const managerUI = initManagerPage({
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
        });

        renderManagerShop = managerUI.renderManagerShop;
        renderSelectedProductPanel = managerUI.renderSelectedProductPanel;
        manager_main = managerUI.manager_main;
        manager_console = managerUI.manager_console;
    }
    render();
}

document.addEventListener("keydown", function(event){
    console.log(event.key);
})
// saveGame();
