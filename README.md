<h1 align="center">Polls</h1>

<p align="center">
  <a href="#requisitos">Requisitos</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#configuração">Configuração</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#HTTP">Rotas</a>
</p>

Um sistema de votação em tempo real onde os usuários podem criar uma enquete e outros usuários podem lançar seus votos. O sistema gera uma classificação entre as opções e atualiza os votos em tempo real.

Desenvolvido no evento "NLW Expert" promovido pela [Rocketseat](www.rocketseat.com.br) durantes os dias 05 a 08/02 de de 2024.

![Cover](./.github/cover.png)

## Requisitos

- [NodeJs](https://nodejs.org)
- [Docker](https://www.docker.com/)

## Configuração

- Clone o repositório.
- Instale as dependências (`npm install`).
- Configure o PostgreSQL e o Redis (`docker compose up -d`).
- Copie o arquivo `.env.example` (`cp .env.example .env`).
- Execute a aplicação (`npm run dev`).
- Teste! (Recomendo testar pessoalmente com [Hoppscotch](https://hoppscotch.io/)).

## HTTP

### POST `/polls`

Crie uma nova enquete.

#### Corpo da requisição

```json
{
  "title": "Qual a melhor linguagem de programação?",
  "options": ["JavaScript", "Java", "PHP", "C#"]
}
```

#### Corpo da resposta

```json
{
  "pollId": "194cef63-2ccf-46a3-aad1-aa94b2bc89b0"
}
```

### GET `/polls/:pollId`

Retorna dados de uma única enquete.

#### Corpo da resposta

```json
{
  "poll": {
    "id": "e4365599-0205-4429-9808-ea1f94062a5f",
    "title": "Qual a melhor linguagem de programação?",
    "options": [
      {
        "id": "4af3fca1-91dc-4c2d-b6aa-897ad5042c84",
        "title": "JavaScript",
        "score": 1
      },
      {
        "id": "780b8e25-a40e-4301-ab32-77ebf8c79da8",
        "title": "Java",
        "score": 0
      },
      {
        "id": "539fa272-152b-478f-9f53-8472cddb7491",
        "title": "PHP",
        "score": 0
      },
      {
        "id": "ca1d4af3-347a-4d77-b08b-528b181fe80e",
        "title": "C#",
        "score": 0
      }
    ]
  }
}
```

### POST `/polls/:pollId/votes`

Adiciona um voto para um enquete especifica

#### Corpo da requisição

```json
{
  "pollOptionId": "31cca9dc-15da-44d4-ad7f-12b86610fe98"
}
```

## WebSockets

### ws `/polls/:pollId/results`

#### Mensagem de resposta

```json
{
  "pollOptionId": "da9601cc-0b58-4395-8865-113cbdc42089",
  "votes": 2
}
```
