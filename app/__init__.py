#Ricky Lin, Yu lu, Emily Mai, Jun Jie Li
#grocery

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
def main():
    return redirect(url_for("homepage"))

@app.route("/login", methods = ["GET", "POST"])
def login():
#    if 'username' in session:
    #    return redirect("/")
        return render_template("login.html")

@app.route("/register", methods = ["GET", "POST"] )
def register():
    #wait for db
    #if 'username' in session:
        #return redirect("/home.html")
    #if request.method == "POST":
    #    username = request.form.get("username", "").strip()
    #    password = request.form.get("password", "")
    return render_template("register.html")

@app.route("/logout")
def logout():
    # wait for db
    #session.pop("username", None)
    return redirect(url_for("homepage"))

@app.route("/home")
def homepage():
    return render_template("home.html")

@app.route("/profile")
def profile():
    return render_template("/profile.html")

@app.route("/manager")
def manager():
    return render_template("/manager.html")
@app.route("/cashier")
def cashier():
    return render_template("/cashier.html")

@app.route("/route/<url>")
def route(url):
    print(f"Redirecting to {url}");
    return redirect(url_for(url));
if __name__ == "__main__":
    app.run(debug=True)

# query the sqlite for yu and so he can use stuff from the database
