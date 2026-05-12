import { GAMESTATE, CUSTOMER_PRESETS } from "./constants.js";

const main = document.getElementById("main"); // gameplay status on the left
const gameMain = document.getElementById("main2") // console logs
const changeInput = document.getElementById("changeInput"); // user change input box
const submitChangeButton = document.getElementById("submitChange"); // user submit change to be checked button
const advanceButton = document.getElementById("advanceGame"); // drives all state transitions
// const nextCustomerButton = document.getElementById("nextCustomer");

// stuff to think about
// should we calculate the gamestate upon ininitalization? or should store in db?
const game = {
    day: 1,         // starts at 1, increments each night. game ends after maxDay nights
    maxDay: 7,
    money: 100,
    message: "Console here", // For announcements or system messages
    state: GAMESTATE.DAY_START,
    hours: 12,

    customerQueue: [],
    currentCustomer: null,

    upgrades:{
        shelf: 0,
        register: 0,
        decor: 0,
        firepower: 0
        // more?
    },

    stock:{
        apple: { name: "Apple", quantity: 20, buyPrice: 1, sellPrice: 2.5, rarity: "common" },
        milk: { name: "Milk", quantity: 10, buyPrice: 3, sellPrice: 5.5, rarity: "common" },
        pilk: { name: "Pilk", quantity: 10, buyPrice: 3, sellPrice: 1.5, rarity: "common" },
        banana: { name: "Bananana", quantity: 10, buyPrice: 3, sellPrice: 2, rarity: "common" }
    }, // prolly should add image link later, so need to change a lot of structures in functions below
    stats:{
        served: 0,
        killed: 0,
        revenue: 0,
        // more idk
    },
};

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
    const budgetPool = BudgetPool(multiplier); // renamed from budget to avoid shadowing below
    const averageBudget = Math.floor(budgetPool / customerCount);
    game.customerQueue = [];

    for (let i = 0; i < customerCount; i++) {
        const budgetVariance = Math.floor(Math.random() * 10) - 5; // change/nerf later
        const customerBudget = Math.max(3, averageBudget + budgetVariance); // renamed from budget to avoid shadowing budgetPool above

        const customer = generateCustomer(customerBudget);
        game.customerQueue.push(customer);
    }
}

// generates a random customer with random appearance and money (to give to cashier) based on budget allocated to it
function generateCustomer(customerBudget){
    const firstNames = CUSTOMER_PRESETS.firstNames;
    const traits = CUSTOMER_PRESETS.traits;
    const bills = CUSTOMER_PRESETS.bills;

    const name = firstNames[Math.floor(Math.random() * firstNames.length)]; // BUG FIX: was names.length (undefined)
    const trait = traits[Math.floor(Math.random() * traits.length)];

    const cart = getCart(customerBudget);
    let totalCost = cart.reduce((sum, item) => sum + item.price, 0);
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
    const availableItems = Object.entries(game.stock).filter(([id, item]) => item.quantity > 0);

    let attempts = 0;

    while (remainingBudget > 0 && attempts < 20) { // how many attempts to retrieve stock?
        const [itemId, item] = availableItems[Math.floor(Math.random() * availableItems.length)];

        if (item.sellPrice <= remainingBudget && item.quantity > 0) {
            cart.push({
                id: itemId,
                name: item.name,
                price: item.sellPrice
            });
            remainingBudget = roundMoney(remainingBudget - item.sellPrice);
            item.quantity--;
        }
        attempts++;
    }
    return cart;
}

// checks if cashier's change is given correctly
function processPayment(changeGiven) {
    const customer = game.currentCustomer;
    if (!customer) {
        game.message = "There is no customer right now.";
        render();
        return;
    }

    game.state = GAMESTATE.WAITING_FOR_CHANGE; // waiting on result

    const expectedChange = roundMoney(customer.moneyGiven - customer.totalCost);
    if (changeGiven === expectedChange) {
        game.money += customer.totalCost;
        game.stats.served++;
        game.stats.revenue += customer.totalCost;
        game.message = `Correct change! +$${customer.totalCost.toFixed(2)}`;
        nextCustomer(); // sets state to CUSTOMER_CHECKOUT or DAY_END
    } else {
        game.state = GAMESTATE.CUSTOMER_CHECKOUT; // wrong — stay on this customer
        game.message = `Wrong change! Expected: $${expectedChange.toFixed(2)}`;
    }

    render();
}

