var map = L.map('map').setView([0, 0], 0);


L.tileLayer("https://tiles.guildwars2.com/1/1/{z}/{x}/{y}.jpg", {
    minZoom: 0,
    maxZoom: 7,
    continuousWorld: true
}).addTo(map);

function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
}
function project(latlng) {
    return map.project(latlng, map.getMaxZoom());
}
//function onMapClick(e) {
//    alert("You clicked the map at " + project(e.latlng));
//}
//
//map.on('click', onMapClick);
$.getJSON("https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=1", function (data) {
    var region, region_name, map_name, gameMap, i, il, poi;
    
    for (region in data.regions) {
        region = data.regions[region];
        region_name = region.name;
        
        for (gameMap in region.maps) {
            gameMap = region.maps[gameMap];
            map_name = gameMap.name;
            
            for (i = 0, il = gameMap.points_of_interest.length; i < il; i++) {
                poi = gameMap.points_of_interest[i];
                
                if (poi.type != "waypoint") {
                    continue;
                }

                L.marker(unproject(poi.coord), {
                    title: poi.name + " " + poi.coord + " in " + map_name + " of " + region_name
                }).addTo(map);
            }
        }
    }
});