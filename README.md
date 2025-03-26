This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, Run the following commands to download dependencies and config the Prisma database:

```bash
$ npm install
$ npx prisma generate
```

Now, run the development server:
```bash
npm run dev

```


By default, the frontend will run locally in http://localhost:3000 wich accesses the backend, available at: [https://github.com/Ayache-Ali/FrontendPaggo](https://github.com/Ayache-Ali/BackendPaggo).

The webpage prototype consists of a login page, requirig admin-set user and password, followed by an upload page, where the user can add new accounts to the database, as well as upload files to be displayed, have their text extracted, select between all of their uploaded files and, if a chat-GPT API key was inserted, request further explaining of said extracted text. After that, the user can download a .zip file containing the selected file, as well as the extracted text and the Chat-GPT explanation, if it was requested.
