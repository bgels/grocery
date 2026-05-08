const game = {
    day: 0,
    maxDay: 7,
    money: 100,
    isDayActive: false,
    customersPerDay: 11,

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
        apple: { name: "Apple", quantity: 20, buyPrice: 1, sellPrice: 2.45, rarity: "common" },
        milk: { name: "Milk", quantity: 10, buyPrice: 3, sellPrice: 5.32, rarity: "common" },
        pilk: { name: "Pilk", quantity: 10, buyPrice: 3, sellPrice: 1.12, rarity: "common" },
        banana: { name: "Bananana", quantity: 10, buyPrice: 3, sellPrice: 2, rarity: "common" }
    }, // prolly should add iamge link later, so need to change a lot fo structures in functions below


    stats:{
        served: 0,
        killed: 0,
        revenue: 0,
        // more idk
    },
    message: "Console here" // For announcements or ststem messages
};
const main = document.getElementById("main"); // text on the left
const gameMain = document.getElementById("main2") // text atop the buttons
const changeInput = document.getElementById("changeInput");
const submitChangeButton = document.getElementById("submitChange");
const startDayButton = document.getElementById("startDay");
// const nextCustomerButton = document.getElementById("nextCustomer");

function roundMoney(amount) {
    return Math.round(amount * 100) / 100;
}

function getCustomer(budget){
    // random name
    // random clothing
    // random trait
    // random budget
    // random cart under budget
    const names = ["You", "Joe", "Kevin", "SigmaBalls", "Grep", "AlrBuddy"];
    const traits = ["friendly", "rude", "tired", "quiet", "impatient", "confused"];
    const bills = [5, 10, 20, 50];

    const name = names[Math.floor(Math.random() * names.length)];
    const trait = traits[Math.floor(Math.random() * traits.length)];
    const cart = getCart(budget);
    let totalCost = cart.reduce((sum, item) => sum + item.price, 0);
    totalCost = roundMoney(totalCost * 1.11); // tax here
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
    } // hjave to change accoringly to emilys table later
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
    game.customerQueue = [];

    for (let i = 0; i < customerCount; i++) {
        const budgetVariance = Math.floor(Math.random() * 10) - 5; // change/nerf later
        const budget = Math.max(3, averageBudget + budgetVariance);

        const customer = getCustomer(budget);
        game.customerQueue.push(customer);
    }
}
function nextCustomer() {
    game.currentCustomer = game.customerQueue.shift() || null;
    if(game.currentCustomer){
        game.message = `${game.currentCustomer.name} has arrived`;
    }else{
        game.isDayActive = false;
        game.message = `no more customers for today (start next day pls, no upgrade screens yet)`;
    }

    render();
}

function getCart(budget) {
    const cart = [];
    let remainingBudget = budget;
    const availableItems = Object.entries(game.stock).filter(([id, item]) => item.quantity > 0);

    let attempts = 0;

    while (remainingBudget > 0 && attempts < 20) { // set limit of attmepts later
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

function processPayment(changeGiven) {
    const customer = game.currentCustomer;


    if (!customer) {
        game.message = "There is no customer right now.";
        render();
        return;
    }
    const expectedChange = roundMoney(customer.moneyGiven - customer.totalCost);
    if (changeGiven === expectedChange) {
        game.money += customer.totalCost;
        game.stats.served++;
        game.stats.revenue += customer.totalCost;
        game.message = `correct change!`;
        nextCustomer();
    } else {
        game.message = `wrong change!`;
    }

    render();
}

function startDay() {
    if (game.isDayActive) {
        game.message = "you cannot start the next day until all customers are served.";
        render();
        return;
    }
    if (game.currentCustomer || game.customerQueue.length > 0) {
        game.message = "finish all customers before starting the next day.";
        render();
        return;
    }
    if (game.day >= game.maxDay) {
        game.message = "GG.";
        render();
        return;
    }

    game.day++;
    game.isDayActive = true;
    getQueue(game.customersPerDay, 0.5); // chabge multipler later
    game.message = `Day ${game.day} has started!!!`;
    nextCustomer();
}

function render() {
    let text = "";

    text += `Day: ${game.day} / ${game.maxDay}\n`;
    text += `Money: $${game.money.toFixed(2)}\n`;
    text += `Served: ${game.stats.served}\n`;
    text += `Revenue: $${game.stats.revenue.toFixed(2)}\n\n`;

    if(game.currentCustomer){
        const customer = game.currentCustomer;
        text += `Customer: ${customer.name}\n`;
        text += `Trait: ${customer.trait}\n\n`;
        text += `Cart:\n`;

        for(const i of customer.cart){
            text += `${i.name}: $${i.price}\n`
        }

        text += `\nTotal + tax: $${customer.totalCost.toFixed(2)}\n`;
        text += `Customer gave you: $${customer.moneyGiven.toFixed(2)}\n`;
        // text += `Change needed: $${customer.moneyGiven - customer.totalCost}\n`;
    }
    main.innerText = text;
    gameMain.innerText = `${game.message}\n\n`;
}

startDayButton.addEventListener("click", startDay);
// nextCustomerButton.addEventListener("click", nextCustomer);
submitChangeButton.addEventListener("click", function(){
    const change = Number(changeInput.value);
    processPayment(change);
    changeInput.value = "";
})

render();
