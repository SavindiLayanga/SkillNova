import fetch from 'node-fetch';

async function testUpload() {
  try {
    const res = await fetch("http://localhost:5000/api/analyze-cv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "I am a web developer with 5 years of experience.",
        fileName: "test.pdf"
      })
    });
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testUpload();
