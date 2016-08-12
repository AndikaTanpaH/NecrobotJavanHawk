
var Map = function(parentDiv) {

    var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

    var osmCycle = L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png');
    var osmCycleTransport = L.tileLayer('http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png');
    var toner = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png');
    var watercolor = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg');

    this.layerPokestops = new L.LayerGroup();
    this.layerCatches = new L.LayerGroup();
    this.layerPath = new L.LayerGroup();

    this.map = L.map(parentDiv, {
        layers: [osm, this.layerPokestops, this.layerCatches, this.layerPath]
    });

   var baseLayers = {
        "OpenStreetMap": osm,
        "OpenCycleMap": osmCycle,
        "OpenCycleMap Transport": osmCycleTransport,
        "Toner": toner,
        "Watercolor": watercolor,
    };
    var overlays = {
        "Path": this.layerPath,
        "Pokestops": this.layerPokestops,
        "Catches": this.layerCatches
    };

    L.control.layers(baseLayers, overlays).addTo(this.map);

    this.path = null;

    this.steps = [];
    this.catches = [];
    this.pokestops = [];
    this.availablePokestops = [];
    this.pokemonList = [];
};

Map.prototype.saveContext = function() {
    sessionStorage.setItem("available", true);
    sessionStorage.setItem("steps", JSON.stringify(this.steps));
    sessionStorage.setItem("catches", JSON.stringify(this.catches));
    sessionStorage.setItem("pokestops", JSON.stringify(this.pokestops));
}

Map.prototype.loadContext = function() {
    try {
        if (sessionStorage.getItem("available") == "true") {
            console.log("Load data from storage to restore session");

            this.steps = JSON.parse(sessionStorage.getItem("steps")) || [];
            this.catches = JSON.parse(sessionStorage.getItem("catches")) || [];
            this.pokestops = JSON.parse(sessionStorage.getItem("pokestops")) || [];

            if (this.steps.length > 0) this.initPath();

            for (var i = 0; i < this.pokestops.length; i++) {
                var pt = this.pokestops[i];
                var icon = L.icon({ iconUrl: `./assets/img/pokestop.png`, iconSize: [30, 50]});
                L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 50}).bindPopup(pt.name).addTo(this.layerPokestops);
            }

            for (var i = 0; i < this.catches.length; i++) {
                var pt = this.catches[i];
                var icon = L.icon({ iconUrl: `./assets/pokemon/${pt.id}.png`, iconSize: [50, 50], iconAnchor: [25, 25]});
                var pkm = `${pt.name} (lvl ${pt.lvl}) <br /> Cp:${pt.cp} Iv:${pt.iv}%`;
                L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 100}).bindPopup(pkm).addTo(this.layerCatches);
            }
        }
    } catch(err) { console.log(err); }
}

Map.prototype.initPath = function() {
    if (this.path != null) return true;

    if (!this.me) {
        this.map.setView([this.steps[0].lat, this.steps[0].lng], 16);
        this.me = L.marker([this.steps[0].lat, this.steps[0].lng], { zIndexOffset: 200 }).addTo(this.map).bindPopup(`${this.steps[0].lat},${this.steps[0].lng}`);
        $(".loading").hide();
    }

    if (this.steps.length >= 2) {
        var pts = Array.from(this.steps, pt => L.latLng(pt.lat, pt.lng));
        this.path = L.polyline(pts, { color: 'red' }).addTo(this.layerPath);
        return true;
    }

    return false;
}

Map.prototype.addToPath = function(pt) {
    this.steps.push(pt);
    if (this.initPath()) {
        var latLng = L.latLng(pt.lat, pt.lng);
        this.path.addLatLng(latLng);
        this.me.setLatLng(latLng).getPopup().setContent(`${pt.lat},${pt.lng}`);
        if (global.config.followPlayer) {
            this.map.panTo(latLng, true);
        }
    }
}

