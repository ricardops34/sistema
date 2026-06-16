# Endpoints — Módulo de Pessoas

Todos os endpoints abaixo requerem autenticação via `Authorization: Bearer <accessToken>`.

---

## POST /people

Cria uma nova pessoa no tenant.

**Body:**
```json
{
  "nameLegal": "Maria Silva",
  "nameSocial": "Maria",
  "birthDate": "1990-01-15",
  "gender": "F",
  "notes": "Colaboradora desde 2020"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "internalCode": "PABC1-001000",
  "nameLegal": "Maria Silva",
  "isActive": true,
  "createdAt": "2026-06-16T..."
}
```

**Response 409 (duplicidade bloqueada):**
```json
{
  "statusCode": 409,
  "message": {
    "message": "Duplicidade detectada conforme política do tenant",
    "duplicates": [...]
  }
}
```

---

## GET /people

Lista pessoas do tenant (paginado).

**Query params:** `page` (default 1), `limit` (default 20)

**Response 200:**
```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

## GET /people/:id

Retorna uma pessoa pelo ID.

---

## PATCH /people/:id

Atualiza parcialmente uma pessoa.

---

## POST /people-requests

Cria solicitação de atualização cadastral (portal externo).

**Body:**
```json
{
  "personId": "uuid",
  "payload": {
    "nameLegal": "Maria Silva Atualizada",
    "notes": "Atualização via portal"
  }
}
```

**Response 201:** Retorna o registro da solicitação com `status: "pending"`.

---

## GET /people-metadata

Retorna a metadata configurável do tenant para o cadastro de pessoas.

**Response 200:**
```json
{
  "documentTypes": [],
  "contextCodeTypes": [],
  "fieldRules": [],
  "policy": {
    "requireDocument": false,
    "duplicateCheckMode": "alert"
  }
}
```

---

## PUT /people-metadata/policy

Atualiza a política do cadastro de pessoas.

## PUT /people-metadata/document-types

Atualiza os tipos de documentos aceitos.

## PUT /people-metadata/context-code-types

Atualiza os tipos de código por contexto.
