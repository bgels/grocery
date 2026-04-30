#Kiran Soemardjo, Mustafa Abdullah, Yu Lu, Eviss Wu
#Orangutans

# Imports >>
from flask import Flask, render_template, request, flash, url_for, redirect, session, jsonify
import sqlite3, csv, json, pprint, os
from db import select_query, insert_query, general_query
#from api import
from urllib.request import Request, urlopen
import random

# Initialize DB >>

# Create instance of Flask app >>
app = Flask(__name__)
app.secret_key = "ABCEDFGHIJKLMNOPQRSTUVWXYZ12345678909876543216767667"
import threading
cache = {}

@app.context_processor
def user_context(): # persistent info made avalible for all html templates
    return {
    }

#@app.before_request

# ROUTING BEGINS >>

@app.get("/")
def home():
    return render_template("home.html")

if __name__ == "__main__":
    app.run(debug=True)
