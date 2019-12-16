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
		<div style="margin-right:2em;" class="card-header">Arriving at: {{result.arrivalTime}}</div>
		<div style="margin-right:2em;" class="card-body">
			<h5 class="card-title">{{result.name}}</h5>
			<p >This Stop services routes: </p>
			<span v-for="route in result.route_id">
				<span>{{route}}</span>
				<span v-if="result.route_id.length > 1">, </span>
			</span>
		</div>
	</b-card>
	<b-card 
	v-else
	bg-variant="danger"
	text-variant="white"
	class="col-lg-4"
	>
		<div style="margin-right:2em;" class="card-header">Arriving at: {{result.arrivalTime}}</div>
		<div style="margin-right:2em;" class="card-body">
			<h5 class="card-title">{{result.name}}</h5>
			<p >This Stop services routes: </p>
			<span v-for="route in result.route_id ">
				<span>{{route}}</span>
				<span v-if="result.route_id.length > 1 && route != result.route_id[result.route_id-1]">, </span>
			</span>
		</div>
	</b-card>
	`
	
	
});
