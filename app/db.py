# Restaurant Simulator
# Yu Lu, Ricky Lin, Jun Jie Li, Emily Mai
# SoftDev

import sqlite3
from urllib.request import Request, urlopen
import build_db
import json
DB_FILE="./data.db"

DB = sqlite3.connect(DB_FILE, check_same_thread=False)

def add_user(username, password):
    DB_CURSOR = DB.cursor()
    DB_CURSOR.execute("SELECT COUNT(*) FROM User WHERE username = (?)", (username,))
    cursorfetch = DB_CURSOR.fetchone()[0]
    if cursorfetch != 0:
        DB.commit()
        DB_CURSOR.close()
        return False
    DB_CURSOR.execute("INSERT INTO User VALUES(?, ?)", (username, password))
    DB.commit()
    DB_CURSOR.close()
    return True

def get_user(username):
    DB_CURSOR = DB.cursor()
    DB_CURSOR.execute("SELECT * FROM User WHERE username = ?", (username,))
    cursorfetch = DB_CURSOR.fetchone()
    DB_CURSOR.close()
    return cursorfetch

def check_password(username, password):
    user = get_user(username)
    if user == None:
        return False
    return password == user[1]

#initialize database tables for a new game/replacing old game
def new_game(username):
    c = DB.cursor()
    #Game table
    c.execute("DELETE FROM Game WHERE username = ?", (username,))
    c.execute('''
        INSERT INTO Game (username, day, hour, money, customer_id, served, killed, revenue, state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    (
        username,
        1,
        2,
        100,
        "None",
        0,
        0,
        0,
        "DAY_START"
    ))
    #Items tables
    c.execute("DELETE FROM Items WHERE username = ?", (username,))
    #Upgrades tables
    c.execute("DELETE FROM Upgrades WHERE username = ?", (username,))
    c.execute('''
        INSERT INTO Upgrades (username, shelf, register, decor, firepower)
        VALUES(?, ?, ?, ?, ?)
    ''',
    (
        username,
        0,
        0,
        0,
        0
    ))
    #Products table
    c.execute("DELETE FROM Products WHERE username = ?", (username,))
    with open('constants.json', 'r') as file:
        data = json.load(file)
    for key, product in data.items():
        name = product["name"]
        buyPrice = product["buyPrice"]
        sellPrice = product["sellPrice"]
        rarity = product["rarity"]
        if (rarity == "common"):
            quantity = 6
        elif (rarity == "uncommon"):
            quantity = 5
        elif (rarity == "rare"):
            quantity = 2
        elif (rarity == "epic"):
            quantity = 1
        else:
            quantity = 0
        c.execute('''INSERT INTO Products (username, name, quantity, buy_price, sell_price, rarity) VALUES(?, ?, ?, ?, ?, ?)''',
            (
                username,
                name,
                quantity,
                buyPrice,
                sellPrice,
                rarity
            )
    )
    c.close()
    DB.commit()


#puts game data into database tables
def save_game(username, save_json):
    c = DB.cursor()
    #Game table
    stats = save_json.get('stats', {})
    current_customer = save_json.get('currentCustomer')
    customer_db_val = json.dumps(current_customer) if current_customer else None
    c.execute('DELETE FROM Game WHERE username=?', (username,))
    c.execute('''
        INSERT INTO Game (username, day, hour, money, customer_id, served, killed, revenue, state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    (
        username,
        save_json.get('day', 1),
        save_json.get('hours', 1),
        save_json.get('money', 0),
        customer_db_val,
        stats.get('served', 0),
        stats.get('killed', 0),
        stats.get('revenue', 0),
        save_json.get('state', 'DAY_START')
    ))
    #Upgrades table
    upgrades = save_json.get('upgrades', {})
    c.execute('DELETE FROM Upgrades WHERE username=?', (username,))
    c.execute('''
        INSERT INTO Upgrades (username, shelf, register, decor, firepower)
        VALUES (?, ?, ?, ?, ?)
    ''',
    (
        username,
        upgrades.get('shelf', 0),
        upgrades.get('register', 0),
        upgrades.get('decor', 0),
        upgrades.get('firepower', 0)
    ))
    #Items table, might have to change how items is in game const cause there's no item name rn
    items = save_json.get('items', {})
    c.execute('DELETE FROM Items WHERE username=?', (username,))
    c.execute('''
        INSERT INTO Items (username, name, amount)
        VALUES (?, ?, ?)
    ''',
    (
        username,
        'ammo', #default, change later
        items.get('ammo', 0)
    ))
    #Products table
    stock = save_json.get('stock', {})
    c.execute('DELETE FROM Products WHERE username=?', (username,))
    for product_name, data in stock.items():
        c.execute('''
            INSERT OR REPLACE INTO Products (username, name, quantity, buy_price, sell_price, rarity)
            VALUES (?, ?, ?, ?, ?, ?)
        ''',
        (   username,
            data.get('name', product_name),
            data.get('quantity', 0),
            data.get('buyPrice', 0),
            data.get('sellPrice', 0),
            data.get('rarity', 'common')
        ))
    c.close()
    DB.commit()

#retrieve game data from database and put into needed format
def load_game(username):
    c = DB.cursor()
    #Game table
    c.execute('''
        SELECT day, hour, money, customer_id, served, killed, revenue, state
        FROM Game
        WHERE username=?''', (username,))
    row = c.fetchone()
    if row:
        day, hour, money, currentCustomer, served, killed, revenue, state = row
        if currentCustomer and currentCustomer != "None":
            currentCustomer = json.loads(currentCustomer)
        else:
            currentCustomer = None
    else:
        return None
    #Upgrades table
    c.execute('SELECT shelf, register, decor, firepower FROM Upgrades WHERE username=?', (username,))
    row = c.fetchone()
    upgrades = {'shelf': 0, 'register': 0, 'decor': 0, 'firepower': 0}
    if row:
        upgrades = {'shelf': row[0], 'register': row[1], 'decor': row[2], 'firepower': row[3]}
    #Items table
    c.execute('SELECT name, amount FROM Items WHERE username=?', (username,))
    items = {name: amount for name, amount in c.fetchall()}
    #Products table
    c.execute('SELECT name, quantity, buy_price, sell_price, rarity FROM Products WHERE username=?', (username,))
    stock = {}
    for name, quantity, buy_price, sell_price, rarity in c.fetchall():
        stock[name] = {
            'name': name,
            'buyPrice': buy_price,
            'sellPrice': sell_price,
            'rarity': rarity,
            'quantity': quantity,
        }
    c.close()
    DB.commit()
    return {
        'day': day,
        'maxDay': 7,
        'money': money,
        'message': "Console here",
        'state': state,
        'hours': hour,
        'customerQueue': [],
        'currentCustomer': currentCustomer,
        'upgrades': upgrades,
        'items': items,
        'stock': stock,
        'stats': {'served': served, 'killed': killed, 'revenue': revenue}
    }

#def get_leaderboard():
#    list = {}
#    c = DB.cursor()
#    c.execute('SELECT username, revenue FROM Game ORDER BY revenue ASC')
#    list = c.fetchall()
#    c.close()
#    return list

#returns as list of dicts, where each item in the list is one row's entry, and each dict entry contains the selected data as the value for the column name as the key
def select_query(query_string, parameters=()):
    c = DB.cursor()
    c.execute(query_string, parameters)
    out_array = []
    column_names = c.description
    for row in c.fetchall():
        item_dict = dict()
        for col in range(len(row)):
             item_dict.update({column_names[col][0]: row[col]})
        out_array.append(item_dict)
    c.close()
    DB.commit()
    return out_array

def insert_query(table, data):
    c = DB.cursor()
    placeholder = ["?"] * len(data)
    c.execute(f"INSERT INTO {table} {tuple(data.keys())} VALUES ({', '.join(placeholder)}) RETURNING *;", tuple(data.values()))
    row = c.fetchall()
    output = dict()
    for col in range(len(row[0])):
        output.update({c.description[col][0]: row[0][col]})
    c.close()
    DB.commit()
    return output

def general_query(query_string, parameters=()):
    c = DB.cursor()
    c.execute(query_string, parameters)
    c.close()
    DB.commit()
