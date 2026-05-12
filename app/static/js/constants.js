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
    firstNames : ["You", "Joe", "Kevin", "SigmaBalls", "Grep", "AlrBuddy"],
    middleNames : [],
    lastNames : [],
    traits : ["friendly", "rude", "tired", "quiet", "impatient", "confused"],
    bills : [5, 10, 20, 50]
};

export const URLS = {

}



// old stuff below
const PRODUCTS = {
    apple: {
        name: "Apple",
        quantity: 20,
        buyPrice: 1,
        sellPrice: 2,
        rarity: "common"
    },
    milk:{
        name: "Milk",
        quantity: 10,
        buyPrice: 3,
        sellPrice: 5,
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
