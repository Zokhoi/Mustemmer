<script context="module" lang="ts">
  export async function updateUserProfile(dbRoot: string) {
    let session = document.cookie.split(";").find(v=>v.startsWith("mustemmer_session_id="));
    let userProfile = document.getElementById("user-profile") as HTMLDivElement;
    if (session) {
      let res = await fetch(dbRoot+"/getUser", {
        method: "POST",
        mode: "cors",
        credentials: "include",
      })
      let data = await res.json();
      if (data.status === "ok") {
        if (data.data.sessionValid) {
          userProfile.innerText = `Logged in as ${data.data.username}`;
          return true;
        } else return false;
      } else {
        console.log(data.message);
        return undefined;
      }
    } else return false;
  }
</script>

<script lang="ts">
  export let dbRoot: string;
  import { onMount } from "svelte";
  import { showLoginModal } from "./showLoginModal";
  async function checkLogin() { 
    let result = await updateUserProfile(dbRoot);
    if (result === false) showLoginModal.set(true);
  }
  onMount(()=>updateUserProfile(dbRoot));
</script>

<div id="user-profile">
  <span on:click={checkLogin}>Login</span>
</div>