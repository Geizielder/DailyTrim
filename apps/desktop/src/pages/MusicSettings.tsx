import { useState, useEffect } from 'react';
import {
  Form,
  TextInput,
  Button,
  InlineNotification,
  Tile,
  Stack,
  PasswordInput,
} from '@carbon/react';
import { CheckmarkFilled, WarningFilled } from '@carbon/icons-react';
import { navidrome } from '../lib/navidrome';

export default function MusicSettings() {
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [notification, setNotification] = useState<{
    kind: 'success' | 'error' | 'info';
    title: string;
    subtitle: string;
  } | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, []);

  async function loadExistingConfig() {
    setIsLoading(true);
    try {
      const loaded = await navidrome.loadConfig();
      if (loaded) {
        const config = navidrome.getConfig();
        if (config) {
          setServerUrl(config.server_url);
          setUsername(config.username);
          setPassword('********'); // Don't show real password
          setIsConfigured(true);
          setNotification({
            kind: 'info',
            title: 'Configuração carregada',
            subtitle: 'Suas credenciais do Navidrome foram carregadas com sucesso.',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTestConnection() {
    if (!serverUrl || !username || !password) {
      setNotification({
        kind: 'error',
        title: 'Campos obrigatórios',
        subtitle: 'Por favor, preencha todos os campos.',
      });
      return;
    }

    // Don't use masked password for testing
    if (password === '********') {
      setNotification({
        kind: 'error',
        title: 'Senha necessária',
        subtitle: 'Por favor, insira sua senha novamente para testar a conexão.',
      });
      return;
    }

    setIsTesting(true);
    setNotification(null);

    try {
      console.log('Testing connection to:', serverUrl);
      const isValid = await navidrome.testConnection(serverUrl, username, password);

      if (isValid) {
        setNotification({
          kind: 'success',
          title: 'Conexão bem-sucedida!',
          subtitle: 'Conectado ao servidor Navidrome com sucesso.',
        });
      } else {
        setNotification({
          kind: 'error',
          title: 'Falha na conexão',
          subtitle: 'Não foi possível conectar ao servidor. Verifique as credenciais e URL.',
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setNotification({
        kind: 'error',
        title: 'Erro ao conectar',
        subtitle: error instanceof Error ? error.message : JSON.stringify(error),
      });
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSave() {
    if (!serverUrl || !username || !password) {
      setNotification({
        kind: 'error',
        title: 'Campos obrigatórios',
        subtitle: 'Por favor, preencha todos os campos.',
      });
      return;
    }

    // Don't save masked password
    if (password === '********') {
      setNotification({
        kind: 'error',
        title: 'Senha necessária',
        subtitle: 'Por favor, insira sua senha novamente para salvar.',
      });
      return;
    }

    setIsLoading(true);
    setNotification(null);

    try {
      await navidrome.saveConfig(serverUrl, username, password);
      setIsConfigured(true);
      setNotification({
        kind: 'success',
        title: 'Configuração salva!',
        subtitle: 'Suas credenciais foram salvas com sucesso. Você já pode usar o player de música.',
      });
      setPassword('********'); // Mask password after saving
    } catch (error) {
      setNotification({
        kind: 'error',
        title: 'Erro ao salvar',
        subtitle: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja remover a configuração do Navidrome?')) {
      return;
    }

    setIsLoading(true);
    try {
      await navidrome.deleteConfig();
      setServerUrl('');
      setUsername('');
      setPassword('');
      setIsConfigured(false);
      setNotification({
        kind: 'info',
        title: 'Configuração removida',
        subtitle: 'As credenciais do Navidrome foram removidas.',
      });
    } catch (error) {
      setNotification({
        kind: 'error',
        title: 'Erro ao remover',
        subtitle: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Configurações do Navidrome</h1>
      <p style={{ marginBottom: '2rem', color: '#525252' }}>
        Configure sua conexão com o servidor Navidrome para streaming de música.
      </p>

      <Tile style={{ maxWidth: '42rem', marginBottom: '2rem' }}>
        <Stack gap={6}>
          {notification && (
            <InlineNotification
              kind={notification.kind}
              title={notification.title}
              subtitle={notification.subtitle}
              onCloseButtonClick={() => setNotification(null)}
              lowContrast
            />
          )}

          <Form>
            <Stack gap={5}>
              <TextInput
                id="server-url"
                labelText="URL do Servidor"
                placeholder="https://music.exemplo.com"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                disabled={isLoading}
                helperText="URL completa do seu servidor Navidrome (incluindo https://)"
              />

              <TextInput
                id="username"
                labelText="Usuário"
                placeholder="seu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />

              <PasswordInput
                id="password"
                labelText="Senha"
                placeholder="sua_senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Button
                  kind="tertiary"
                  onClick={handleTestConnection}
                  disabled={isLoading || isTesting}
                  renderIcon={isConfigured ? CheckmarkFilled : WarningFilled}
                >
                  {isTesting ? 'Testando...' : 'Testar Conexão'}
                </Button>

                <Button
                  kind="primary"
                  onClick={handleSave}
                  disabled={isLoading || isTesting}
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>

                {isConfigured && (
                  <Button
                    kind="danger"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    Remover Configuração
                  </Button>
                )}
              </div>
            </Stack>
          </Form>
        </Stack>
      </Tile>

      <Tile style={{ maxWidth: '42rem', backgroundColor: '#f4f4f4' }}>
        <h3 style={{ marginBottom: '1rem' }}>ℹ️ Informações</h3>
        <ul style={{ paddingLeft: '1.5rem', color: '#525252' }}>
          <li>Certifique-se de que o servidor Navidrome está acessível pela URL fornecida</li>
          <li>É recomendado usar HTTPS para maior segurança</li>
          <li>Suas credenciais são armazenadas com segurança no PocketBase</li>
          <li>Você pode testar a conexão antes de salvar</li>
        </ul>
      </Tile>
    </div>
  );
}
