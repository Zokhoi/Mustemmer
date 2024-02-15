<script lang="ts">
  import { onMount } from "svelte";
  import { dbRoot } from "./constants";
  let searchParams: any = {
    keyShiftType: "semitone",
  };
  let foundSongs: any[] = [];
  let foundTotal: number = null, findLimit = 50, findPage = 1;
  let sort = null, sortByField = null;
  function genCamelotRegex(key: number, mode?: string) {
    let escaped = mode?.replace(/\+/g, "\\+").replace(/\./g, "\\.").replace(/\*/g, "\\*").replace(/\\/g, "\\")
                      .replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\$/g, "\\$").replace(/\^/g, "\\^")
                      .replace(/\[/g, "\\{").replace(/\]/g, "\\}").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
                      .replace(/\?/g, "\\?")//.replace(/\|/g, "\\|")
    if (escaped?.length && /^[ab]/.test(escaped.toLowerCase())) return `^${key}${escaped}.*`;
    else if (escaped?.length) return `^${key}[ab]${escaped}.*`
    else return `^${key}[ab].*`;
  }
  async function search(page?: number) {
    let search: any = {
      name: `%${searchParams.search?.trim() ?? ""}%`,
      personnel: `%${searchParams.artist?.trim() ?? ""}%`,
    }
    if (searchParams.key?.trim()) {
      let sourceKeys: string[] = searchParams.key.split("|").map(v=>v.trim());
      search.key = sourceKeys.map(v=>genCamelotRegex(parseInt(v), v.substring(parseInt(v).toString().length)));
      if (searchParams.keyRange) {
        let shift = searchParams.keyShiftType === "semitone" ? 5 : 1;
        for (let i = 1; i <= searchParams.keyRange; i++) {
          let shifted = [];
          for (let j = 0; j < sourceKeys.length; j++) {
            let num = parseInt(sourceKeys[j]);
            let suffix = sourceKeys[j].substring(num.toString().length);
            shifted.push(genCamelotRegex((num+i*shift-1)%12+1, suffix), genCamelotRegex((num+36-i*shift-1)%12+1, suffix));
          }
          search.key.push(...shifted);
        }
      }
    }
    if (searchParams.time?.trim()) {
      search.time = searchParams.time.split("|").map(v=>v.trim());
    }
    let pair = [parseFloat(searchParams.tempomin?.trim()), parseFloat(searchParams.tempomax?.trim())].map(v=>isNaN(v)?null:v);
    if (pair[0]!==null && pair[1]!==null) {
      search.tempo = [pair];
      if (searchParams.tempodtht) {
        search.tempo.push([pair[0]/2, pair[1]/2], [pair[0]*2, pair[1]*2]);
      }
    } else if (pair[0]!==null) {
      search.tempo = searchParams.tempodtht ? [ [pair[0]/2, null] ] : [pair];
    } else if (pair[1]!==null) {
      search.tempo = searchParams.tempodtht ? [ [null, pair[1]*2] ] : [pair];
    }
    if (page) {
      search.limit = findLimit;
      search.page = page;
    } else {
      search.limit = searchParams.limit ?? 50;
      search.page = searchParams.page ?? 1;
    }
    let res = await fetch(dbRoot+"/search", {
      method: "POST",
      body: JSON.stringify(search),
      mode: "cors",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(res=>res.json());
    sort = null;
    sortByField = null;
    if (res.status === 'ok') {
      document.getElementById("search-error-message").innerText = '';
      foundSongs = res.data.song;
      foundTotal = res.data.count;
      if (page) {
        findPage = page;
      } else {
        findLimit = searchParams.limit ?? 50;
        findPage = searchParams.page ?? 1;
      }
    } else document.getElementById("search-error-message").innerText = res.message;
  }
  function strcmp(a: string, b: string) {return +(a > b) - +(a < b)};
  function sortBy(field: string, event: Event) {
    let th = event.target as HTMLElement;
    if (th.classList.contains("sort-icon")) th = th.parentElement;
    if (sortByField === field) {
      foundSongs.reverse();
      sort = sort === "asc" ? "desc" : "asc";
    } else {
      switch (field.toLowerCase()) {
        case "id":
          foundSongs.sort((a, b)=>+(a.id>b.id) - +(a.id<b.id));
          break;
        case "artist":
          foundSongs.sort((a, b)=>strcmp(a.personnel[0].name.toLowerCase(), b.personnel[0].name.toLowerCase()));
          break;
        case "name":
          foundSongs.sort((a, b) => strcmp(a.name.toLowerCase(), b.name.toLowerCase()));
          break;
        case "translatedname":
          foundSongs.sort((a, b) => {
            if (!a.translatedName && !b.translatedName) return 0;
            else if (!a.translatedName) return -1;
            else if (!b.translatedName) return 1;
            else return strcmp(a.translatedName.toLowerCase(), b.translatedName.toLowerCase())
          });
          break;
        case "key":
          foundSongs.sort((a, b)=>{
            if (!a.key.length && !b.key.length) return 0;
            else if (!a.key.length) return -1;
            else if (!b.key.length) return 1;
            else {
              let aNum = parseInt(a.key[0]);
              let bNum = parseInt(b.key[0]);
              if (aNum === bNum) return strcmp(a.key[0],b.key[0]);
              else return aNum > bNum ? 1 : -1;
            };
          });
          break;
        case "tempo":
          foundSongs.sort((a, b)=>{
            if (!a.tempo.length && !b.tempo.length) return 0;
            else if (!a.tempo.length) return -1;
            else if (!b.tempo.length) return 1;
            else return a.tempo[0] - b.tempo[0];
          });
          break;
        case "time":
          foundSongs.sort((a, b)=>strcmp(a.time[0], b.time[0]));
          break;
      
        default:
          break;
      }
      sort = "asc";
      sortByField = field;
    }
    foundSongs = foundSongs;
  }
  onMount(async()=>{search()});
</script>

<div id="search-content">
  <form id="search-bar" on:submit|preventDefault={()=>search()}>
    <input id="song-search" type="search" placeholder="Find songs by name" bind:value="{searchParams.search}">
    <button type="submit" class="btn search-btn">Search</button>
    <br /><br />
    <div id="search-filters">
      <input class="song-metadata-filter" type="text" name="artist" placeholder="artist" bind:value="{searchParams.artist}">
      <input class="song-metadata-filter" type="text" name="key" placeholder="key" bind:value="{searchParams.key}">
      ±
      <input class="song-metadata-filter" type="number" name="key-range" min="0" max="6" step="1" placeholder="key range" bind:value="{searchParams.keyRange}">
      <input class="song-metadata-filter" type="radio" name="key-range" value="semitone" checked bind:group="{searchParams.keyShiftType}">
      <label for="semitone">semitone</label>
      <input class="song-metadata-filter" type="radio" name="key-range" value="fifth" bind:group="{searchParams.keyShiftType}">
      <label for="fifth">fifth</label>
      <br />
      <input class="song-metadata-filter" type="text" name="bpmmin" placeholder="minimum BPM" bind:value="{searchParams.tempomin}">
      ≤ BPM ≤
      <input class="song-metadata-filter" type="text" name="bpmmax" placeholder="maximum BPM" bind:value="{searchParams.tempomax}">
      <input class="song-metadata-filter" type="checkbox" name="bpm" value="doubletime / halftime" bind:checked="{searchParams.tempodtht}">
      <label for="doubletime / halftime">doubletime / halftime</label>
      <br />
      <input class="song-metadata-filter" type="text" name="time" placeholder="time signature" bind:value="{searchParams.time}">
      <input class="song-metadata-filter" type="number" name="limit" min="0" placeholder="Items per page (50)" bind:value="{searchParams.limit}">
      <input class="song-metadata-filter" type="number" name="page" min="1" placeholder="Page (1)" bind:value="{searchParams.page}">
    </div>
  </form>
  <div>
    <span style="color: #a895ec;">Light purple</span> text means variable tempo or variable time signature.
  </div>
  <div id="search-error-message" />
  <div id="search-results">
    {#if foundTotal}
      {#if foundTotal > findLimit && findLimit!==0}
        <div class="page-btn-container">
          {#each [...new Set([1, 2, 3,
                              findPage-1, findPage, findPage+1,
                              Math.ceil(foundTotal/findLimit)-2, Math.ceil(foundTotal/findLimit)-1, Math.ceil(foundTotal/findLimit)])]
                  .sort((a,b)=>a-b).filter(v=>v>0&&v<=Math.ceil(foundTotal/findLimit)) as pagenumber}
            {#if pagenumber === findPage}
              <div class="page-btn active">{pagenumber}</div>
            {:else}
              <div class="btn page-btn" on:click={()=>search(pagenumber)}>{pagenumber}</div>
            {/if}
          {/each}
        </div>
      {/if}
      <table id="search-results-table">
        <tr>
          <th class="song-metadata song-id" on:click={(e)=>sortBy('id', e)} data-sort="{sortByField==="id" ? sort : ''}">
            ID
            <span class="icon sort-icon" />
          </th>
          <th class="song-metadata song-artist" on:click={(e)=>sortBy('artist', e)} data-sort="{sortByField==="artist" ? sort : ''}">
            Artist
            <span class="icon sort-icon" />
          </th>
          <th class="song-metadata song-name" on:click={(e)=>sortBy('name', e)} data-sort="{sortByField==="name" ? sort : ''}">
            Name
            <span class="icon sort-icon" />
          </th>
          <th class="song-metadata song-translated-name" on:click={(e)=>sortBy('translatedName', e)} data-sort="{sortByField==="translatedName" ? sort : ''}">
            Translated Name
            <span class="icon sort-icon" />
          </th>
          <th class="song-metadata song-key" on:click={(e)=>sortBy('key', e)} data-sort="{sortByField==="key" ? sort : ''}">
            Key
            <span class="icon sort-icon" />
          </th>
          <th class="song-metadata song-tempo" on:click={(e)=>sortBy('tempo', e)} data-sort="{sortByField==="tempo" ? sort : ''}">
            BPM
            <span class="icon sort-icon" />
          </th>
          <th class="song-metadata song-time" on:click={(e)=>sortBy('time', e)} data-sort="{sortByField==="time" ? sort : ''}">
            Time
            <span class="icon sort-icon" />
          </th>
        </tr>
        {#each foundSongs as song}
          <tr data-song-id={song.id}>
            <td class="song-id">{song.id}</td>
            <td class="song-artist">{song.personnel?.length ? song.personnel.map(v=>v.name).join(" | ") : ''}</td>
            <td class="song-name">{song.name ?? ''}</td>
            <td class="song-translated-name">{song.translatedName ?? ''}</td>
            <td class="song-key">{song.key?.length ? song.key.join(" | ") : ''}</td>
            <td class="song-tempo {song.variableTempo ? "variable-tempo" : ""}">{song.tempo?.length ? song.tempo.join(" | ") : ''}</td>
            <td class="song-time {song.variableTime ? "variable-time" : ""}">{song.time?.length ? song.time.join(" | ") : ''}</td>
          </tr>
        {/each}
      </table>
    {:else if foundTotal === 0}
      <div id="no-results">
        <h3>No results.</h3>
      </div>
    {/if}
  </div>
</div>


<style lang="scss">
  @media (prefers-color-scheme: dark) {
    #search-bar input {
      background-color: var(--dark-bg);
      color: var(--dark-bg-text-color);
      &::placeholder {
        color: var(--dark-softer-bg-text-color);
      }
    }
  }
  @media (prefers-color-scheme: light) {
    #search-bar input {
      background-color: var(--light-bg);
      color: var(--light-bg-text-color);
      &::placeholder {
        color: var(--light-bg-soft-bg-text-color);
      }
    }
    #search-results .page-btn.active {
      color: var(--light-bg-text-color);
    }
  }
  #search-bar {
    input {
      border: 1px solid #888;
      border-radius: 5px;
      padding: 4px 10px;
    }
    #song-search {
      display: inline-block;
      padding: 0.375em 1.5em;
      font-size: 1.25em;
      width: 45%;
      border: 2.5px solid var(--light-accent);
      border-radius: 10px;
      box-shadow: none;
    }
    #search-filters {
      line-height: 2;
    }
  }
  #search-content {
    font-size: 1em;
    text-align: center;
  }
  #song-search:focus-visible,
  #song-search:focus,
  .search-btn:focus-visible,
  .search-btn:focus {
    outline: 2px solid var(--light-accent);
  }
  .search-btn {
    display: inline-block;
    color: #FFF;
    background-color: var(--light-accent);
    text-shadow: none;
    padding: 0.375em 1.5em;
    font-size: 1.25em;
    border: 2px solid var(--light-accent);
    border-radius: 10px;
    user-select: none;

    &:hover {
      background-color: var(--dark-accent);
      cursor: pointer;
    }
  }
  #search-results {
    text-align: center;
    display: inline-block;
    margin: 20px;

    .btn {
      cursor: pointer;
    }
    .page-btn {
      display: inline-block;
      color: #FFF;
      background-color: var(--light-accent);
      border: none;
      border-radius: 5px;
      padding: 0.375em 1.5em;
      margin: 2px;
      font-size: 16px;
      user-select: none;

      &:hover {
        background-color: var(--dark-accent);
      }

      &.active {
        background-color: transparent;
        border: 2px solid var(--light-accent);
        padding: calc(0.375em - 2px) calc(1.5em - 2px);
      }

      &.active:hover {
        background-color: transparent;
        border: 2px solid var(--dark-accent);
      }
    }
  }
  #search-results-table {
    // border-spacing: 10px;
    // border-collapse: collapse;
    tr {
      border: 2px solid #888;
      border-radius: 5px;
    }
    td, th {
      position: relative;
      border: 1px solid #888;
      border-radius: 5px;
      padding: 4px 10px;

      &.song-id,
      &.song-key, 
      &.song-tempo,
      &.song-time {
        width: 100px;
      }
      &.song-artist,
      &.song-name{
        width: 250px;
      }
    }
    td.variable-tempo,
    td.variable-time {
      color: #a895ec;
    }
    th {
      cursor: pointer;
      user-select: none;
    }
    .song-metadata[data-sort="asc"] .sort-icon {
      background-color: #444;
      &::before {
        content: "△";
        position: absolute;
        right: 0.5em;
      }
    }
    .song-metadata[data-sort="desc"] .sort-icon {
      background-color: #444;
      &::before {
        content: "▽";
        position: absolute;
        right: 0.5em;
      }
    }
  }
</style>