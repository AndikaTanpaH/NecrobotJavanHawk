(function() {
    function load(locale) {
        locale = locale || "en";
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `assets/json/pokemon.${locale}.js`; 
        document.getElementsByTagName("head")[0].appendChild(script);

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `assets/json/inventory.${locale}.js`; 
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    var service = {};

    service.init = function(locale) {
        load(locale);
    }

    service.getPokemonName = function(id) {
        return allPokemon[id];
    }

    service.getItemName = function(id) {
        return allItems[id];
    }
    
    window.inventoryService = service;
}());