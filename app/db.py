# Orangutans
# Kiran Soemardjo, Eviss Wu, Mustafa Abdullah, Yu Lu
# SoftDev

import sqlite3
from urllib.request import Request, urlopen

DB_FILE="./data.db"

db = sqlite3.connect(DB_FILE, check_same_thread=False)

def add_user(username, password, country, currency):
    DB_NAME = "Data/database.db"
    DB = sqlite3.connect(DB_NAME)
    DB_CURSOR = DB.cursor()
    DB_CURSOR.execute("SELECT COUNT(*) FROM Users WHERE username = (?)", (username,))
    cursorfetch = DB_CURSOR.fetchone()[0]
    if cursorfetch == 1:
        DB.commit()
        DB.close()
        return False
    DB_CURSOR.execute("INSERT INTO Users VALUES(?, ?)", (username, password))
    DB.commit()
    DB.close()
    return True

def get_user(username):
    DB_NAME = "Data/database.db"
    DB = sqlite3.connect(DB_NAME)
    DB_CURSOR = DB.cursor()
    DB_CURSOR.execute("SELECT * FROM Users WHERE username = ?", (username,))
    cursorfetch = DB_CURSOR.fetchone()
    return cursorfetch

def check_password(username, password):
    return password == get_user(username)[1]

#returns as list of dicts, where each item in the list is one row's entry, and each dict entry contains the selected data as the value for the column name as the key
def select_query(query_string, parameters=()):
    c = db.cursor()
    c.execute(query_string, parameters)
    out_array = []
    column_names = c.description
    for row in c.fetchall():
        item_dict = dict()
        for col in range(len(row)):
             item_dict.update({column_names[col][0]: row[col]})
        out_array.append(item_dict)
    c.close()
    db.commit()
    return out_array

def insert_query(table, data):
    c = db.cursor()
    placeholder = ["?"] * len(data)
    c.execute(f"INSERT INTO {table} {tuple(data.keys())} VALUES ({', '.join(placeholder)}) RETURNING *;", tuple(data.values()))
    row = c.fetchall()
    output = dict()
    for col in range(len(row[0])):
        output.update({c.description[col][0]: row[0][col]})
    c.close()
    db.commit()
    return output

def general_query(query_string, parameters=()):
    c = db.cursor()
    c.execute(query_string, parameters)
    c.close()
    db.commit()
