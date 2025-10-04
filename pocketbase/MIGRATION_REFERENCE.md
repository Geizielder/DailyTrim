# PocketBase JavaScript Migrations - Referência Completa

## Estrutura Básica de uma Migration

```javascript
/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  // Operações de "upgrade" (obrigatório)
  return // retornar promise ou resultado
}, (db) => {
  // Operações de "downgrade" (opcional)
  return // retornar promise ou resultado
})
```

## Comandos de Migration

- Criar migration: `./pocketbase migrate create "nome_da_migration"`
- Aplicar migrations: `./pocketbase migrate up`
- Reverter migrations: `./pocketbase migrate down [numero]`
- Gerar snapshot de coleções: `./pocketbase migrate collections`

## Criar uma Coleção

### Sintaxe Básica

```javascript
migrate((db) => {
  const collection = new Collection({
    name: "nome_da_colecao",
    type: "base", // "base", "auth", ou "view"
    system: false,
    schema: [
      // campos aqui
    ],
    listRule: null, // ou regra de acesso
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null
  })

  return $app.dao().saveCollection(collection)
}, (db) => {
  const collection = $app.dao().findCollectionByNameOrId("nome_da_colecao")
  return $app.dao().deleteCollection(collection)
})
```

## Tipos de Campos (Field Types)

### 1. TextField (Texto)
```javascript
{
  name: "title",
  type: "text",
  required: true,
  options: {
    min: 1,      // tamanho mínimo
    max: 160,    // tamanho máximo
    pattern: ""  // regex de validação
  }
}
```

### 2. NumberField (Número)
```javascript
{
  name: "age",
  type: "number",
  required: true,
  options: {
    min: 0,
    max: 999999,
    noDecimal: true  // apenas inteiros
  }
}
```

### 3. BoolField (Booleano)
```javascript
{
  name: "active",
  type: "bool",
  required: false
}
```

### 4. EmailField (Email)
```javascript
{
  name: "email",
  type: "email",
  required: true,
  options: {
    exceptDomains: [],  // domínios bloqueados
    onlyDomains: []     // apenas esses domínios
  }
}
```

### 5. URLField (URL)
```javascript
{
  name: "website",
  type: "url",
  required: false,
  options: {
    exceptDomains: [],
    onlyDomains: []
  }
}
```

### 6. DateField (Data)
```javascript
{
  name: "due_date",
  type: "date",
  required: false,
  options: {
    min: "",  // data mínima (ISO format)
    max: ""   // data máxima (ISO format)
  }
}
```

### 7. AutodateField (Data Automática)
```javascript
{
  name: "published_at",
  type: "autodate",
  required: false,
  options: {
    onCreate: true,  // seta na criação
    onUpdate: false  // atualiza em cada update
  }
}
```

### 8. SelectField (Seleção)
```javascript
{
  name: "status",
  type: "select",
  required: true,
  options: {
    maxSelect: 1,  // 1 = select único, >1 = multi-select
    values: ["todo", "doing", "done"]
  }
}
```

### 9. FileField (Arquivo)
```javascript
{
  name: "avatar",
  type: "file",
  required: false,
  options: {
    maxSelect: 1,  // quantidade de arquivos
    maxSize: 5242880,  // tamanho máximo em bytes (5MB)
    mimeTypes: ["image/jpeg", "image/png"],
    thumbs: ["100x100"]  // gerar thumbnails
  }
}
```

### 10. RelationField (Relação)
```javascript
{
  name: "owner",
  type: "relation",
  required: true,
  options: {
    collectionId: "_pb_users_auth_",  // ID da coleção relacionada
    cascadeDelete: false,  // deletar em cascata
    minSelect: 1,
    maxSelect: 1,  // 1 = relação única, >1 = multi-relação
    displayFields: []  // campos a mostrar
  }
}
```

### 11. EditorField (Editor de Texto Rico)
```javascript
{
  name: "content",
  type: "editor",
  required: false,
  options: {
    convertUrls: false  // converter URLs em links
  }
}
```

