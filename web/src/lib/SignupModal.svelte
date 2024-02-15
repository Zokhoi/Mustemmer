<script lang="ts">
  export let dbRoot: string;
  import BaseModal from "./BaseModal.svelte";
  import { showSignupModal } from "./showModal";
  import { updateUserProfile } from "./UserProfile.svelte";
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
    }).then(res=>res.json());
    if (res.status==='ok') {
      document.getElementById("signup-message").innerText = res.message;
    } else {
      showSignupModal.set(false);
      updateUserProfile(dbRoot);
    }
  }
</script>

<BaseModal modalClass="signup-modal" showModal={showSignupModal}>
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
</BaseModal>


<style>
</style>