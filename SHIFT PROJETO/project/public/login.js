document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Impede que o formulário seja enviado

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.querySelector(".error-message");
    const errorText = errorMessage.querySelector("p");

    // Ocultar a mensagem de erro antes de verificar
    errorMessage.style.display = "none";

    // Verificação de erros
    if (email === "" || password === "") {
        errorText.textContent = "Todos os campos são obrigatórios."; // Campos obrigatórios
        errorMessage.style.display = "block"; // Exibe a mensagem
    } else {
        // Simulação de verificação com base de dados (exemplo de API)
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            // Se o e-mail não estiver registrado ou a senha estiver incorreta
            if (data.error === "user_not_found") {
                errorText.textContent = "Utilizador não registrado."; // E-mail não registrado
            } else if (data.error === "incorrect_password") {
                errorText.textContent = "Senha incorreta."; // Senha incorreta
            } else {
                errorText.textContent = "Erro desconhecido. Tente novamente."; // Outro erro
            }
            errorMessage.style.display = "block"; // Exibe a mensagem de erro
        } else {
            // Se o login for bem-sucedido
            localStorage.setItem('token', data.token);
            window.location.href = 'welcome.html';  // Redireciona para a página de boas-vindas
        }
    }
});
