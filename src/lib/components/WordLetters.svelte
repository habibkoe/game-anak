<script lang="ts">
  export let text: string;
  export let correctLetterCount = 0;

  $: letters = text.split("");

  function isLetterIndexCorrect(index: number) {
    let nonSpaceIndex = -1;
    for (let i = 0; i <= index; i++) {
      if (letters[i] !== " ") nonSpaceIndex++;
    }
    return nonSpaceIndex > -1 && nonSpaceIndex < correctLetterCount;
  }
</script>

<div class="flex justify-center flex-wrap gap-1 mb-2">
  {#each letters as ch, i}
    {#if ch === " "}
      <span class="w-4"></span>
    {:else}
      <span
        class="text-4xl font-extrabold px-1 rounded transition-all"
        class:bg-green-200={isLetterIndexCorrect(i)}
        class:text-green-800={isLetterIndexCorrect(i)}
        class:-translate-y-1={isLetterIndexCorrect(i)}
      >
        {ch}
      </span>
    {/if}
  {/each}
</div>
