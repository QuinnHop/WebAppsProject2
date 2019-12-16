export default Vue.component('bus-result-success',{
	props: ['result'],
	template: 
	`
	<b-card 
	v-if="result.isRunning"
	bg-variant="success"
	text-variant="white"
	class="col-lg-4"
	>
		<div class="card-header">Arriving at: {{result.arrivalTime}}</div>
		<div class="card-body">
			<h5 class="card-title">{{result.name}}</h5>
			<p class="card-text">This stop services routes: </p>
			<span class="card-text" v-for="route in result.route_id">
				{{route.text}}
    			<span>, </span>
			</span>
		</div>
	</b-card>
	<b-card 
	v-else
	bg-variant="danger"
	text-variant="white"
	class="col-lg-4"
	>
		<div class="card-header">Arriving at: {{result.arrivalTime}}</div>
		<div class="card-body">
			<h5 class="card-title">{{result.name}}</h5>
			<p class="card-text">This stop services routes: </p>
			<span class="card-text" v-for="route in result.route_id">
				{{route.text}}
				<span>, </span>
			</span>
		</div>
	</b-card>
	`
	
	
});
