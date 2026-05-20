const API_URL = `${window.location.origin}/api`;

const resetEmail = document.getElementById("resetEmail");
const verificationCode = document.getElementById("verificationCode");
const newPassword = document.getElementById("newPassword");
const requestResetBtn = document.getElementById("requestResetBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const resetMessage = document.getElementById("resetMessage");
const devCodeBox = document.getElementById("devCodeBox");

function showResetMessage(message, type = "success") {
  resetMessage.textContent = message;
  resetMessage.className = `message ${type}`;
}

async function authRequest(endpoint, body) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

async function requestResetCode() {
  try {
    const email = resetEmail.value.trim();

    if (!email) {
      showResetMessage("Email is required.", "error");
      return;
    }

    const data = await authRequest("/auth/forgot-password", { email });

    if (data.resetCode) {
      devCodeBox.textContent = `Verification code: ${data.resetCode}`;
      devCodeBox.classList.remove("hidden");
      verificationCode.value = data.resetCode;
    } else {
      devCodeBox.classList.add("hidden");
    }

    showResetMessage(data.message, "success");
  } catch (error) {
    showResetMessage(error.message, "error");
  }
}

async function resetPassword() {
  try {
    const email = resetEmail.value.trim();
    const code = verificationCode.value.trim();
    const password = newPassword.value.trim();

    if (!email || !code || !password) {
      showResetMessage(
        "Email, verification code and new password are required.",
        "error"
      );
      return;
    }

    if (password.length < 6) {
      showResetMessage("Password must be at least 6 characters.", "error");
      return;
    }

    const data = await authRequest("/auth/reset-password", {
      email,
      code,
      newPassword: password,
    });

    devCodeBox.classList.add("hidden");
    verificationCode.value = "";
    newPassword.value = "";
    showResetMessage(`${data.message} You can login now.`, "success");
  } catch (error) {
    showResetMessage(error.message, "error");
  }
}

requestResetBtn.addEventListener("click", requestResetCode);
resetPasswordBtn.addEventListener("click", resetPassword);
