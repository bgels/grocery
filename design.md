# System Blueprint (_a.k.a._ "Design Doc")

## TNPG: Restaurant Simulator
## project: grocery simulator
## Target ship date: 2026-06-01
## Project Manager: Yu Lu

---

#### roster:


| Name | Email | Primary Role | Secondary Role |
|---|---|---|---|
|Yu Lu|yul29@nycstudents.net|Front-end|Back-end|
|Ricky Lin|rickyl49@nycstudents.net|Middleware|Front-end|
|Jun Jie Li|junjiel26@nycstudents.net|Front-end|Art|
|Emily Mai|emilym384@nycstudents.net|Database Manager|Middleware|

---

## Summary

We plan to create a grocery store management simulator where the player takes on two roles: cashier and manager. During the day, customers enter the store, buy goods, and go to the register to pay, then the cashier will calculate the total cost and return the correct amount of change. During the night, the manager buys new stock for the next day and purchases store upgrades that improve customer mood and store efficiency.

## Problem Being Solved
Improves user mental-math capabilities
Improves user decision-making
Improves user's ability to plan for the future

## Target Users

Who will use this system?

- Gamers interested in the simulator genres
- People interested in developing mental math skills


## Why This Project Matters

Instead of practicing mental math through something like a worksheet, players can apply those skills in an interactive cashier system where they must calculate totals, handle money, and give correct change. Then in the manager role, players must decide how to spend their money, what stock to buy, and which upgrades are worth investing in for future days. These choices connect short term actions to long term outcomes, helping players practice resource management in a fun and low-pressure environment. We aim to improve the decision making and mental math skill of users through a fun and interactive format

---

# Minimum Viable Product (MVP) Scope

## Core Features (Required for Final Submission)
Features that **must** be completed:
1. Day - Cashier system
1. Customer generation
1. Grocery stock system

## Stretch Features (Only if MVP is Complete)
1. Night - Manager system
1. Dialogue and Unique NPCS
1. Music and cutscenes

## Explicit Non-Goals

Features intentionally excluded:
- real-time multiplayer
- Complex employee management systems (other than the player themselves)
- character customization (except npc)
- open-world
- A fully randomized story mode
---

# Technology Stack

| Layer | Selected Tool |
|---|---|
| Backend Framework | Flask  |
| Frontend Framework |  tailwind  |
| Database | SQLite  |
| Authentication | Flask sessions |
| ORM / DB Library | SQLAlchemy |

## Why This Stack Was Chosen
We considered our respective skillsets and the frameworks that we were comfortable with

---

# Team Ownership Plan

Each member must own meaningful deliverables.

| Team Member | Primary Ownership | Secondary Ownership | Specific Deliverables |
|---|---|---|---|
|Yu Lu|Templates, JS files|Flask routes|Core game loop and front-end|
|Jun Jie Li|Art assets|Templates, JS files|Art visuals|
|Ricky Lin|Flask routes|DB files, SQLITE tables|Flask routing between pages|
|Emily Mai|DB files, SQLITE tables|Flask Routes|Established database|

---

# Component map
![Component Map](https://www.dropbox.com/scl/fi/aqi3a8w8mifv67vmjqv3i/Screenshot-2026-05-12-051555-Ricky.png?rlkey=tqrsy5woufeyw7z3dcppncws9&st=m69otn3a&raw=1){ width=60% }

# Site map
![Grocery Site Map](https://www.dropbox.com/scl/fi/7bgmgkzztr8y987mvw7vf/Grocery-Site-Map-jj.png?rlkey=shrket2ybkyu9upg42af10dfu&st=652a766d&raw=1){ width=50% }

# Database Design
![Database Algorithm](https://www.dropbox.com/scl/fi/7mjuj7mddsr1s0fxbd4o6/database_diagram-Emily-Mai.png?rlkey=hd45j6xurq6l4g9v8vmwat27k&st=653ttjg8&raw=1){ width=50% }

# Key User Stories
1. As a player, I want to be as rich as possible so that I can beat the objective of the game
2. As a developer, I want to make the game interactive and functional so that we can fufill the pleasures of our users
3. As a tester, I want to encounter and play through different games so that i can encounter scenarios with unintuitive/unexpected behaviors that developers might want to address


# Testing Plan
1. ALWAYS check developer console for errors and consoleLogs opening during testing
2. Play through 1 Day, serve customers and use the register and gun to see if they work as expected
3. Play through 1 night, buying upgrades and stock, and see if it is updated the next day
4. return to the website in another instance (or forced f5) to see if saves are working

## Timeline
# Week 1 Goals:
Design document, preliminary setup of repo, core game loop, save system
# Week 2 Goals:
Basic art assets added, mainscreen done, user save saved to database and read/setup during refreshes
# Week 3 Goals:
Stretch goals
# Internal Deadlines:
Special customers, game constants such as stock, prices, certain days, etc

# Completion Criteria (_a.k.a._ "Definition of 'Done'")
Project is considered complete when all of the following are true:
1. Core game loop
1. Management system
1. Save system

# Open Questions
Should music/audio be added?

# Appendix
N/A

# Other
No additional notes
