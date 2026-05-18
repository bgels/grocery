# Restaurant Simulator
# Yu Lu, Ricky Lin, Jun Jie Li, Emily Mai
# SoftDev

import sqlite3

DB_FILE = "data.db"

db = sqlite3.connect(DB_FILE)
c = db.cursor()
c.execute("PRAGMA foreign_keys = ON;")

c.executescript("""
    DROP TABLE IF EXISTS User;
    CREATE TABLE User (
        username TEXT PRIMARY KEY,
        password TEXT
    );

    DROP TABLE IF EXISTS Game;
    CREATE TABLE Game (
        username TEXT,
        day INTEGER,
        hour INTEGER,
        money INTEGER,
        customer_id TEXT,
        served INTEGER,
        killed INTEGER,
        revenue INTEGER,
        FOREIGN KEY (username) REFERENCES User(username),
        FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
    );

    DROP TABLE IF EXISTS Items;
    CREATE TABLE Items (
        username TEXT,
        name TEXT,
        amount INTEGER,
        FOREIGN KEY (username) REFERENCES User(username)
    );

    DROP TABLE IF EXISTS Customers;
    CREATE TABLE Customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT,
        sprite TEXT,
        traits TEXT,
        budget INTEGER
    );

    DROP TABLE IF EXISTS Products;
    CREATE TABLE Products (
        name TEXT PRIMARY KEY,
        quantity INTEGER,
        buy_price INTEGER,
        sell_price INTEGER,
        rarity TEXT
    );

    DROP TABLE IF EXISTS Upgrades;
    CREATE TABLE Upgrades (
        shelf INTEGER,
        register INTEGER,
        decor INTEGER,
        firepower INTEGER
    );
""")

db.commit()
db.close()
