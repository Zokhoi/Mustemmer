<script lang="ts">
  import { dbRoot } from "./constants";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { faCopy, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
  import BaseModal from "./BaseModal.svelte";
  import { showInviteModal } from "./showModal";
  let infiniteUse = false, neverExpire = true, invite = null, copied = false;
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
    }).then(res=>res.json());
    if (res.status==='ok') {
      invite = res.data.code;
      copied = false;
    }
  }
  async function copyInvite(e: Event) {
    navigator.clipboard.writeText(invite);
    copied = true;
  }
</script>

<BaseModal modalClass="invite-modal" showModal={showInviteModal}>
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
  {#if invite}
    <div id="invite-message">
      Invite code: {invite}
      <span id="copy-icon" class="clickable" on:click={copyInvite}>
        {#if copied}
          <FontAwesomeIcon icon={faSquareCheck} size="1x" />
        {:else}
          <FontAwesomeIcon icon={faCopy} size="1x" />
        {/if}
      </span>
    </div>
  {/if}
</BaseModal>


<style>
  .clickable, .clickable:hover {
    cursor: pointer;
  }
</style>