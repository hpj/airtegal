FROM mcr.microsoft.com/playwright:focal

ENV CI="true"
ENV PATH="${PATH}:/app/node_modules/.bin"

# Install node and yarn

RUN npm install -g n yarn@1.22.17 --force

RUN n 16.14.0

# Setup app files and dependencies

WORKDIR /app
COPY . /app

RUN yarn