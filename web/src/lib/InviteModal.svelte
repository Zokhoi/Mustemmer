<script lang="ts">
  export let dbRoot: string;
  import { onMount, onDestroy } from "svelte";
  import { showInviteModal } from "./showModal";
  let infiniteUse = false, neverExpire = true;
  function containerExitPrompt(e: Event) {
    if ((e.target as HTMLElement).classList.contains("modal-container")) showInviteModal.set(false);
  }
  async function inviteForm(event: any) {
    let form = event.target as HTMLFormElement;
    let obj: any = {};
    if (infiniteUse) obj.usesRemain = -1;
    else obj.usesRemain = document.getElementById("invite-uses").value;
    if (!neverExpire) obj.expireDate = Date.now()+document.getElementById("invite-expiration").value*24*3600*1000;
    let res = await fetch(dbRoot+'/generateInvite', {
      method: "POST",
      body: JSON.stringify(obj),
      mode: "cors",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    let jsonres = await res.json();
    if (jsonres.status==='ok') {
      document.getElementById("invite-message").innerText = `Invite code: ${jsonres.data.code}`;
    }
  }
  const escKeydown = e => {
    if (e.code.toLowerCase() == "escape") showInviteModal.set(false);
  }
  onMount(()=>{
    window.addEventListener("keydown", escKeydown);
  });
  onDestroy(()=>{
    window.removeEventListener("keydown", escKeydown);
  });
</script>

<div class="modal-container" on:click={containerExitPrompt}>
  <div class="modal invite-modal">
    <h2>Generate invite code for signing up</h2>
    <form on:submit|preventDefault={inviteForm}>
      <label for="invite-uses">Total uses:</label>
      <input type="number" id="invite-uses" name="usesRemain" value="1" step="1" min="1" disabled={infiniteUse}/>
      <br />
      <label for="invite-infinite">Infinite use:</label>
      <input type="checkbox" id="invite-infinite" name="infinite" bind:checked={infiniteUse} />
      <br />
      <label for="invite-expiration">Expiration:</label>
      <input type="number" id="invite-expiration" name="expireDate" value="30" min="0" disabled={neverExpire} /> Days
      <br />
      <label for="invite-never-expire">Never expire:</label>
      <input type="checkbox" id="invite-never-expire" name="neverExpire" bind:checked={neverExpire}/>
      <br />
      <button type="submit">Generate invite</button>
    </form>
    <div id="invite-message" />
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