const a = async () => {
  try {
    const res = await fetch('https://nabhaa-backend.onrender.com/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', JSON.stringify(data, null, 2));
  } catch(e) {
    console.log('ERROR:', e.message);
  }
};
a();
