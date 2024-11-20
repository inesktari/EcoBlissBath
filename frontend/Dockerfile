FROM node:18
WORKDIR /frontend
RUN npm install -g @angular/cli
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# RUN npm install
EXPOSE 80
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "8080"]
