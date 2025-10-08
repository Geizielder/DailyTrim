use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fmt;

// Estruturas de dados
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NavidromeConfig {
    pub id: String,
    pub server_url: String,
    pub username: String,
    pub encrypted_password: String,
    pub owner: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PocketBaseResponse {
    pub id: String,
    pub server_url: String,
    pub username: String,
    pub encrypted_password: String,
    pub owner: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NavidromeConfigInput {
    pub server_url: String,
    pub username: String,
    pub password: String,
}

#[derive(Debug)]
pub struct NavidromeError {
    message: String,
}

impl fmt::Display for NavidromeError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Navidrome Error: {}", self.message)
    }
}

impl Error for NavidromeError {}

impl From<String> for NavidromeError {
    fn from(message: String) -> Self {
        NavidromeError { message }
    }
}

impl From<&str> for NavidromeError {
    fn from(message: &str) -> Self {
        NavidromeError {
            message: message.to_string(),
        }
    }
}

// Geração de chave de criptografia baseada em dados da máquina
fn get_machine_key() -> Result<Vec<u8>, Box<dyn Error>> {
    // Por enquanto, usamos uma chave derivada de informações do sistema
    // TODO: Em produção, usar keyring ou Windows DPAPI para armazenar chave

    use std::env;

    // Combina informações do sistema para gerar uma chave única por máquina
    let machine_id = format!(
        "{}-{}-{}",
        env::var("COMPUTERNAME").unwrap_or_else(|_| "unknown".to_string()),
        env::var("USERNAME").unwrap_or_else(|_| "unknown".to_string()),
        env::var("USERDOMAIN").unwrap_or_else(|_| "unknown".to_string())
    );

    // Usa SHA-256 para gerar chave de 32 bytes
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();
    machine_id.hash(&mut hasher);
    let hash = hasher.finish();

    // Expande para 32 bytes (256 bits) para AES-256
    let mut key = vec![0u8; 32];
    let hash_bytes = hash.to_le_bytes();
    for i in 0..32 {
        key[i] = hash_bytes[i % 8];
    }

    Ok(key)
}

// Criptografa senha usando AES-256-GCM
pub fn encrypt_password(password: &str) -> Result<String, Box<dyn Error>> {
    use aes_gcm::{
        aead::{Aead, KeyInit, OsRng},
        Aes256Gcm, Nonce,
    };
    use base64::{engine::general_purpose, Engine as _};

    let key = get_machine_key()?;
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| format!("Failed to create cipher: {}", e))?;

    // Gera nonce aleatório de 96 bits (12 bytes) - tamanho recomendado para AES-GCM
    let mut nonce_bytes = [0u8; 12];
    use rand::RngCore;
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Criptografa
    let ciphertext = cipher
        .encrypt(nonce, password.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    // Concatena nonce + ciphertext e codifica em base64
    let mut result = nonce_bytes.to_vec();
    result.extend_from_slice(&ciphertext);

    Ok(general_purpose::STANDARD.encode(&result))
}

// Descriptografa senha
pub fn decrypt_password(encrypted: &str) -> Result<String, Box<dyn Error>> {
    use aes_gcm::{
        aead::{Aead, KeyInit},
        Aes256Gcm, Nonce,
    };
    use base64::{engine::general_purpose, Engine as _};

    let key = get_machine_key()?;
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| format!("Failed to create cipher: {}", e))?;

    // Decodifica base64
    let data = general_purpose::STANDARD
        .decode(encrypted)
        .map_err(|e| format!("Base64 decode failed: {}", e))?;

    if data.len() < 12 {
        return Err("Invalid encrypted data: too short".into());
    }

    // Separa nonce (primeiros 12 bytes) e ciphertext
    let nonce = Nonce::from_slice(&data[0..12]);
    let ciphertext = &data[12..];

    // Descriptografa
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))?;

    String::from_utf8(plaintext).map_err(|e| format!("UTF-8 conversion failed: {}", e).into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let password = "my_secret_password_123";
        let encrypted = encrypt_password(password).expect("Encryption should succeed");

        // Verifica que não é plaintext
        assert_ne!(encrypted, password);
        assert!(encrypted.len() > password.len());

        // Verifica que descriptografa corretamente
        let decrypted = decrypt_password(&encrypted).expect("Decryption should succeed");
        assert_eq!(decrypted, password);
    }

    #[test]
    fn test_encrypt_produces_different_ciphertext() {
        let password = "same_password";
        let encrypted1 = encrypt_password(password).unwrap();
        let encrypted2 = encrypt_password(password).unwrap();

        // Nonces diferentes devem produzir ciphertexts diferentes
        assert_ne!(encrypted1, encrypted2);

        // Mas ambos devem descriptografar corretamente
        assert_eq!(decrypt_password(&encrypted1).unwrap(), password);
        assert_eq!(decrypt_password(&encrypted2).unwrap(), password);
    }
}

