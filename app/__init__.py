# Restaurant Simulator
# Yu Lu, Ricky Lin, Jun Jie Li, Emily Mai
# SoftDev

# Imports >>
from flask import Flask, render_template, request, flash, url_for, redirect, session, jsonify
import sqlite3, csv, json, pprint, os
import db
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
    if 'username' in session:
        return redirect(url_for("homepage"))
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        if db.get_user(username) != None and db.check_password(username, password):
            session['username'] = username
            return redirect(url_for("homepage"))
        else:
            flash("Invalid username and/or password")
            return redirect(url_for("login"))
    return render_template("login.html")

@app.route("/register", methods = ["GET", "POST"] )
def register():
    if 'username' in session:
        return redirect(url_for("homepage"))
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        flash("Sign up successful! Please log in.")
        if db.get_user(username) == None:
            db.add_user(username, password)
            db.new_game(username)
            return redirect(url_for("login"))
        else:
            flash("Username is already taken")
            return redirect(url_for("register"))
    return render_template("register.html")

@app.route("/logout")
def logout():
    session.pop("username", None)
    return redirect(url_for("homepage"))

@app.route("/home")
def homepage():
    loggedIn = False
    if 'username' in session:
        loggedIn = True
    return render_template("home.html", loggedIn = loggedIn)

@app.route("/profile")
def profile():
    return render_template("/profile.html")

@app.route("/manager")
def manager():
    if 'username' in session:
        return render_template("/manager.html")
    else:
        return redirect(url_for("login"))
@app.route("/cashier")
def cashier():
    if 'username' in session:
        return render_template("/cashier.html")
    else:
        return redirect(url_for("login"))
@app.route("/art")
def art():
    if 'username' in session:
        return render_template("/art.html")
    else:
        return redirect(url_for("login"))

@app.route("/setting")
def setting():
    if 'username' in session:
        return render_template("/setting.html")
    else:
        return redirect(url_for("login"))

@app.route("/route/<url>", methods=["GET", "POST"])
def route(url):
    print(f"Redirecting to {url}")
    return redirect(url_for(url), code=303)

@app.route('/save', methods=['POST'])
def save():
    if 'username' not in session:
        return jsonify({"error": "Not logged in"}), 401
    username = session['username']
    game_data = request.get_json() #python dictionary

    print(game_data)
    print("save")

    db.save_game(username, game_data)
    return jsonify(success=True)

@app.route('/load', methods=['GET'])
def load():
    if 'username' not in session:
        return jsonify({"error": "Not logged in"}), 401
    username = session['username']
    save_data = db.load_game(username)
    print(save_data)
    print("load")
    if save_data:
        return jsonify(save_data)
    else:
        return jsonify({"error": "No save found"}), 404

@app.route('/resetjson', methods=['POST'])
def resetJson():
    if 'username' not in session:
        return jsonify({"error": "Not logged in"}), 401

    username = session['username']
    db.new_game(username)
    return jsonify(success=True)

@app.route('/reset', methods=['GET'])
def reset():
    if 'username' not in session:
        return redirect(url_for("login"))

    username = session['username']
    db.new_game(username)
    return redirect(url_for("homepage"))

@app.route("/test")
def test():
    return render_template("test.html")
# ts is test delete this later

@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    sort_by = request.args.get("sort", "revenue")
    print(db.get_leaderboard(sort_by))
    data = db.get_leaderboard(sort_by)
    return render_template("leaderboard.html", leaderboard=data, sort_by=sort_by)

if __name__ == "__main__":
    app.run(debug=True, port=5001)

# query the sqlite for yu and so he can use stuff from the database
