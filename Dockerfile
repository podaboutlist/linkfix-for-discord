FROM node:lts-alpine

LABEL org.opencontainers.image.title="LinkFix for Discord" \
      org.opencontainers.image.version="1.8.0" \
      org.opencontainers.image.description="LinkFix for Discord replies to messages containing URLS that don't embed properly (x.com, twitter.com, YouTube Shorts) with URLS that do (fxtwitter.com, youtu.be)." \
      org.opencontainers.image.authors="Lily Skye <me@suchipi.com>, Ralph <ralph@podaboutli.st>" \
      org.opencontainers.image.url="https://github.com/podaboutlist/linkfix-for-discord" \
      org.opencontainers.image.source="https://github.com/podaboutlist/linkfix-for-discord.git" \
      org.opencontainers.image.licenses="AGPL-3.0-or-later"

WORKDIR /app

# Install dependencies with NPM
COPY package*.json .
RUN [ "npm", "ci", "--omit=dev" ]

# Compile TypeScript
COPY . .
RUN [ "npm", "run", "build-prod" ]

# Fire 'er up!
CMD [ "node", "dist/index.js" ]
