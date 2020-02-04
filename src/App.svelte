<script>
  import { onMount } from 'svelte'
  export let message
  let wsUrl, connectionId, clients

  onMount(async () => {
    //load initial ws url and title from backend API
    let data = await (await fetch('/api')).json()
    message = data.msg
    wsUrl = data.wsUrl
    
    //after component mounts create a new websocket connection with url
    const ws = new WebSocket(wsUrl)

    //websocket emits connected event to api gateway $connect route with connectionId
    ws.onopen = () => {
      let payload = {
        action: 'connected'
      }
      ws.send(JSON.stringify(payload))
      console.log('socket opened on', wsUrl)
    }

    // catch message events from the socket
    ws.onmessage = (e) => {
      let msg = JSON.parse(e.data)
      connectionId = msg.id
      clients = JSON.stringify(msg.clients)
    }

    ws.onclose = () => {
      let payload = {
        action: 'disconnected'
      }
      ws.send(JSON.stringify(payload))
    }

  })
</script>

<img src="cagepng.png" alt='One True God'/>
<p>YOU ARE WORSHIPER {connectionId}</p>
<h1>{message}</h1>
<p> There are {clients}</p>
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