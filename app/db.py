# Restaurant Simulator
# Yu Lu, Ricky Lin, Jun Jie Li, Emily Mai
# SoftDev

import sqlite3
from urllib.request import Request, urlopen
import build_db
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

#puts game data into database tables
def save_game(username, save_json):
    c = DB.cursor()
    #Game table
    stats = save_json.get('stats', {})
    c.execute('''
        INSERT INTO Game (username, day, hour, money, customer_id, served, killed, revenue)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', 
    (   
        username,
        save_json.get('day', 1),
        save_json.get('hours', 1),
        save_json.get('money', 0),
        save_json.get('currentCustomer'),
        stats.get('served', 0),
        stats.get('killed', 0),
        stats.get('revenue', 0)
    ))
    #Upgrades table
    upgrades = save_json.get('upgrades', {})
    c.execute('DELETE FROM Upgrades')
    c.execute('''
        INSERT INTO Upgrades (shelf, register, decor, firepower)
        VALUES (?, ?, ?, ?)
    ''', 
    (
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
        'gun', #default, change later
        items.get('ammo', 0)
    ))
    #Products table
    stock = save_json.get('stock', {})
    for product_name, data in stock.items():
        c.execute('''
            INSERT OR REPLACE INTO Products (name, quantity, buy_price, sell_price, rarity)
            VALUES (?, ?, ?, ?, ?)
        ''', 
        (
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