Map.prototype.addCatch = function(pt) {
    var pkm = `${pt.name} (lvl ${pt.lvl}) <br /> Cp:${pt.cp} Iv:${pt.iv}%`;

    this.catches.push(pt);

    var icon = L.icon({ iconUrl: `./assets/pokemon/${pt.id}.png`, iconSize: [50, 50], iconAnchor: [25, 25] });
    L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 100 }).bindPopup(pkm).addTo(this.layerCatches);
}

Map.prototype.addVisitedPokestop = function(pt) {
    if (!pt.lat) return;

    this.pokestops.push(pt);

    var ps = this.availablePokestops.find(ps => ps.id == pt.id);
    if (ps) {
        ps.marker.setIcon(L.icon({ iconUrl: `./assets/img/pokestop.png`, iconSize: [30, 50]}));
        ps.marker.bindPopup(pt.name);
    } else {
        var icon = L.icon({ iconUrl: `./assets/img/pokestop.png`, iconSize: [30, 50]});
        L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 50}).bindPopup(pt.name).addTo(this.layerPokestops);
    }
}

Map.prototype.addPokestops = function(forts) {
    for(var i = 0; i < forts.length; i++) {
        var pt = forts[i];
        var ps = this.availablePokestops.find(ps => ps.id == pt.id);
        if (!ps) {
            var icon = L.icon({ iconUrl: `./assets/img/pokestop_available.png`, iconSize: [30, 50]});
            pt.marker = L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 50}).addTo(this.layerPokestops);
            this.availablePokestops.push(pt);
        }
    }
}

