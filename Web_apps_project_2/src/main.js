import "./vue-component.js"

let map;
let location;

function init(){
let app = new Vue({
    el: '#app',
    data: {
        title: "Bus Stop Finder",
        status: "Click Search button to get some results",
        term: "",
        results: []
    },
    methods: {
        search(){
          this.status = "Finding Routes..."
        },
        // This is used to get a selected location's value and fly to it
        locate(){
            let data = document.querySelector("#locations");
            // First you have to get the selected option
            let option = data.options[data.selectedIndex];
            // Then get the value
            let location = option.value;
            // Then split it
            let array = location.split(",");
            // Then fly to
            map.flyTo({
                center: [parseFloat(array[0]), parseFloat(array[1])],
                zoom: 15
            });
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
    
    // Code that will give us the user's location that we can then use for the route
    let options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      
    function success(pos) {
        let crd = pos.coords;
      
        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);
        location = [crd.latitude, crd.latitude];
    }
      
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
      
    navigator.geolocation.getCurrentPosition(success, error, options);
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
                coordinates: [data[i].location.lat, data[i].location.lng]
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