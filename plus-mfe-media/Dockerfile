FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_MS_MEDIA_URL=http://localhost:3003
ARG VITE_MS_AUTH_URL=http://localhost:3001
ARG VITE_MEDIA_PUBLIC_BASE_URL=http://localhost:4566/plus-media
ARG VITE_MFE_AUTH_ORIGIN=http://localhost:4001
ENV VITE_MS_MEDIA_URL=$VITE_MS_MEDIA_URL
ENV VITE_MS_AUTH_URL=$VITE_MS_AUTH_URL
ENV VITE_MEDIA_PUBLIC_BASE_URL=$VITE_MEDIA_PUBLIC_BASE_URL
ENV VITE_MFE_AUTH_ORIGIN=$VITE_MFE_AUTH_ORIGIN
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g vite
COPY --from=build /app/dist ./dist
EXPOSE 4002
CMD ["vite", "preview", "--port", "4002", "--host"]
