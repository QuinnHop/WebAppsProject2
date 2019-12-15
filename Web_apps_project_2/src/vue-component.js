export default Vue.component('bus-result-success',{
	props: ['result'],
	template: 
	`<div class="card text-white bg-success mb-3" style="width:90%;">
		<div class="card-header">Arriving in: {{result.arrivalTime}}</div>
		<div class="card-body">
		<h5 class="card-title">{{result.name}}</h5>
		<p class="card-text>This Stop services routes: </p>
		<span class="card-text" v-for="route in result.route_id">
    		<span>, </span>
		</span>
		<p class="card-text">This Bus stop is serviced by {{result.agency_id}}</p>
		</div>
  	</div>
	`
	
	
});
