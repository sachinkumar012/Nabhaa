require('dotenv').config();
const key = process.env.DID_API_KEY;

async function test() {
  console.log("Testing D-ID API creation...");
  const createReq = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_url: 'https://res.cloudinary.com/dnnkimx5e/image/upload/v1775154589/avatars/l974ooq6loifpxn0rlux.png',
      script: { type: 'text', input: 'Hello, this is a test. Are you working?', provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' } },
      config: { fluent: true, pad_audio: 0.0 }
    })
  });
  
  if (!createReq.ok) {
     console.error("Create failed:", createReq.status, await createReq.text());
     return;
  }
  const createData = await createReq.json();
  const id = createData.id;
  console.log("Created successfully, ID:", id, "Polling...");

  for (let i = 0; i < 15; i++) {
     await new Promise(r => setTimeout(r, 2000));
     const getOptions = { method: 'GET', headers: { 'Authorization': 'Basic ' + key, 'Accept': 'application/json' } };
     const res2 = await fetch('https://api.d-id.com/talks/' + id, getOptions);
     if (res2.ok) {
         const d2 = await res2.json();
         console.log(`Poll ${i+1}: status=${d2.status}`);
         if (d2.status === 'done') {
             console.log("DONE! URL:", d2.result_url);
             return;
         } else if (d2.status === 'error') {
             console.log("ERROR details:", JSON.stringify(d2));
             return;
         }
     }
  }
  console.log("Timeout.");
}
test();
