import { useState, type FormEvent } from "react";
import { TextInput, Button, InlineNotification, PasswordInput } from "@carbon/react";
import { useNavigate } from "react-router-dom";
import { pb } from "../lib/pb";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    try {
      await pb.collection("users").authWithPassword(email, password);
      navigate("/tasks");
    } catch (err: any) {
      setError("Falha ao entrar: " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Login</h2>
      {error && <InlineNotification kind="error" title={error} />}
      <form onSubmit={handleLogin}>
        <TextInput
          id="email"
          labelText="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          id="password"
          labelText="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Entrar</Button>
      </form>
    </div>
  );
}
