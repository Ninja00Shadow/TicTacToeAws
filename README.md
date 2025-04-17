# Tic Tac Toe web app

This is a simple Tic Tac Toe web application built with django and React. The application allows two players to play the game against each other. It has a dockerized backend and frontend, making it easy to deploy and run in different environments.

Because the application was built for a university course, code is disorganized and not well-structured. Some parts build in the beggining may not work. The goal of this project is to demonstrate the use of AWS and Terraform.

## Features
- Real-time multiplayer game
- Multiple ways to deploy the application (EC2, Elastic Beanstalk, Fargate)
- Dockerized backend and frontend with docker-compose for local development
- User authentication using Cognito
- Player avatars using S3
- Monitoring and logging using CloudWatch

## Backend

The backend is built with Django and Django Rest Framework and uses websockets for real-time communication between the players. The backend is responsible for managing the game state and handling player moves. It also uses sqlite as the database to store game data such as player names and game history.

## Frontend

The frontend is built with React. It provides a user-friendly interface for players to interact with the game. The frontend communicates with the backend using REST APIs and websockets.

## Deployment

The application can be deployed on AWS using Terraform. There are different types of deployment options available, including EC2 instances, Elastic Beanstalk and Fargate. There is also a docker-compose file for local development and testing.