import { Tile, Accordion, AccordionItem } from "@carbon/react";
import { Settings as SettingsIcon } from "@carbon/icons-react";

export default function Settings() {
  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Configurações</h1>

      <Accordion>
        <AccordionItem title="Geral">
          <Tile
            style={{
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <SettingsIcon size={48} style={{ color: "#8d8d8d" }} />
            <p style={{ color: "#8d8d8d" }}>
              Configurações gerais da aplicação serão implementadas aqui.
            </p>
          </Tile>
        </AccordionItem>

        <AccordionItem title="Navidrome">
          <Tile
            style={{
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <p style={{ color: "#8d8d8d" }}>
              Configure suas credenciais do Navidrome para acessar sua biblioteca de músicas.
            </p>
            <p style={{ color: "#8d8d8d", fontSize: "0.875rem" }}>
              Funcionalidade será implementada em breve.
            </p>
          </Tile>
        </AccordionItem>

        <AccordionItem title="Perfil">
          <Tile
            style={{
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <p style={{ color: "#8d8d8d" }}>
              Gerencie suas informações de perfil e preferências de conta.
            </p>
          </Tile>
        </AccordionItem>
      </Accordion>
    </div>
  );
}