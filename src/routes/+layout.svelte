<script lang="ts">
	import { onMount } from 'svelte';
	import "../app.css";
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth';

	let { children } = $props();

	onMount(() => {
		authStore.initialize();
	});
</script>

<svelte:head>
	<title>Game Belajar Membaca - Permainan Edukasi Anak</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