// ---  helpers

function roundMoney(amount) {
    return Math.round(amount * 100) / 100;
}

// makes game go to next customer
function nextCustomer() {
    game.currentCustomer = game.customerQueue.shift() || null;
    if(game.currentCustomer){
        game.state = GAMESTATE.CUSTOMER_CHECKOUT;
        game.message = `${game.currentCustomer.name} has arrived`;
    }else{
        game.state = GAMESTATE.DAY_END; // BUG FIX: was game.GAMESTATE (wrong key, never took effect)
        game.message = `No more customers for today. Head to the shop screen!`;
    }

    render();
}

async function changeUrl(url){
  const response = a
}
// ----  Init and rendering starts below

// main loop driver — advances game state on button click
function advanceGame() {
    switch(game.state){

        case GAMESTATE.DAY_START:
            getQueue(game.hours, 0.5); // change multiplier later
            game.message = `Day ${game.day} has started!!!`;
            game.state = GAMESTATE.CUSTOMER_CHECKOUT;
            nextCustomer();
            break;

        case GAMESTATE.DAY_END:
            startNight();
            break;

        case GAMESTATE.NIGHT_START:
            game.state = GAMESTATE.DAY_START;
            game.message = `Press start to begin Day ${game.day}.`;
            render();
            break;

        default:
            game.message = "Cannot do that right now.";
            render();
            break;
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

function render() {
    let text = "";

    // --- GAME_OVER screen
    if(game.state === GAMESTATE.GAME_OVER){
        main.innerText = `GG! You survived all ${game.maxDay} days!\n\nFinal Stats:\n  Money: $${game.money.toFixed(2)}\n  Customers Served: ${game.stats.served}\n  Total Revenue: $${game.stats.revenue.toFixed(2)}`;
        gameMain.innerText = `Game Over.\n\n`;
        return;
    }

    // --- NIGHT_START screen (placeholder for shop/upgrade screen)
    if(game.state === GAMESTATE.NIGHT_START){
        main.innerText = `[Shop Screen]\n\nDay ${game.day - 1} complete!\n\nMoney: $${game.money.toFixed(2)}\nCustomers Served: ${game.stats.served}\nTotal Revenue: $${game.stats.revenue.toFixed(2)}\n\nPreparing for Day ${game.day}...`;
        gameMain.innerText = `${game.message}\n\n`;
        document.location.href = standard
        return;
    }

    // --- Normal gameplay screen (DAY_START, CUSTOMER_CHECKOUT, WAITING_FOR_CHANGE, DAY_END)
    text += `Day: ${game.day} / ${game.maxDay}\n`;
    text += `State: ${game.state}\n`;
    text += `Money: $${game.money.toFixed(2)}\n`;
    text += `Served: ${game.stats.served}\n`;
    text += `Revenue: $${game.stats.revenue.toFixed(2)}\n\n`;

    if(game.currentCustomer){
        const customer = game.currentCustomer;
        text += `Customer: ${customer.name}\n`;
        text += `Trait: ${customer.trait}\n\n`;
        text += `Cart:\n`;

        for(const i of customer.cart){
            text += `  ${i.name}: $${i.price.toFixed(2)}\n`
        }

        text += `\nTotal + tax: $${customer.totalCost.toFixed(2)}\n`;
        text += `Customer gave you: $${customer.moneyGiven.toFixed(2)}\n`;
        // text += `Change needed: $${customer.moneyGiven - customer.totalCost}\n`;
    }
    main.innerText = text;
    gameMain.innerText = `${game.message}\n\n`;
}


// -- Interactivity specifics
advanceButton.addEventListener("click", advanceGame);
// nextCustomerButton.addEventListener("click", nextCustomer);
submitChangeButton.addEventListener("click", function(){
    const change = Number(changeInput.value);
    processPayment(change);
    changeInput.value = "";
})



render();
