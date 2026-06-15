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
    DROP TABLE IF EXISTS Products;
    DROP TABLE IF EXISTS Upgrades;
    DROP TABLE IF EXISTS User;
    """
)

c.executescript("""
    CREATE TABLE User (
        username TEXT PRIMARY KEY,
        password TEXT
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
        FOREIGN KEY (username) REFERENCES User(username)
    );

    CREATE TABLE Items (
        username TEXT,
        name TEXT,
        amount INTEGER,
        FOREIGN KEY (username) REFERENCES User(username)
    );

    CREATE TABLE Products (
        username TEXT,
        name TEXT,
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
