const game = {
    day: 0,
    maxDay: 7,

    money: 100,

    upgrades:{
        shelf: 0,
        register: 0,
        decor: 0,
        firepower: 0
        // more?
    },

    stock:{
        apple: { name: "Apple", quantity: 20, buyPrice: 1, sellPrice: 2, rarity: "common" },
        milk: { name: "Milk", quantity: 10, buyPrice: 3, sellPrice: 5, rarity: "common" }
    }, // prolly should add iamge link later, so need to change a lot fo structures in functions below

    customerQueue: [], // this will just be a queue from now on
    currentCustomer: null,

    stats:{
        served: 0,
        killed: 0,
        revenue: 0,
        // more idk
    }
};

function getCustomer(){
    // random name
    // random clothing
    // random trait
    // random budget
    // random cart under budget

}

function BudgetPool(multiplier){ // multiplier is decimal percentage of how muuch totla budget
    let total = 0;
    for(const i in game.stock){
        const item = game.stock[i];
        total += item.quantity * item.sellPrice;
    }
    return Math.floor(total * multiplier);
}


function getQueue(customerCount, multiplier){ // count is # of customers, multiplier is decimal percentage of how muuch totla budget
    const budget = BudgetPool(multiplier);
    const averageBudget = Math.floor(budget / customerCount);
    gameState.customerQueue = [];

    for (let i = 0; i < customerCount; i++) {
        const budgetVariance = Math.floor(Math.random() * 10) - 5; // change/nerf later
        const budget = Math.max(3, averageBudget + budgetVariance);

        const customer = getCustomer(budget);
        gameState.customerQueue.push(customer);
    }
}
/*
Shelf upgrade : +stock capacity
Register upgrade: +faster scanning (totaling item amount) +max money storage
Store Decor: +customer spending (they will spend on higher rarity, and will always try to spend more of their total budget)
More firepower: +rounds in the chamber (useless? Just more ammo for the gun)
*/
function nextCustomer() {
    gameState.currentCustomer = gameState.customerQueue.shift() || null;
}

function getCart(budget) {
    const cart = [];
    let remainingBudget = budget;
    const availableItems = Object.entries(gameState.stock).filter(([id, item]) => item.quantity > 0);

    let attempts = 0;

    while (remainingBudget > 0 && attempts < 20) { // set limit of attmepts later
        const [itemId, item] = availableItems[Math.floor(Math.random() * availableItems.length)];
        if (item.sellPrice <= remainingBudget && item.quantity > 0) {
            cart.push({
            id: itemId,
            name: item.name,
            price: item.sellPrice
            });
            remainingBudget -= item.sellPrice;
            item.quantity--;
        }
        attempts++;
    }
    return cart;
}

function processPayment(changeGiven) {
    const customer = gameState.currentCustomer;
    const expectedChange = customer.moneyGiven - customer.totalCost;

    if (changeGiven === expectedChange) {
    gameState.money += customer.totalCost;
    gameState.stats.customersServed++;
    return true;
    } else {
    return false;
    }

    // check for return true/false for this funciton, thhen you can process
}


const test = document.getElementById("main");

test.innerText = "hello?";
