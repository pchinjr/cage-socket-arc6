<script>
  // const wsUrl = process.env.ARC_WSS_URL
  import { onMount } from 'svelte'
  export let message
  let wsUrl
  let connectionId
  onMount(async () => {
    let data = await (await fetch('/api')).json()
    message = data.msg
    wsUrl = data.wsUrl
    console.log('MESSAGE: ', message)

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      let payload = {
        action: 'connected'
      }
      ws.send(JSON.stringify(payload))
    }

    ws.onmessage = (e) => {
      let msg = JSON.parse(e.data)
      connectionId = msg.id
    }


  })
</script>

<img src="cagepng.png" alt='One True God'/>
<p>YOU ARE WORSHIPER {connectionId}</p>
<h1>{message}</h1>
<h2>The Lord's Prayer</h2>
<p><strong>Our Father</strong>, which art in Snake Eyes,<br> 
  Nicolas be thy name;<br>  
  thy  Face/Off come;<br>  
  thy Con-Air be done,<br>  
  in earth as it is in Deadfall.<br>  
  Give us this day our daily Ghost Rider.<br>  
  And forgive him for Trespass,<br>  
  as we forgave him for Windtalkers.<br>  
  And lead us not into Adaptation.;<br>  
  but deliver us from The Rock.<br> 
  <br> 	
  For thine is the Wicker Man,<br>  
  the National Treasure,<br>  
  for ever and ever.<br>  
  <strong>Amen</strong><br> 
</p>

<style>
</style>