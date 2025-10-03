import { useState } from "react";
import { TextInput, Button, InlineNotification, PasswordInput } from "@carbon/react";
import { useNavigate } from "react-router-dom";
import { pb } from "../lib/pb";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name,
      });
      await pb.collection("users").authWithPassword(email, password);
      navigate("/tasks");
    } catch (err: any) {
      setError("Erro ao cadastrar: " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Criar Conta</h2>
      {error && <InlineNotification kind="error" title={error} />}
      <form onSubmit={handleRegister}>
        <TextInput
          id="name"
          labelText="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <Button type="submit">Cadastrar</Button>
      </form>
    </div>
  );
}
