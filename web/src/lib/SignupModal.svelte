<script lang="ts">
  export let dbRoot: string;
  import { onMount, onDestroy } from "svelte";
  import { showSignupModal } from "./showModal";
  import { updateUserProfile } from "./UserProfile.svelte";
  function containerExitPrompt(e: Event) {
    if ((e.target as HTMLElement).classList.contains("modal-container")) showSignupModal.set(false);
  }
  async function signupForm(event: any) {
    let form = event.target as HTMLFormElement;
    let obj: any = {};
    let pw = document.getElementById("upw"), pw2 = document.getElementById("upw2");
    if (pw.value!==pw2.value) {
      document.getElementById("signup-message").innerText = "Passwords don't match."
    }
    for (let i of Object.keys(form.elements)) {
      if (form.elements[i].type !== "submit") {
        obj[form.elements[i].name] = form.elements[i].value
      }
    }
    let res = await fetch(dbRoot+'/createUser', {
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
      document.getElementById("signup-message").innerText = jsonres.message;
    } else {
      showSignupModal.set(false);
      updateUserProfile(dbRoot);
    }
  }
  const escKeydown = e => {
    if (e.code.toLowerCase() == "escape") showSignupModal.set(false);
  }
  onMount(()=>{
    window.addEventListener("keydown", escKeydown);
  });
  onDestroy(()=>{
    window.removeEventListener("keydown", escKeydown);
  });
</script>

<div class="modal-container" on:click={containerExitPrompt}>
  <div class="modal signup-modal">
    <h2>Sign up for Mustemmer DB</h2>
    <form on:submit|preventDefault={signupForm}>
      <label for="uname">Username:</label>
      <input type="text" id="uname" name="username" placeholder="Username" />
      <br />
      <label for="upw">Password:</label>
      <input type="password" id="upw" name="password" placeholder="Password" />
      <br />
      <label for="upw2">Reconfirm password:</label>
      <input type="password" id="upw2" name="password" placeholder="Reconfirm password" />
      <br />
      <label for="uinv">Invite code:</label>
      <input type="text" id="uinv" name="invite" placeholder="Invite code" />
      <br />
      <button type="submit">Sign up</button>
    </form>
    <div id="signup-message" />
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
    border-radius: 10px;
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