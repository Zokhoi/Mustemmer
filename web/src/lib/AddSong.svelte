<script lang="ts">
  export let dbRoot: string;
  let newSongs: any[] = [{}];

  import { showLoginModal } from "./showModal";
  function addRow(index: number) {
    newSongs.splice(index, 0, {});
    newSongs = newSongs; // force rerender
  }
  async function submitAddSongs() {
    let session = document.cookie.split(";").find(v=>v.startsWith("mustemmer_session_id="));
    if (session) {
      let normalized = [];
      for (let i = 0; i < newSongs.length; i++) {
        if (newSongs[i].name) {
          let normalizedSong: any = {
            name: newSongs[i].name,
            translatedName: newSongs[i].translatedName,
          };
          if (newSongs[i].artist) normalizedSong.personnel = newSongs[i].artist.split("|").map(v=>v.trim());
          if (newSongs[i].key) normalizedSong.key = newSongs[i].key.split("|").map(v=>v.trim());
          if (newSongs[i].tempo) normalizedSong.tempo = newSongs[i].tempo.split("|").map(v=>v.trim());
          if (newSongs[i].time) normalizedSong.time = newSongs[i].time.split("|").map(v=>v.trim());
          if (normalizedSong.tempo.some(v=>v.startsWith("~"))) {
            normalizedSong.variableTempo = true;
            normalizedSong.tempo = normalizedSong.tempo.map(v=>v.replace(/~+/g, ""));
          }
          if (normalizedSong.time.some(v=>v.startsWith("~"))) {
            normalizedSong.variableTime = true;
            normalizedSong.time = normalizedSong.time.map(v=>v.replace(/~+/g, ""));
          }
          normalized.push(normalizedSong);
        }
      }

      let res = await fetch(dbRoot+"/add", {
        method: "POST",
        body: JSON.stringify({ data: normalized }),
        mode: "cors",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      let data = await res.json();
      if (data.status === 'ok') {
        newSongs = [{}];
      };
    } else {
      showLoginModal.set(true);
    }
    
  }
</script>

<div id="add-song">
  <form id="add-song-form" on:submit|preventDefault={submitAddSongs}>
    <table id="add-song-table">
      <tr>
        <th>Artist</th>
        <th>Name</th>
        <th>Translated Name</th>
        <th>Key</th>
        <th>BPM</th>
        <th>Time</th>
      </tr>
      {#each newSongs as song, index}
        <tr>
          <td>
            <input type="text" name="Artist" bind:value={song.artist}>
          </td>
          <td>
            <input type="text" name="Name" bind:value={song.name}>
          </td>
          <td>
            <input type="text" name="Translated Name" bind:value={song.translatedName}>
          </td>
          <td>
            <input type="text" name="Key" bind:value={song.key}>
          </td>
          <td>
            <input type="text" name="BPM" bind:value={song.tempo}>
          </td>
          <td>
            <input type="text" name="Time" bind:value={song.time}>
          </td>
        </tr>
        <div class="btn add-row-btn" on:click={()=>addRow(index+1)}>+</div>
      {/each}
    </table>
    <br />
    <button class="btn add-song-btn" type="submit">Add songs</button>
    <button class="btn add-song-reset-btn" type="button" on:click={()=>newSongs=[{}]}>Reset</button>
  </form>
</div>

<style lang="scss">
  #add-song {
    text-align: center;
    overflow: visible;
  }
  #add-song-form, #add-song-table {
    display: inline-block;
    overflow: visible;
    position: relative;
  }
  #add-song-table tr {
    height: 10px;
  }
  .btn {
    cursor: pointer;
  }
  .add-row-btn {
    user-select: none;
    background-color: #a895ec;
    position: absolute;
    right: -20px;
    margin-top: -12px;
    width: 20px;
    border-radius: 40%;
  }
  #add-song-table input {
    border: 1px solid #888;
    border-radius: 5px;
    padding: 4px 10px;
  }
  .add-song-btn,
  .add-song-reset-btn {
    color: #FFF;
    background-color: #775bf5;
    border: none;
    border-radius: 5px;
    padding: 0.375em 1.5em;

    &:hover {
      background-color: #6544f8;
    }
  }
  @media (prefers-color-scheme: dark) {
    #add-song-table input {
      background-color: var(--dark-bg);
      color: var(--dark-text-color);
      &::placeholder {
        color: var(--dark-text-color);
      }
    }
  }
  @media (prefers-color-scheme: light) {
    #add-song-table input {
      background-color: var(--light-bg);
      color: var(--light-text-color);
      &::placeholder {
        color: var(--light-text-color);
      }
    }
  }
</style>