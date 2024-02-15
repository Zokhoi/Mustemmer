<script lang="ts">
  export let dbRoot: string;
  import BaseModal from "./BaseModal.svelte";
  import { showLoginModal } from "./showModal";
  import { updateUserProfile } from "./UserProfile.svelte";
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
    }).then(res=>res.json());
    if (res.status!=='ok') {
      document.getElementById("login-message").innerText = res.message;
    } else {
      showLoginModal.set(false);
      await updateUserProfile(dbRoot);
    }
  }
</script>

<BaseModal modalClass="login-modal" showModal={showLoginModal}>
  <h2>Login to Mustemmer DB</h2>
  <form on:submit|preventDefault={loginForm}>
    <label for="uname">Username:</label>
    <input type="text" id="uname" name="username" placeholder="Username" />
    <br />
    <label for="upw">Password:</label>
    <input type="password" id="upw" name="password" placeholder="Password" />
    <br />
    <button type="submit">Login</button>
  </form>
  <div id="login-message" />
</BaseModal>


<style>
</style>