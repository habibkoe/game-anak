<script lang="ts">
  export let show = false;
  export let src = "";
  export let alt = "";
</script>

{#if show}
  <div class="flex justify-center mt-4">
    <img
      src={src}
      alt={alt}
      class="w-40 h-32 object-contain rounded-xl shadow-xl"
    />
  </div>
{/if}
