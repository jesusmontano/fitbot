# FitBot

A Slackbot with the aim of getting people to exercise.

The FitBot service can be run locally using SQLite and PostgreSQL (requires a docker instance to be started), and is also preconfigured to run on Heroku.

## Configuration

Edit the file `data/config.json` to configure FitBot. You can do the following:

* Add/remove exercises
* Change the next exercise delay
* Add/remove the congratulation messages
* Change the minimum size of the exercise user group

Changes to the the config file are picked up without restarting the service.

## How to configure Slack

//TODO add info here

## How to run FitBot locally

Add a `.env` file in the project dir containing the following values filled out:

```bash
# select one of the following NODE_ENV
NODE_ENV=local-sqlite
NODE_ENV=local-postgres

SLACK_SIGNING_SECRET=
SLACK_BOT_TOKEN=
SLACK_CHANNEL_ID=
SLACK_BOT_ID=
```

Install Node.js:

```bash
nvm use
npm i
```

Run a database migration (choose the one specified in the `.env` file):

SQLite:

```bash
npm run db:migrate local-sqlite
```

Postgres:

```bash
docker/start-stack.sh
npm run db:migrate local-postgres
```

Install and run `ngrok` on port 3000:

```bash
brew install ngrok
ngrok http 3000
```

Start the service:

```bash
npm run dev
```

## How to run FitBot in production

Add the following env variables with correct details filled out:

```bash
NODE_ENV=production
SLACK_SIGNING_SECRET=
SLACK_BOT_TOKEN=
SLACK_CHANNEL_ID=
SLACK_BOT_ID=
DATABASE_URL=postgres://your-postgres-instance
```

Start the service:

```bash
npm run compile
npm run db:migrate production
npm run start
```

## Notes:

* To remove the PostgreSQL docker instance, run the following command:

```bash
docker/remove-and-clear-db.sh
```
* To run FitBot on Heroku, add the following env variables:

```bash
PGSSLMODE=require
PGSSLMODE=no-verify
```
* The `heroku-postbuild` step will compile typescript and run db migrate.
* The `start` step will be triggered by heroku.

by Jesus Montano & Jim Redfern
