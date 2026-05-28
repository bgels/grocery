import { GAMESTATE, CUSTOMER_PRESETS, PRODUCT_CATALOG } from "./constants.js";
import { initCashierPage } from "./cashierUI.js";
import { initManagerPage } from "./managerUI.js";
import { renderRandomCharacter } from "./animate.js";
export { game };
// To do:
// GAME:
// 1. need to calculate game state as soon as game loads later on, also customer queue
// 2. add image link to stock

const usingLocalstorage = true;

async function saveGame(){
    if(usingLocalstorage){
        console.warn("saving game to localStorage...");
        localStorage.setItem("saveFile", JSON.stringify(game));
        console.warn("saved!");
    }else{
        console.warn("saving game to database...");
        const route = "/save";
        try {
            const response = await fetch(route, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(game),
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
    message: "Console here", // dont parse
    state: GAMESTATE.DAY_START, // dont parse
    hours: 2,

    customerQueue: [],  // dont parse
    currentCustomer: null,

    upgrades:{
        shelf: 0,
        register: 0,
        decor: 0,
        firepower: 0
    },
    items:{
        ammo: 20
    },

    stock:{
        apple: {...PRODUCT_CATALOG.apple, quantity: 20},
        milk: {...PRODUCT_CATALOG.milk, quantity: 10},
        pilk: {...PRODUCT_CATALOG.pilk, quantity: 10},
        banana: {...PRODUCT_CATALOG.banana, quantity: 10}
    }, // prolly should add image link later, so need to change a lot of structures in functions below
    stats:{
        served: 0,
        killed: 0,
        revenue: 0,
    },
};
// ----  Init and rendering starts below

// Trys to advance game state when user clicks
async function advanceGame() {
    switch(game.state){

        case GAMESTATE.DAY_START:
            getQueue(game.hours, 0.5); // change multiplier later
            game.message = `Day ${game.day} has started!!!`;
            game.state = GAMESTATE.CUSTOMER_CHECKOUT;
            nextCustomer();
            await saveGame();
            break;

        case GAMESTATE.DAY_END:
            startNight();
            await saveGame();
            changeUrl("manager");
            break;

        case GAMESTATE.NIGHT_START:
            game.state = GAMESTATE.DAY_START;
            game.message = `Press Next to begin Day ${game.day}.`;
            await saveGame();
            changeUrl("cashier");
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
        const budgetVariance = Math.floor(Math.random() * 10) - 5; // change/nerf later
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
    } // have to change accordingly to emily's table later
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

    game.state = GAMESTATE.WAITING_FOR_CHANGE; // waiting on result
    const expectedChange = roundMoney(customer.moneyGiven - customer.totalCost);
    if (changeGiven === expectedChange) {
        removeStockFromCart(customer.cart);
        game.money += customer.totalCost;
        game.stats.served++;
        game.stats.revenue += customer.totalCost;
        game.message = `Correct change! +$${customer.totalCost.toFixed(2)}`;
        nextCustomer(); // sets state to CUSTOMER_CHECKOUT or DAY_END
    } else {
        game.state = GAMESTATE.CUSTOMER_CHECKOUT; // wrong — stay on this customer
        game.message = `Wrong change! Expected: $${expectedChange.toFixed(2)}`;
        render();
    }
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
    const totalCost = roundMoney(amount * product.buyPrice);
    if(game.money < totalCost){
        game.message = `not enough money to buy. need $${totalCost.toFixed(2)}`;
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
    game.currentCustomer = game.customerQueue.shift() || null;
    if(game.currentCustomer){
        game.state = GAMESTATE.CUSTOMER_CHECKOUT;
        game.message = `${game.currentCustomer.name} has arrived`;
        renderRandomCharacter();
    }else{
        game.state = GAMESTATE.DAY_END;
        game.message = `No more customers for today. Head to the shop screen!`;
    }
    render();
}

function changeUrl(url){
    window.location.href = "/route/" + url;
}

const isLocalhost = () => {
    const hostname = window.location.hostname;
    // Check for localhost, 127.0.0.1 (IPv4), or ::1 (IP6)
    return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' // IPv6 loopback (note the brackets)
    );
};

// -- Interactivity specifics
// Cashier
let main; // gameplay status on the left
let gameMain; // console logs

// Manager
let manager_main; // gameplay status on the left
let manager_console; // console logs

let renderManagerShop;
let renderSelectedProductPanel;

function render() {
    let text = "";

    // --- GAME_OVER screen
    if(game.state === GAMESTATE.GAME_OVER){ // need to change to home screen soon
        main.innerText = `GG! You survived all ${game.maxDay} days!\n\nFinal Stats:\n  Money: $${game.money.toFixed(2)}\n  Customers Served: ${game.stats.served}\n  Total Revenue: $${game.stats.revenue.toFixed(2)}`;
        gameMain.innerText = `Game Over.\n\n`;
        return;
    }

    // --- NIGHT_START screen (placeholder for shop/upgrade screen)
    if(game.state === GAMESTATE.NIGHT_START){
        if(page === "manager"){
            manager_main.innerText = `[Shop Screen]\n\nDay ${game.day - 1} complete!\n\nMoney: $${game.money.toFixed(2)}\nCustomers Served: ${game.stats.served}\nTotal Revenue: $${game.stats.revenue.toFixed(2)}\n\nPreparing for Day ${game.day}...`;
            manager_console.innerText = `${game.message}\n\n`;
            return;
        }
    }

    // --- Normal gameplay screen
    text += `Day: ${game.day} / ${game.maxDay}\n`;
    text += `State: ${game.state}\n`;
    text += `Money: $${game.money.toFixed(2)}\n`;
    text += `Served: ${game.stats.served}\n`;
    text += `Revenue: $${game.stats.revenue.toFixed(2)}\n\n`;

    if (page === "cashier"){
        if(game.currentCustomer){
            const customer = game.currentCustomer;
            text += `Customer: ${customer.name}\n`;
            text += `Trait: ${customer.trait}\n\n`;
            text += `Cart:\n`;

            for(const i of customer.cart){
                const subtotal = i.price * i.quantity;
                text += `  ${i.name} x${i.quantity}: $${subtotal.toFixed(2)}\n`
            }

            text += `\nTotal + tax: $${customer.totalCost.toFixed(2)}\n`;
            text += `Customer gave you: $${customer.moneyGiven.toFixed(2)}\n`;
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
        renderManagerShop();
        renderSelectedProductPanel();
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
    if (page === "cashier") {
        console.log("loading page cashier");
        const cashierUI = initCashierPage({
            advanceGame,
            processPayment
        });

        main = cashierUI.main;
        gameMain = cashierUI.gameMain;
    }
    if (page === "manager") {
        console.log("loading page manager");
        const managerUI = initManagerPage({
            game,
            PRODUCT_CATALOG,
            advanceGame,
            buyStock,
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
    if(event.key === "r"){
        console.log("Resetting save file...");
        resetGame();
    }
})

// saveGame();