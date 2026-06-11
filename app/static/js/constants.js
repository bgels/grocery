export const GAMESTATE = {
    DAY_START: "DAY_START",
    CUSTOMER_CHECKOUT: "CUSTOMER_CHECKOUT",
    WAITING_FOR_CHANGE: "WAITING_FOR_CHANGE",
    DAY_END: "DAY_END",       // summary screen, routes to this when no nextCustomer
    NIGHT_START: "NIGHT_START", // management screen (placeholder)
    NIGHT_END: "NIGHT_END",   // NOT USED FOR NOW
    GAME_OVER: "GAME_OVER"
};

export const CUSTOMER_PRESETS = {
    firstNames : ["You", "Joe", "Kevin", "SigmaBalls", "Grep", "AlrBuddy", "Emily", "Yu"],
    middleNames : [],
    lastNames : [],
    traits : ["friendly", "rude", "tired", "quiet", "impatient", "confused"],
    bills : [5, 7, 4.5, 11.5, 2.5, 8.5, 10, 20, 50, 3, 25, 40, 55, 75, 67, 52, 98, 36, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 120, 130, 140, 150, 160, 170, 180, 200, 220, 240, 260, 280, 300, 350, 400]
};

export const URLS = {

}



export const PRODUCT_CATALOG = {
    apple: {
        name: "Apple",
        buyPrice: 1,
        sellPrice: 2.5,
        rarity: "common"
    },

    milk: {
        name: "Milk",
        buyPrice: 3,
        sellPrice: 5.5,
        rarity: "common"
    },

    pilk: {
        name: "Pilk",
        buyPrice: 3,
        sellPrice: 4,
        rarity: "common"
    },

    banana: {
        name: "Bananana",
        buyPrice: 1,
        sellPrice: 1.5,
        rarity: "common"
    },

    bread: {
        name: "Bread",
        buyPrice: 2,
        sellPrice: 4,
        rarity: "common"
    },

    steak: {
        name: "Steak",
        buyPrice: 8,
        sellPrice: 13,
        rarity: "rare"
    },
    chips: {
        name: "Chips",
        buyPrice: 1,
        sellPrice: 3,
        rarity: "common"
    },
    chocolate: {
        name: "Chocolate",
        buyPrice: 0.50,
        sellPrice: 1,
        rarity: "common"
    },
    soda: {
        name: "Soda",
        buyPrice: 0.5,
        sellPrice: 1.5,
        rarity: "uncommon"
    },
    oil: {
        name: "Oil",
        buyPrice: 20,
        sellPrice: 30,
        rarity: "epic"
    },
    vegetables: {
        name: "Vegetables",
        buyPrice: 6,
        sellPrice: 14,
        rarity: "common"
    },
    ramen: {
        name: "Cup of Ramen",
        buyPrice: 1,
        sellPrice: 3,
        rarity: "uncommon"
    },
    canTuna: {
        name: "Can of Tuna",
        buyPrice: 4,
        sellPrice: 6,
        rarity: "uncommon"
    },
    canBean: {
        name: "Can of Beans",
        buyPrice: 4,
        sellPrice: 9,
        rarity: "uncommon"
    },
    egg: {
        name: "Eggs",
        buyPrice: 16,
        sellPrice: 22,
        rarity: "epic"
    },
    bakedGoods: {
        name: "Baked Goods",
        buyPrice: 18,
        sellPrice: 32,
        rarity: "rare"
    },
    iceCream: {
        name: "Ice Cream",
        buyPrice: 8,
        sellPrice: 11,
        rarity: "common"
    },
    watermelon: {
        name: "Watermelon",
        buyPrice: 6,
        sellPrice: 8,
        rarity: "rare"
    },
    pizza: {
        name: "Gold Pizza",
        buyPrice: 10000,
        sellPrice: 1000,
        rarity: "legendary"
    },
    groceryStore: {
        name: "Grocery Store",
        buyPrice: 100000,
        sellPrice: 0,
        rarity: "hacker"
    },
    bagel: {
        name: "Bagel",
        buyPrice: 9,
        sellPrice: 13,
        rarity: "uncommon"
    },
    turkey: {
        name: "Turkey",
        buyPrice: 20,
        sellPrice: 30,
        rarity: "epic"
    },
    kiwi: {
        name: "Kiwi",
        buyPrice: 5,
        sellPrice: 8,
        rarity: "common"
    }
};
const CUSTOMERS = [
    {
      customer_id: "regular_1", //"regular_1", "special_1", etc
      name: "Regular Customer",
      sprite: "static/images/npc/",
      traits: "",
      budget: 0
    }
];

const NAME_PARTS = {
    first:[],
    last:[]
};
const CLOTHING = {};
const DIALOGUE = [];
const TRAITS = [];
// Calculate dialogue based on traits that the npc has? special npcs will use special dialogue