Map.prototype.displayPokemonList = function(all, sortBy) {
    console.log("Pokemon list");
    this.pokemonList = all || this.pokemonList;
    if (!sortBy) {
        sortBy = localStorage.getItem("sortPokemonBy") || "cp";
    } else {
        localStorage.setItem("sortPokemonBy", sortBy);
    }

    if (sortBy == "pokemonId") {
        this.pokemonList = this.pokemonList.sort((p1, p2) => p1[sortBy] - p2[sortBy]);
    }else if (sortBy == "name") {
        //this.pokemonList = this.pokemonList.sort((p1, p2) => p1[sortBy] - p2[sortBy]);
        this.pokemonList = this.pokemonList.sort(firstBy("name", {ignoreCase:true}).thenBy("iv", {direction:-1}));
    }else {
        this.pokemonList = this.pokemonList.sort((p1, p2) => p2[sortBy] - p1[sortBy]);
    }

    var skill = JSON.parse('{"0":"Move Unset","1":"Thunder Shock","2":"Quick Attack","3":"Scratch","4":"Ember","5":"Vine Whip","6":"Tackle","7":"Razor Leaf","8":"Take Down","9":"Water Gun","10":"Bite","11":"Pound","12":"Double Slap","13":"Wrap","14":"Hyper Beam","15":"Lick","16":"Dark Pulse","17":"Smog","18":"Sludge","19":"Metal Claw","20":"Vice Grip","21":"Flame Wheel","22":"Megahorn","23":"Wing Attack","24":"Flamethrower","25":"Sucker Punch","26":"Dig","27":"Low Kick","28":"Cross Chop","29":"Psycho Cut","30":"Psybeam","31":"Earthquake","32":"Stone Edge","33":"Ice Punch","34":"Heart Stamp","35":"Discharge","36":"Flash Cannon","37":"Peck","38":"Drill Peck","39":"Ice Beam","40":"Blizzard","41":"Air Slash","42":"Heat Wave","43":"Twineedle","44":"Poison Jab","45":"Aerial Ace","46":"Drill Run","47":"Petal Blizzard","48":"Mega Drain","49":"Bug Buzz","50":"Poison Fang","51":"Night Slash","52":"Slash","53":"Bubble Beam","54":"Submission","55":"Karate Chop","56":"Low Sweep","57":"Aqua Jet","58":"Aqua Tail","59":"Seed Bomb","60":"Psyshock","61":"Rock Throw","62":"Ancient Power","63":"Rock Tomb","64":"Rock Slide","65":"Power Gem","66":"Shadow Sneak","67":"Shadow Punch","68":"Shadow Claw","69":"Ominous Wind","70":"Shadow Ball","71":"Bullet Punch","72":"Magnet Bomb","73":"Steel Wing","74":"Iron Head","75":"Parabolic Charge","76":"Spark","77":"Thunder Punch","78":"Thunder","79":"Thunderbolt","80":"Twister","81":"Dragon Breath","82":"Dragon Pulse","83":"Dragon Claw","84":"Disarming Voice","85":"Draining Kiss","86":"Dazzling Gleam","87":"Moonblast","88":"Play Rough","89":"Cross Poison","90":"Sludge Bomb","91":"Sludge Wave","92":"Gunk Shot","93":"Mud Shot","94":"Bone Club","95":"Bulldoze","96":"Mud Bomb","97":"Fury Cutter","98":"Bug Bite","99":"Signal Beam","100":"x Scissor","101":"Flame Charge","102":"Flame Burst","103":"Fire Blast","104":"Brine","105":"Water Pulse","106":"Scald","107":"Hydro Pump","108":"Psychic","109":"Psystrike","110":"Ice Shard","111":"Icy Wind","112":"Frost Breath","113":"Absorb","114":"Giga Drain","115":"Fire Punch","116":"Solar Beam","117":"Leaf Blade","118":"Power Whip","119":"Splash","120":"Acid","121":"Air Cutter","122":"Hurricane","123":"Brick Break","124":"Cut","125":"Swift","126":"Horn Attack","127":"Stomp","128":"Headbutt","129":"Hyper Fang","130":"Slam","131":"Body Slam","132":"Rest","133":"Struggle","134":"Scald Blastoise","135":"Hydro Pump Blastoise","136":"Wrap Green","137":"Wrap Pink","200":"Fury Cutter Fast","201":"Bug Bite Fast","202":"Bite Fast","203":"Sucker Punch Fast","204":"Dragon Breath Fast","205":"Thunder Shock Fast","206":"Spark Fast","207":"Low Kick Fast","208":"Karate Chop Fast","209":"Ember Fast","210":"Wing Attack Fast","211":"Peck Fast","212":"Lick Fast","213":"Shadow Claw Fast","214":"Vine Whip Fast","215":"Razor Leaf Fast","216":"Mud Shot Fast","217":"Ice Shard Fast","218":"Frost Breath Fast","219":"Quick Attack Fast","220":"Scratch Fast","221":"Tackle Fast","222":"Pound Fast","223":"Cut Fast","224":"Poison Jab Fast","225":"Acid Fast","226":"Psycho Cut Fast","227":"Rock Throw Fast","228":"Metal Claw Fast","229":"Bullet Punch Fast","230":"Water Gun Fast","231":"Splash Fast","232":"Water Gun Fast Blastoise","233":"Mud Slap Fast","234":"Zen Headbutt Fast","235":"Confusion Fast","236":"Poison Sting Fast","237":"Bubble Fast","238":"Feint Attack Fast","239":"Steel Wing Fast","240":"Fire Fang Fast","241":"Rock Smash Fast"}');
    var level = JSON.parse('{"94":"1","135":"1.5","166":"2","192":"2.5","215":"3","236":"3.5","255":"4","273":"4.5","290":"5","306":"5.5","321":"6","335":"6.5","349":"7","362":"7.5","375":"8","387":"8.5","399":"9","411":"9.5","422":"10","432":"10.5","443":"11","453":"11.5","462":"12","472":"12.5","481":"13","490":"13.5","499":"14","508":"14.5","517":"15","525":"15.5","534":"16","542":"16.5","550":"17","558":"17.5","566":"18","574":"18.5","582":"19","589":"19.5","597":"20","604":"20.5","612":"21","619":"21.5","626":"22","633":"22.5","640":"23","647":"23.5","654":"24","661":"24.5","667":"25","674":"25.5","681":"26","687":"26.5","694":"27","700":"27.5","706":"28","713":"28.5","719":"29","725":"29.5","731":"30","734":"30.5","737":"31","740":"31.5","743":"32","746":"32.5","749":"33","752":"33.5","755":"34","758":"34.5","761":"35","764":"35.5","767":"36","770":"36.5","773":"37","776":"37.5","778":"38","781":"38.5","784":"39","787":"39.5","790":"40"}');

    $(".inventory .numberinfo").text(`${this.pokemonList.length}/${global.storage.pokemon}`);
    var div = $(".inventory .data");
    div.html(``);
    this.pokemonList.forEach(function(elt) {
        console.log(elt);
        var canEvolve = elt.canEvolve && !elt.inGym && elt.candy >= elt.candyToEvolve;
        var evolveStyle = canEvolve ? "" : "style='display:none'";
        var evolveClass = canEvolve ? "canEvolve" : "";
        var transferStyle = elt.favorite ? "style='display:none'" : "";
        var skill1 = skill[elt.move1];
        var skill2 = skill[elt.move2];
        var levelcalc = parseInt((elt.zcp1+elt.zcp2)*1000.0);
        var levelshow = ((typeof level[levelcalc] === 'undefined') ? 'n/a':level[levelcalc]);
        div.append(`
            <div class="pokemon">
                <div class="transfer" id='${elt.id}'>
                    <a title='Transfer' href="#" class="transferAction ${transferStyle}"><img src="./assets/img/recyclebin.png" /></a>
                    <a title='Evolve' href="#" class="evolveAction" ${evolveStyle}><img src="./assets/img/evolve.png" /></a>
                </div>
                <span class="info">CP: <strong>${elt.cp}</strong> IV: <strong>${elt.iv}%</strong></span>
                <span class="info">Atk: <strong>${elt.zatk}</strong> Def: <strong>${elt.zdef}</strong> Stm: <strong>${elt.zstm}</strong></span>
                <span class="imgspan ${evolveClass}"><img src="./assets/pokemon/${elt.pokemonId}.png" /></span>
                <span class="info">Level ${levelshow} | HP ${elt.zhpmin}/${elt.zhpmax}</span>
                <span class="name">${elt.name}</span>
                <span class="info">Candy: ${elt.candy}<span ${evolveStyle}>/${elt.candyToEvolve}</span></span>
                <span class="info infoskill">${skill1} | ${skill2}</span>
            </div>
        `);
    });
    $(".pokemonsort").show();
    $(".inventory").show().addClass("active");
}

