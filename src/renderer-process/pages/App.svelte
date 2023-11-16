<script>
	import { onMount } from 'svelte';
	import Router from 'svelte-spa-router';
	import routes from '../routes';

	onMount(async () => {
		/* Invoke the method exposed by the main process to create the client socket */
		await window.electron.initClientIPC();

		/* Once initialized, messges can be sent to the server process like this */
		let params; //can be any type of input. String/Array/Object...
		await window.electron.send('message', params);
	});
</script>

<main>
	<Router {routes} />
</main>

<style>
	main {
		height: calc(100% - 15px);
	}
</style>