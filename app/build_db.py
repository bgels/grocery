# Restaurant Simulator
# Yu Lu, Ricky Lin, Jun Jie Li, Emily Mai
# SoftDev

import sqlite3

DB_FILE = "data.db"

db = sqlite3.connect(DB_FILE)
c = db.cursor()
c.execute("PRAGMA foreign_keys = ON;")

c.executescript("""
    DROP TABLE IF EXISTS Game;
    DROP TABLE IF EXISTS Items;
    DROP TABLE IF EXISTS User;
    DROP TABLE IF EXISTS Customers;
    DROP TABLE IF EXISTS Products;
    DROP TABLE IF EXISTS Upgrades;
    """
)

c.executescript("""
    CREATE TABLE User (
        username TEXT PRIMARY KEY,
        password TEXT
    );

    CREATE TABLE Customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT,
        sprite TEXT,
        traits TEXT,
        budget INTEGER
    );

    CREATE TABLE Game (
        username TEXT,
        day INTEGER,
        hour INTEGER,
        money INTEGER,
        customer_id TEXT,
        served INTEGER,
        killed INTEGER,
        revenue INTEGER,
        state TEXT,
        FOREIGN KEY (username) REFERENCES User(username),
        FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
    );

    CREATE TABLE Items (
        username TEXT,
        name TEXT,
        amount INTEGER,
        FOREIGN KEY (username) REFERENCES User(username)
    );

    CREATE TABLE Products (
        username TEXT,
        name TEXT PRIMARY KEY,
        quantity INTEGER,
        buy_price INTEGER,
        sell_price INTEGER,
        rarity TEXT,
        FOREIGN KEY (username) REFERENCES User(username)
    );

    CREATE TABLE Upgrades (
        username TEXT,
        shelf INTEGER,
        register INTEGER,
        decor INTEGER,
        firepower INTEGER,
        FOREIGN KEY (username) REFERENCES User(username)
    );
""")

db.commit()
db.close()
