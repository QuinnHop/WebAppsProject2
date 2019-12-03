import "./vue-component.js"

let map;
let location = [];
let agencies = [];//stores the agencies active in the searched areas
let app;
function init(){
app = new Vue({
    el: '#app',
    data: {
        title: "Bus Stop Finder",
        status: "Click Search button to get some results",
        term: "",
        results: [],
        searchRadius: "1000"
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
        },
        initMap(){
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
                location = [crd.latitude, crd.longitude];
                app.getAgencies(location, app.searchRadius);
            }
              
            function error(err) {
                console.warn(`ERROR(${err.code}): ${err.message}`);
            }
              
            navigator.geolocation.getCurrentPosition(success, error, options);
        },
        
        getRouteData(location, radius){
            let url = `https://transloc-api-1-2.p.rapidapi.com/stops.json?&callback=call&geo_area=${location[0]},${location[1]}|${this.searchRadius}&agencies=`;
            
        
            for(let i = 0; i < agencies.length; i++){
                url+= agencies[i];
            }
            if(agencies.length > 1 && i < agencies.length-1)
                url += "%"; //adds a split between the terms if it is needed
        
            fetch(url, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "transloc-api-1-2.p.rapidapi.com",
                "x-rapidapi-key": "9456d85263msh248beac628b1779p1a5a58jsn16e851de941e"
            }
        })
        .then(response => {
            return response.json();
        })
        .then((responseData) =>{
            //console.log(responseData);
            app.createMarkers(responseData.data)
        })
        .catch(err => {
            console.log(err);
        });  
        },
        
        //this will allow you to get the agencies functioning in the area
        //35.80176, -78.64347 |75.5
        getAgencies(location, radius){
            fetch(`https://transloc-api-1-2.p.rapidapi.com/agencies.json?callback=call&geo_area=${location[0]},${location[1]}|${radius}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "transloc-api-1-2.p.rapidapi.com",
                "x-rapidapi-key": "9456d85263msh248beac628b1779p1a5a58jsn16e851de941e"
            }
        })
        .then(response => {
            return response.json();
        })
        .then((responseData) =>{
            agencies = [];//clear agencies list
            if(responseData.data.length == 0) {
                console.log("no agencies within bounds"); 
                return;
            }
            //add all the agencies retreived from the location
            for(let i =0; i < responseData.data.length; i++){
                agencies.push(responseData.data[i].agency_id);
            }
            app.getRouteData(location, app.searchRadius);
        })
        .catch(err => {
            console.log(err);
        });
        },

        createMarkers(data){
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
    }, 
    created(){
        this.initMap();
    }
});
}


export {init}