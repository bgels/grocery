# Orangutans
# Kiran Soemardjo, Eviss Wu, Mustafa Abdullah, Yu Lu
# SoftDev

import sqlite3
from urllib.request import Request, urlopen
import build_db
DB_FILE="./data.db"

DB = sqlite3.connect(DB_FILE, check_same_thread=False)

def add_user(username, password):
    DB_CURSOR = DB.cursor()
    DB_CURSOR.execute("SELECT COUNT(*) FROM User WHERE user_id = (?)", (username,))
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
    DB_CURSOR.execute("SELECT * FROM User WHERE user_id = ?", (username,))
    cursorfetch = DB_CURSOR.fetchone()
    DB_CURSOR.close()
    return cursorfetch

def check_password(username, password):
    user = get_user(username)
    if user == None:
        return False
    return password == user[1]


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
