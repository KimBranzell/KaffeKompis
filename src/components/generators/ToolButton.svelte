<script lang="ts">
  export let variant: 'filled' | 'ghost' = 'filled';
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    filled: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    ghost: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500"
  };
</script>

<button
  {type}
  class={`${baseStyles} ${variants[variant]}`}
  on:click
>
  <slot />
</button>
