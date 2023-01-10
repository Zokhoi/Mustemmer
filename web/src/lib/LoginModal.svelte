<script lang="ts">
  export let dbRoot: string;
  import { showLoginModal } from "./showLoginModal";
  import { updateUserProfile } from "./UserProfile.svelte";
  function containerExitPrompt(e: Event) {
    if ((e.target as HTMLElement).classList.contains("modal-container")) showLoginModal.set(false);
  }
  async function loginForm(event: any) {
    let form = event.target as HTMLFormElement;
    let obj: any = {};
    for (let i of Object.keys(form.elements)) {
      if (form.elements[i].type !== "submit") {
        obj[form.elements[i].name] = form.elements[i].value
      }
    }
    let res = await fetch(dbRoot+'/login', {
      method: "POST",
      body: JSON.stringify(obj),
      mode: "cors",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    let jsonres = await res.json();
    if (jsonres.status!=='ok') {
      document.getElementById("login-message").innerText = jsonres.message;
    } else {
      showLoginModal.set(false);
      updateUserProfile(dbRoot);
    }
  }
</script>

<div class="modal-container" on:click={containerExitPrompt}>
  <div class="modal login-modal">
    <h2>Login to Mustemmer DB</h2>
    <form on:submit|preventDefault={loginForm}>
      <label for="uname">Username:</label>
      <input type="text" id="uname" name="username" placeholder="Username">
      <br />
      <label for="upw">Password:</label>
      <input type="password" id="upw" name="password" placeholder="Password">
      <br />
      <button type="submit">Login</button>
    </form>
    <div id="login-message" />
  </div>
</div>


<style>
  .modal-container {
    background-color: #57575788;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    text-align: center;
  }
  .modal {
    display: inline-block;
    background-color: #8993ca;
    border: 2px solid #6272ce;
    width: 30%;
    padding: 10px;
    margin: 40vh auto;
    text-align: center;
    color: var(--light-text-color);
  }
  .modal h2 {
    margin-top: 0;
  }
</style>