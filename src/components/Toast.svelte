<script>
  import { fly, fade } from "svelte/transition";
  import { cubicOut, cubicIn } from "svelte/easing";
  import { onMount } from "svelte";

  let {
    message = "no message given",
    type = "info",
    duration = 3000,
    onClose,
  } = $props();

  onMount(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  });
</script>

<div
  class={`toast toast-${type}`}
  style={`--duration: ${duration}ms`}
  in:fly={{ x: 20, duration: 220, easing: cubicOut }}
  out:fly={{ x: 24, duration: 160, easing: cubicIn }}
>
  <span>{`${message}`}</span>

  <button onclick={onClose}> &#10005; </button>
</div>

<style>
  .toast::before {
    content: "";
    position: absolute;

    inset: 0;

    background: rgb(255, 255, 255, 0.1);

    transform-origin: left;
    animation: countdown var(--duration) linear forwards;

    z-index: 1;
  }

  @keyframes countdown {
    from {
      transform: scaleX(1);
    }

    to {
      transform: scaleX(0);
    }
  }
</style>