### 12. JSONField (JSON)
```javascript
{
  name: "metadata",
  type: "json",
  required: false,
  options: {
    maxSize: 2000000  // tamanho máximo em bytes
  }
}
```

### 13. GeoPointField (Ponto Geográfico)
```javascript
{
  name: "location",
  type: "geopoint",
  required: false
}
```

## Regras de Acesso (API Rules)

Regras usam a sintaxe de filtros do PocketBase:

```javascript
// Exemplos de regras comuns:
listRule: "owner = @request.auth.id"  // usuário vê apenas seus registros
viewRule: "owner = @request.auth.id"
createRule: "@request.auth.id != '' && owner = @request.auth.id"
updateRule: "owner = @request.auth.id"
deleteRule: "owner = @request.auth.id"

// Público (qualquer um pode acessar)
listRule: ""
viewRule: ""

// Apenas admin
listRule: "@request.auth.id != '' && @request.auth.role = 'admin'"

// Ninguém pode acessar
listRule: null
```

## Métodos do DAO ($app.dao())

```javascript
// Salvar coleção
$app.dao().saveCollection(collection)

// Buscar coleção
$app.dao().findCollectionByNameOrId("nome_ou_id")

// Deletar coleção
$app.dao().deleteCollection(collection)

// Buscar todos os registros
$app.dao().findAllRecords("collection_name")

// Buscar registro por ID
$app.dao().findRecordById("collection_name", "record_id")

// Buscar com filtro
$app.dao().findRecordsByFilter("collection_name", "status = 'active'")
```

## Executar SQL Direto

```javascript
migrate((db) => {
  db.newQuery("UPDATE articles SET status = 'pending'").execute()
})
```

## Operações em Transação

```javascript
migrate((db) => {
  return $app.runInTransaction((txApp) => {
    // operações aqui usam txApp
    return txApp.save(collection)
  })
})
```

## Exemplo Completo: Coleção Tasks

```javascript
/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const collection = new Collection({
    name: "tasks",
    type: "base",
    system: false,
    schema: [
      {
        name: "title",
        type: "text",
        required: true,
        options: { min: 1, max: 160 }
      },
      {
        name: "status",
        type: "select",
        required: true,
        options: { maxSelect: 1, values: ["todo","doing","done"] }
      },
      {
        name: "priority",
        type: "select",
        required: false,
        options: { maxSelect: 1, values: ["low","medium","high"] }
      },
      {
        name: "due_at",
        type: "date",
        required: false
      },
      {
        name: "timeSpent",
        type: "number",
        required: true,
        options: { min: 0, noDecimal: true }
      },
      {
        name: "notes",
        type: "text",
        required: false
      },
      {
        name: "owner",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1
        }
      }
    ],
    listRule: "owner = @request.auth.id",
    viewRule: "owner = @request.auth.id",
    createRule: "@request.auth.id != '' && owner = @request.auth.id",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id"
  })

  return $app.dao().saveCollection(collection)
}, (db) => {
  const collection = $app.dao().findCollectionByNameOrId("tasks")
  return $app.dao().deleteCollection(collection)
})
```

## Dicas Importantes

1. **Sempre retorne uma Promise ou resultado** das funções de migrate
2. **Use `$app.dao()`** para operações de coleção (não apenas `$app`)
3. **IDs de sistema** como `id`, `created`, `updated` são criados automaticamente
4. **Coleção `_pb_users_auth_`** é a coleção padrão de usuários
5. **Type definitions** estão em `pb_data/types.d.ts`
6. **Migrations são executadas em ordem** (timestamp no nome do arquivo)
7. **Use `cascade: false`** em relações se não quiser deletar em cascata

## Links Úteis

- [JavaScript Migrations Docs](https://pocketbase.io/docs/js-migrations/)
- [Collections Docs](https://pocketbase.io/docs/collections/)
- [API Rules](https://pocketbase.io/docs/api-rules-and-filters/)
