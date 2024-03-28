# ft_transcendence

## Table of Contents
- [Overview](#overview)
- [Screenshots](#screenshots)
- [Technologies](#technologies)
- [Requirements](#requirements)
- [Build](#build)
- [Usage](#usage)
- [Lisence](#lisence)

## Overview

`ft_transcendence` is a browser-based platform that brings the classic game of Pong into the online realm with modern features. It offers real-time multiplayer gameplay, integrated chatting functionalities, direct and public chats, one-to-one game invites, random queuing and spectating ongoing games.

## Screenshots

![](/images/Screen%20Shot%202024-03-27%20at%208.52.59%20PM.png)

![](/images/Screen%20Shot%202024-03-27%20at%208.53.34%20PM.png)

![](/images/Screen%20Shot%202024-03-27%20at%208.48.22%20PM.png)

![](/images/Screen%20Shot%202024-03-27%20at%208.48.35%20PM.png)

![](/images/Screen%20Shot%202024-03-27%20at%208.48.52%20PM.png)

![](/images/Screen%20Shot%202024-03-27%20at%208.49.10%20PM.png)

![](/images/Screen%20Shot%202024-03-27%20at%208.49.21%20PM.png)

![](/images/Screen%20Shot%202024-03-27%20at%208.49.36%20PM.png)

## Technologies

This project is fully built in TypeScript, along side some really wonderfull open source solutions:

- Vuejs
    - Tailwind
    - Lucide
    - Konva

- Nestjs
    - Socket.io
    - Swagger
    - Matterjs
    - Typeorm

- Postgress

## Requirements

Since this project is fully dockerized you don't really need anything except docker.

## Setup

Before building this project for production or start it in development mode, you need first to setup the environments needed for this project to function properly.
move the `.env.example` to `.env` and fill all the environment variables with coresponding values.

## Development

To run this project in development mode run the follow command.

```sh
docker compose up --build
```

Now you can access your develpment environment by going to `localhost:3000`.

## Building for production

To build this project for production, cd into `prod` directory and run the following command.

```sh
docker compose up -d --build
```

After this, you access the build from `localhost:3000`.

## Lisence

This project is licensed under MIT license. See the LICENSE file for details.
