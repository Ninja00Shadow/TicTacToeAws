# Tic Tac Toe web app

This is a simple Tic Tac Toe web application built with Django and React. The application allows two players to play the game against each other. It has a dockerized backend and frontend, making it easy to deploy and run in different environments.

Because the application was built for a university course, some infrastructure code is intentionally left in the repository. The local development mode runs without AWS, Cognito, S3 or RDS access.

![](screen-shots/img1.png)

## Features

- Real-time multiplayer game
- Multiple ways to deploy the application (EC2, Elastic Beanstalk, Fargate)
- Dockerized backend and frontend with docker-compose for local development
- Local username/password authentication for development
- AWS deployment configuration using Cognito for authentication and S3 for avatar storage
- Monitoring and logging using CloudWatch

## Local development

Copy `.env.example` to `.env` if you want to override local defaults:

```bash
docker compose up --build
```

Local defaults:

- Backend API: `http://localhost:8000`
- Frontend: `http://localhost`
- Auth mode: `local`
- Database: SQLite

AWS credentials and Cognito configuration are not required for local development.

## Backend

The backend is built with Django and Django Rest Framework and uses websockets for real-time communication between the players. The backend is responsible for managing the game state and handling player moves. It also uses sqlite as the database to store game data such as player names and game history.

## Frontend

The frontend is built with React. It provides a user-friendly interface for players to interact with the game. The frontend communicates with the backend using REST APIs and websockets.

## Deployment

The application can be deployed on AWS using Terraform. There are different deployment targets available, including EC2 instances, Elastic Beanstalk and Fargate. AWS deployment uses Cognito for authentication and S3 for avatar storage. AWS-specific values should be provided through environment files or deployment variables.
