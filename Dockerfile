FROM node
COPY package.json ./
RUN npm install express mysql bcrypt
RUN mkdir /app
WORKDIR /app
COPY ./ ./
EXPOSE 3000
CMD ["node","./server.js"]