Map.prototype.displayEggsList = function(eggs) {
    console.log("Eggs list");
    $(".inventory .sort").hide();
    $(".inventory .numberinfo").text(eggs.length + "/9");
    var div = $(".inventory .data")
    div.html("");
    eggs.forEach(function(elt) {
        if (elt) {
            div.append(`
                <div class="eggs">
                    <span class="imgspan"><img src="./assets/inventory/${elt.type}.png" /></span>
                    <span>${elt.doneDist.toFixed(1)} / ${elt.totalDist.toFixed(1)} km</span>
                </div>
            `);
        }
    });
    $(".inventory").show().addClass("active");
}

Map.prototype.displayInventory = function(items) {
    console.log("Inventory list");
    $(".inventory .sort").hide();
    var count = items.filter(i => i.itemId != 901).reduce((prev, cur) => prev + cur.count, 0);
    $(".inventory .numberinfo").text(`${count}/${global.storage.items}`);
    var div = $(".inventory .data")
    div.html(``);
    items.forEach(function(elt) {
        div.append(`
            <div class="items">
                <span>x${elt.count}</span>
                <span class="imgspan"><img src="./assets/inventory/${elt.itemId}.png" /></span>
                <span class="info">${elt.name}</span>
            </div>
        `);
    });
    $(".inventory").show().addClass("active");
}
