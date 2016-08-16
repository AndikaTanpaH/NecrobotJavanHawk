# NecrobotJavanHawk v0.3.15  ![Screenshot](https://github.com/AndikaTanpaH/NecrobotJavanHawk/blob/master/build/javanhawkcolor.png?raw=true) 
This for visual ~~Necrobot (v0.8.6)~~ Necrobot Fork (v0.8.8) if any update from there i'll update this page. Don't forget to [create issue](https://github.com/AndikaTanpaH/NecrobotJavanHawk/issues) if you found any bug or feature request to improve this JavanHawk. I hope you happy at all :D

Hmmm hell yaaah, Necrobot its shutdown.. But the JavanHawk still can run (If you know what i means, just back with a time machine)

I just test with Necrobot Fork (v0.8.8) worked.. The websocket still there, maybe need improvment for Level Up Pokemon.

## Feature
- [x] Can Evolution & Transfer Pokemon
- [x] Sorted pokemon by IV, CP, Name, HP & ID Pokedex
- [x] Show Pokemon informartion
  - IV, CP, HP, Level Pokemon
  - Attack, Defense & Stamina
  - Candy / Candy need to Evolve
  - Pokemon type (Dragon | Flying)
  - Pokemon skill attack name (Ember Fast | Heat Wave)
  - If favourite from native apps
- [x] Show Profile Trainer
  - Total Coin
  - Stardust (not auto update)
  - Experience (percentage auto update)
  - Your team
  - Pokemon Storage (auto update)
- [x] Responsive view list (not working for small display ex: mobile phone under 720px)
- [x] Show incubator eggs
- [x] Show inventory items
- [ ] Powerup Pokemon (under progess -> fixing litle bug)
- [ ] Bulk transfer (under progess)
- [ ] Rename Pokemon (under progess -> i'll trying to create the api)
- [ ] Use gmaps api (long long planning a head)
- [ ] Themes management
- [ ] Show Pokemon informartion in Gym

## How to Use
Download the [Latest Release NecrobotJavanHawk](https://github.com/AndikaTanpaH/NecrobotJavanHawk/releases)

If you not a developer just download the win-64bit.zip, extract it and run NecrobotJavanHawk.exe

Make sure to enable UseWebsocket on necrobot config.json
```"UseWebsocket": true,
"WebSocketPort": 14251,```

Run from source code:
####A. Node.js
1. Install [Node.js](https://nodejs.org/en/download/)
2. Start the node command line
3. Navigate to your NecrobotJavanHawk folder
4. To install enter: ```npm install```
5. To start enter: ```npm start```
6. Will launch electron application

####B. Python
1. Install [Python](https://www.python.org/downloads/)
2. Start command line
3. Navigate to your NecrobotJavanHawk/app folder
4. Type ```python -m SimpleHTTPServer 8000``` 8000 = Port
5. Open Browser and type http://localhost:8000

In the NecrobotJavanHawk, the url on the config page should match the port you configured on bot side (both have the same default).

## Run it!!
![Screenshot](https://github.com/AndikaTanpaH/NecrobotJavanHawk/blob/master/screenshot/viewpokemon-v0315.jpg?raw=true) 


### Credit
Based on [necrobotvisualizer](https://github.com/nicoschmitt/necrobotvisualizer)



# Legal
This Website and Project is in no way affiliated with, authorized, maintained, sponsored or endorsed by Niantic, The Pokémon Company, Nintendo or any of its affiliates or subsidiaries. This is an independent and unofficial API for educational use ONLY. Using the Project might be against the TOS
