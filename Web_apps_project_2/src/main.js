import "./vue-component.js"

let map;

function init(){
let app = new Vue({
    el: '#app',
    data: {
        title: "Map me",
        status: "Click Search button to get some results",
        term: "map",
        results: []
    },
    methods: {
        search(){
          this.status = "Finding Routes..."
        }
    }, 
    created(){
        initMap();
        getRouteData();
        
    }
})
}
function initMap(){
    mapboxgl.accessToken = 'pk.eyJ1IjoicXBoNjQxMiIsImEiOiJjazM5N2RhcTUwMDN2M2dxb2p4aXU1bmEyIn0.ZIEer8pQ-1c556RVxIOO2Q';
    map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11' // stylesheet location
});
    //this adds a button to the map that will locate the user
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
        enableHighAccuracy: true
        },
        trackUserLocation: true
    }));
    
}
function getRouteData(){
    fetch("https://transloc-api-1-2.p.rapidapi.com/stops.json?agencies=16&callback=call", {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "transloc-api-1-2.p.rapidapi.com",
		"x-rapidapi-key": "3d8d97d83amsh33d9e9295dfe7d5p190b02jsnff2d088324da"
	}
})
.then(response => {
    return response.json();
})
.then((responseData) =>{
    createMarkers(responseData.data)
})
.catch(err => {
	console.log(err);
});
   
}
function createMarkers(data){
    let markers = new Array();
    for(let i = 0; i < data.length; i++){
        let geojson = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [data[i].location.lng, data[i].location.lat]
              },
              properties: {
                title: data[i].name,
                description: 'Bus stop in '+ data[i].name
              }
            }]
        };
        markers.push(geojson);
    }
    // add markers to map
    while(markers.length > 0) {
        let marker = markers.pop();
        //console.log(marker.features[0].properties.title);
        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = 'marker';
    
        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
        .setLngLat(marker.features[0].geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML('<h3>' + marker.features[0].properties.title + '</h3>'))
        .addTo(map);
    }
}

export {init}