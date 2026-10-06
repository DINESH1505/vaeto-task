const API_URL = "http://127.0.0.1:8080/api/auth";

/*LOGIN*/

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const message = document.getElementById("message");

        try {

            const response = await fetch(`${API_URL}/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.text();

            if (response.ok) {

                message.style.color = "green";
                message.textContent = "Login successful!";

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 500);

            } else {

                message.style.color = "red";
                message.textContent = data;
            }

        } catch (error) {

            console.error("Login Error:", error);

            message.style.color = "red";
            message.textContent = "Unable to connect to server";
        }
    });
}


/*REGISTER*/

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();

        const message =
            document.getElementById("message");

        console.log("Register Data:", {
            username: username,
            email: email,
            password: password
        });

        try {

            const response = await fetch(`${API_URL}/register`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            console.log("Status:", response.status);

            const data = await response.text();

            console.log("Server Response:", data);

            if (response.ok) {

                message.style.color = "green";
                message.textContent =
                    "Registration successful!";

                registerForm.reset();

            } else {

                message.style.color = "red";
                message.textContent = data;
            }

        } catch (error) {

            console.error("Registration Error:", error);

            message.style.color = "red";
            message.textContent =
                "Unable to connect to server";
        }
    });
}


