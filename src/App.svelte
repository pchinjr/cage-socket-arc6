<script>
  import { onMount } from 'svelte'
  export let message;
  onMount(async () => {
    let data = await (await fetch('/api')).json()
    message = data.msg
    console.log('MESSAGE: ', message)
  })
</script>

<style>
  h1 {
    color: purple;
  }
</style>

<h1>{message}</h1>
<h2>The Lord's Prayer</h2>
<p><strong>Our Father</strong>, which art in Snake Eyes, 
  Nicolas be thy name;   
  thy  Face/Off come; 
  thy Con-Air be done,
  in earth as it is in Deadfall.
  Give us this day our daily Ghost Rider.
  And forgive him for Trespass,
  as we forgave him for Windtalkers.
  And lead us not into Adaptation.;
  but deliver us from The Rock.
  For thine is the Wicker Man,
  the National Treasure
</p>