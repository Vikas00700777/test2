const codeInput = document.getElementById("codeInput");
const output = document.getElementById("output");
const reviewBtn = document.getElementById("reviewBtn");
const statusDot = document.getElementById("statusDot");
const outputWrap = document.getElementById("outputWrap");

async function reviewCode() {
    const code = codeInput.value;

    if (!code.trim()) {
        output.innerText = "❌ Please paste code first";
        output.classList.remove("ready");
        outputWrap.classList.remove("has-content");
        return;
    }

    output.innerText = "⏳ Reviewing code... This may take a few seconds.";
    output.classList.remove("ready");
    statusDot.classList.add("active");
    reviewBtn.disabled = true;
    reviewBtn.innerText = "Reviewing...";

    try {
        const response = await fetch("http://localhost:5000/review", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ code })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`);
        }

        if (data.review) {
            output.innerText = data.review;
            output.classList.add("ready");
            outputWrap.classList.add("has-content");
        } else if (data.error) {
            output.innerText = "❌ " + data.error;
            output.classList.remove("ready");
            outputWrap.classList.remove("has-content");
        }

    } catch (err) {
        if (err.message.includes("Failed to fetch")) {
            output.innerText = "❌ Cannot connect to server.\n\nMake sure:\n1. Backend server is running (node server.js)\n2. Server is on port 5000\n3. CORS is enabled";
        } else if (err.message.includes("quota")) {
            output.innerText = "❌ API quota exceeded. Please wait a few minutes and try again.";
        } else {
            output.innerText = "❌ Error: " + err.message;
        }
        output.classList.remove("ready");
        outputWrap.classList.remove("has-content");
        console.error("Review Error:", err);
    } finally {
        statusDot.classList.remove("active");
        reviewBtn.disabled = false;
        reviewBtn.innerText = "Review Code →";
    }
}

reviewBtn.addEventListener("click", reviewCode);

codeInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        reviewCode();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    console.log("✅ AI Code Reviewer loaded");
    console.log("📝 Paste your code and click 'Review Code' or press Ctrl/Cmd + Enter");
});