export default Vue.component('bus-result',{
	props: ['result'],
	template: 
	`<div class="result">
	<h2>{{result.name}}</h2>
	<p>Bus provided by {{result.agency}}</p>
	<p>Bus is part of routes: </p>
	<ul v-for="route in result.route_id">
		<li>{{route}}</li>
	</ul>
	<p>Bus arriving in {{result.arrivalTime}}
	</div>
	`
	
});