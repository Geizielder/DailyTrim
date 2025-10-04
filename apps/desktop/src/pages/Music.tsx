import { Tile } from "@carbon/react";
import { Music as MusicIcon } from "@carbon/icons-react";

export default function Music() {
  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Músicas</h1>

      <Tile
        style={{
          padding: "3rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <MusicIcon size={64} style={{ color: "#8d8d8d" }} />
        <h2>Integração com Navidrome</h2>
        <p style={{ color: "#8d8d8d", maxWidth: "40rem" }}>
          A funcionalidade de streaming de música será implementada em breve.
          Você poderá conectar suas credenciais do Navidrome e reproduzir sua biblioteca de músicas pessoal.
        </p>
      </Tile>
    </div>
  );
}