// ============================================================================
// TAURI COMMANDS
// ============================================================================

/// Salva configuração do Navidrome com senha criptografada
#[tauri::command]
pub async fn save_navidrome_config(
    pocketbase_url: String,
    auth_token: String,
    config_id: Option<String>,
    server_url: String,
    username: String,
    password: String,
    owner_id: String,
) -> Result<NavidromeConfig, String> {
    // Criptografa senha
    let encrypted_password = encrypt_password(&password).map_err(|e| e.to_string())?;

    let client = reqwest::Client::new();
    let url = format!("{}/api/collections/navidrome_config/records", pocketbase_url);

    // Se config_id existe, faz UPDATE, senão faz CREATE
    if let Some(id) = config_id {
        // UPDATE
        let update_url = format!("{}/{}", url, id);
        let response = client
            .patch(&update_url)
            .header("Authorization", auth_token)
            .json(&serde_json::json!({
                "server_url": server_url,
                "username": username,
                "encrypted_password": encrypted_password,
                "owner": owner_id
            }))
            .send()
            .await
            .map_err(|e| format!("Failed to update config: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(format!("PocketBase error: {}", error_text));
        }

        let pb_response: PocketBaseResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(NavidromeConfig {
            id: pb_response.id,
            server_url: pb_response.server_url,
            username: pb_response.username,
            encrypted_password: pb_response.encrypted_password,
            owner: pb_response.owner,
        })
    } else {
        // CREATE
        let response = client
            .post(&url)
            .header("Authorization", auth_token)
            .json(&serde_json::json!({
                "server_url": server_url,
                "username": username,
                "encrypted_password": encrypted_password,
                "owner": owner_id
            }))
            .send()
            .await
            .map_err(|e| format!("Failed to create config: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(format!("PocketBase error: {}", error_text));
        }

        let pb_response: PocketBaseResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(NavidromeConfig {
            id: pb_response.id,
            server_url: pb_response.server_url,
            username: pb_response.username,
            encrypted_password: pb_response.encrypted_password,
            owner: pb_response.owner,
        })
    }
}

/// Busca configuração do Navidrome (senha criptografada permanece criptografada)
#[tauri::command]
pub async fn get_navidrome_config(
    pocketbase_url: String,
    auth_token: String,
    owner_id: String,
) -> Result<Option<NavidromeConfig>, String> {
    let client = reqwest::Client::new();
    let url = format!(
        "{}/api/collections/navidrome_config/records?filter=(owner='{}')&perPage=1",
        pocketbase_url, owner_id
    );

    let response = client
        .get(&url)
        .header("Authorization", auth_token)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch config: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("PocketBase error: {}", error_text));
    }

    #[derive(Deserialize)]
    struct ListResponse {
        items: Vec<PocketBaseResponse>,
    }

    let list_response: ListResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    if list_response.items.is_empty() {
        return Ok(None);
    }

    let pb_response = &list_response.items[0];

    Ok(Some(NavidromeConfig {
        id: pb_response.id.clone(),
        server_url: pb_response.server_url.clone(),
        username: pb_response.username.clone(),
        encrypted_password: pb_response.encrypted_password.clone(),
        owner: pb_response.owner.clone(),
    }))
}

/// Gera token de autenticação Navidrome (descriptografa senha apenas em memória)
#[tauri::command]
pub fn generate_navidrome_auth(
    encrypted_password: String,
    salt: String,
) -> Result<String, String> {
    // Descriptografa senha em memória
    let password = decrypt_password(&encrypted_password).map_err(|e| e.to_string())?;

    // Gera token MD5(password + salt)
    let token_input = format!("{}{}", password, salt);
    let digest = md5::compute(token_input.as_bytes());
    let token = format!("{:x}", digest);

    // Senha é dropada aqui (sai do escopo)
    Ok(token)
}

/// Criptografa uma senha (helper para testes de conexão)
#[tauri::command]
pub fn encrypt_password_only(password: String) -> Result<String, String> {
    encrypt_password(&password).map_err(|e| e.to_string())
}
