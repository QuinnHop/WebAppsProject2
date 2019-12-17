import "./vue-component.js"
import {result} from "./classes.js"
let map;
let d;
let location = [];
let current = [];
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
        searchRadius: "1000",
        selected: 'current',
        options: [
            {text: 'Park Point', value: '-77.658445, 43.091956'},
            {text: 'RIT Inn', value: '-77.658830, 43.046110'},
            {text: 'Province', value: '-77.660162, 43.077429'},
            {text: 'Current Location', value: 'current'}
        ],
        searched: false,
        searchQuery: "",
        lastQuery: "",
        searchedTerms: [],
        visibleResults: [],
        loadVisible: false
    },
    methods: {
        // This is used to get a selected location's value and fly to it
        locate(){
            let value = this.selected;
            if(value == "current"){
                location[0] = current[1];
                location[1] = current[0];
            }

            else{
                let array = value.split(",");
                location[0] = parseFloat(array[0]);
                location[1] = parseFloat(array[1]);
            }
            
            // Then fly to
            map.flyTo({
                center: [location[0], location[1]],
                zoom: 15
            });
            
            firebase.database().ref('users').push({
                accessDate: `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`,
                position: `${location[0]}, ${location[1]}`,
                seachRadius: app.searchRadius,
                searchedTerms: localStorage.getItem("PreviousSearches")
            });
            
            app.searched =true;
            app.getAgencies(location, app.searchRadius);
        },
        initMap(){
            mapboxgl.accessToken = 'pk.eyJ1IjoicXBoNjQxMiIsImEiOiJjazM5N2RhcTUwMDN2M2dxb2p4aXU1bmEyIn0.ZIEer8pQ-1c556RVxIOO2Q';
            map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/satellite-streets-v11' // stylesheet location
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
                location[0] = [crd.latitude];
                location[1] =  [crd.longitude];
                current[0] = location[0];
                current[1] = location[1];
                map.flyTo({
                    center: [location[1], location[0]],
                    zoom: 15
                });

                app.lastQuery = localStorage.getItem("LastTerm");

                app.getAgencies(location, app.searchRadius);
            }
              
            function error(err) {
                console.warn(`ERROR(${err.code}): ${err.message}`);
            }
              
            navigator.geolocation.getCurrentPosition(success, error, options);

        },
        
        getRouteData(){
            let url = `https://transloc-api-1-2.p.rapidapi.com/stops.json?&callback=call&geo_area=${location[1]},${location[0]}|${this.searchRadius}&agencies=`;
            
            
            for(let i = 0; i < agencies.length; i++){
                url+= agencies[i];
            
                if(agencies.length > 1 && i < agencies.length-1)
                    url += "%2C"; //adds a split between the terms if it is needed
            }
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
            app.createMarkers(responseData.data);
            app.generateResults(responseData);
        })
        .catch(err => {
            console.log(err);
        });  
        },
        
        //this will allow you to get the agencies functioning in the area
        //35.80176, -78.64347 |75.5
        getAgencies(){
            app.loadVisible = true;
            fetch(`https://transloc-api-1-2.p.rapidapi.com/agencies.json?callback=call&geo_area=${location[1]},${location[0]}|${this.searchRadius}`, {
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
                //IMPORTANT: agency_id isn't actually a property, long_name will give us the agency (RIT) but then the program doesn't work
                //for the time being just keep this part broken, we can fix it later

                agencies.push(responseData.data[i].agency_id); 
            }
            app.getRouteData(location, app.searchRadius);
            app.loadVisible = false;
        })
        .catch(err => {
            console.log(err);
        });
        },

        getArrivalTimes(){
            let url = "https://transloc-api-1-2.p.rapidapi.com/arrival-estimates.json?routes=";
            // Add the routes

            //create a set and add all the unique routes to it, then add the routes to the url
            const uniqueRoutes = new Set();
            for(let i  = 0; i < app.results.length; i++){
                //loop through all the routes in route_id
                for(let j = 0; j < app.results[i].route_id[j]; j++){
                    uniqueRoutes.add(app.results[i].route_id[j]);
                } 
            }
            //add each of the unique routes to the url
            const iterable = uniqueRoutes.values();
            for(let i = 0; i < uniqueRoutes.size; i++){
                if(uniqueRoutes.size > 1 && i < uniqueRoutes.size-1){
                    url += "%2C"; //adds a split between the terms if it is needed
                }
                url += iterable.next().value;
            }
            

            // Add the stops
            url += "&stops=";
            for(let i  = 0; i < app.results.length; i++){
                url += app.results[i].stop_id;

                if(app.results.length > 1 && i < app.results.length-1){
                    url += "%2C"; //adds a split between the terms if it is needed
                }
            }

            // Add agencies
            url += "&callback=call&agencies=";
            for(let i = 0; i < agencies.length; i++){
                url+= agencies[i];
            
                if(agencies.length > 1 && i < agencies.length-1)
                    url += "%2C"; //adds a split between the terms if it is needed
            }

            fetch(url, {
	            "method": "GET",
	            "headers": {
	            	"x-rapidapi-host": "transloc-api-1-2.p.rapidapi.com",
	            	"x-rapidapi-key": "9456d85263msh248beac628b1779p1a5a58jsn16e851de941e"
	            }
            })

            .then(response => {
                console.log(response);
                return response.json();
            })
            .then((responseData) =>{
                for(let i = 0; i < responseData.data.length; i ++){
                    let temp = responseData.data[i].arrivals[0].arrival_at;
                    let array = temp.split("");
                    // Time to splice the array when it reaches the T
                    let index;
                    let otherIndex;
                    for(let j = 0; j < array.length; j++){
                        if(array[j] == "T"){
                            index = j + 1;
                        }
                        if(array[j] == "-"){
                            otherIndex = j - 3;
                        }
                    }
                    // Then splice from the beginning until the index
                    array.splice(otherIndex, array.length);
                    array.splice(0,index);

                    // Now we have to add AM or PM and make sure that it isn't in military time
                    if(array[0] == "1"){
                        if(parseInt(array[1]) > 2){
                            array.push(" ");
                            array.push("P");
                            array.push("M");
                            array[0] = "0";
                            array[1] = (parseInt(array[1]) - 2);
                        }
                        else{
                            array.push(" ");
                            array.push("A");
                            array.push("M");
                        }
                    }
                    else if(array[0] == "2"){
                        if(parseInt(array[1]) < 2){
                            array.push(" ");
                            array.push("P");
                            array.push("M");
                            array[0] = "0";
                            array[1] = (parseInt(array[1]) - 2);
                        }
                        else{
                            array.push(" ");
                            array.push("P");
                            array.push("M");
                            array[0] = "1";
                            array[1] = (parseInt(array[1]) - 2);
                        }
                    }
                    else{
                        array.push(" ");
                        array.push("A");
                        array.push("M");
                    }
                    let newArray = array.join("");

                    app.results[i].arrivalTime = newArray;
                    if(app.results[i].arrivalTime == "")
                        app.results[i].isRunning = false;
                    
                    else
                        app.results[i].isRunning = true;

                    console.log(app.results[i].arrivalTime);
                    app.visibleResults = app.results;

                    app.lastQuery = localStorage.getItem("LastTerm");
                    
                }
            })
            .catch(err => {
            	console.log(err);
            });
        },

        createMarkers(data){
            // Clear all markers
            $( ".marker" ).remove();
            
            // Make new markers
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
        },
        generateResults(routeObject){
            console.log(routeObject);
            app.results = [];
            for(let i = 0; i < routeObject.data.length; i++){
                let newResult = new result();
                newResult.name = routeObject.data[i].name;
                newResult.agency = routeObject.data[i].long_name;
                newResult.route_id = routeObject.data[i].routes;
                newResult.stop_id = routeObject.data[i].stop_id;
                
                app.results.push(newResult);
            }

            this.getArrivalTimes();
            console.log(app.results);
        },
        //given a search term loop through the results and adds any included results to the visibleResults
        searchResults(){
            app.visibleResults = [];
            for(let i = 0; i < app.results.length; i++){
                let temp = app.results[i].name;
                let title = temp.toLowerCase();
                if(title.includes(app.searchQuery.toLowerCase()))
                    app.visibleResults.push(app.results[i]);
                
            }
            //check local storage for previous searches
            let string = localStorage.getItem("PreviousSearches");
            if(string){
                app.searchedTerms = string.split(", ");
            }
            else{//No previous searches have been stored
                app.searchedTerms = [];
            }
           
            //store the search term locally
            app.searchedTerms.push(app.searchQuery);
            localStorage.setItem("LastTerm", app.searchQuery);
            app.lastQuery = app.searchQuery;

            let allSearched = "";
            for(let i = 0; i < app.searchedTerms.length; i++){
                allSearched += app.searchedTerms[i];
                allSearched += ", ";
            }
            localStorage.setItem("PreviousSearches", allSearched);
            app.searchQuery = "";
        }
    }, 
    created(){
        this.initMap();
        
        d = new Date();
      /* #2 - The rest of the Firebase setup code goes here */
      var firebaseConfig = {
            apiKey: "AIzaSyDb9VQL79m1DzT7fJtc-OS05yLwUZDP9ME",
            authDomain: "rit-route-finder.firebaseapp.com",
            databaseURL: "https://rit-route-finder.firebaseio.com",
            projectId: "rit-route-finder",
            storageBucket: "rit-route-finder.appspot.com",
            messagingSenderId: "243604851524",
            appId: "1:243604851524:web:be22d86cde7d21cb66e511"
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      console.log(firebase); // #3 - make sure firebase is loaded    
      if(localStorage.getItem("PreviousSearches") == null)
        localStorage.setItem("PreviousSearches", "");
      
    }
});
}



export {app}
export {init}