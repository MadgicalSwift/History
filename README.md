#  History Quiz Bot

The History Quiz Bot is an interactive educational tool designed to help students understand historical concepts through engaging quizzes. The bot covers various topics, starting with "What is History?" for Class 6 students, and includes multiple-choice questions with explanations to reinforce learning.

The History Quiz Bot is a fun and educational way to encourage History Knowledge through interactive learning!

# Prerequisites
Before you begin, ensure you have met the following requirements:

* Node.js and npm installed
* Nest.js CLI installed (npm install -g @nestjs/cli)
* DynomoDB database accessible

## Getting Started
### Installation
* Fork the repository
Click the "Fork" button in the upper right corner of the repository page. This will create a copy of the repository under your GitHub account.


* Clone this repository:
```
https://github.com/MadgicalSwift/History.git
```
* Navigate to the Project Directory:
```
cd History
```
* Install Project Dependencies:
```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Add the following environment variables:

```bash
USERS_TABLE = user_table
REGION = region
ACCESS_KEY_ID = access_key_id
SECRET_ACCESS_KEY = secret_access_key
API_URL = api_url
BOT_ID = bot_id
API_KEY = api_key
```
# API Endpoints
```
POST /api/message: Endpoint for handling user requests. 
GET  /api/status: Endpoint for checking the status of  api
```
# folder structure

```bash
src/
    ├── app.controller.ts
    ├── app.module.ts
    ├── chat/
    │   ├── chat.service.ts
    │   └── chatbot.model.ts
    ├── common/
    │   ├── exceptions/
    │   │   ├── custom.exception.ts
    │   │   └── http-exception.filter.ts
    │   ├── middleware/
    │   │   ├── logger.help.ts
    │   │   └── logger.middleware.ts
    │   └── utils/
    │       └── date.service.ts
    ├── config/
    │   └── database-config.service.ts
    ├── datasource/
    │   └── NewData.json
    ├── i18n/
    │   ├── buttons/
    │   │   └── button.ts
        ├── en/
    │   │   └── localised-strings.ts
    │   └── hn/
    │       └── localised-strings.ts
    ├── intent/
    │   └── intent.classifier.ts
    ├── localization/
    │   ├── localization.service.ts
    │   └── localization.module.ts
    ├── message/
    │   ├── message.service.ts
    │   └── message.module.ts
    ├── mixpanel/
    │   ├── mixpanel.service.ts
    │   └── mixpanel.service.spec.ts
    ├── model/
    │   ├── user.entity.ts
    │   ├── user.module.ts
    │   └── user.service.ts
    ├── swiftchat/
    │   ├── swiftchat.module.ts
    │   └── swiftchat.service.ts
    ├── main.ts
    ├── app.controller.ts
    └── app.module.ts
```

# Link
* [Documentation](https://app.clickup.com/43312857/v/dc/199tpt-7824/199tpt-19527)

