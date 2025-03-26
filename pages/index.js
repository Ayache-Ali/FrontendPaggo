import { useState } from "react";
import { useRouter } from "next/router"; 

export default function Home() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");  
  const apiUrl = env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const router = useRouter(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${apiUrl}/auth/login`, {  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.message === "Login successful") { 
      localStorage.setItem("id", data.id);
      localStorage.setItem("token", data.token);
      router.push("/upload"); 
    } else {
      setError("Credenciais inválidas, tente novamente!"); 
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Usuário:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>} {}

        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}