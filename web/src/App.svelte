<script lang="ts">
  // import logo from './assets/svelte.png';
  import UserProfile, { updateUserProfile } from './lib/UserProfile.svelte';
  import FindSong from './lib/FindSong.svelte';
  import AddSong from './lib/AddSong.svelte';
  import { showLoginModal } from "./lib/showLoginModal";
  let dbRoot = "/api";
</script>
<main>
  <div class="user-profile-container">
    <UserProfile dbRoot={dbRoot} on:mount={()=>updateUserProfile(dbRoot)} />
  </div>
  
  <h1>Mustemmer</h1>

  <FindSong dbRoot={dbRoot} />
  <AddSong dbRoot={dbRoot} />

  <p>
    Created by <a href="https://github.com/Qrael" target="_blank">Qrael</a>
  </p>

  {#if $showLoginModal}
    {#await import('./lib/LoginModal.svelte') then value }
      <svelte:component this={value.default} dbRoot={dbRoot}/>
    {/await}
  {/if}
  
</main>

<style lang="scss">
  @media (prefers-color-scheme: dark) {
    :root {
      background-color: var(--dark-bg);
      color: var(--dark-text-color);
    }
  }
  @media (prefers-color-scheme: light) {
    :root {
      background-color: var(--light-bg);
      color: var(--light-text-color);
    }
  }
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    --light-bg: #EEE;
    --light-text-color: #111;
    --light-soft-text-color: #111A;

    --dark-bg: #333;
    --dark-text-color: #CCC;
    --dark-soft-text-color: #CCCA;
  }

  main {
    // position: relative;
    text-align: center;
    padding: 1em;
    margin: 0 auto;
    height: 100%;
  }
  .user-profile-container {
    text-align: right;
  }

  /* img {
    height: 16rem;
    width: 16rem;
  } */

  h1 {
    color: #6544f8;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
