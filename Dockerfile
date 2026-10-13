FROM node:22-alpine AS build
WORKDIR /app
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm --prefix backend ci --omit=dev && npm --prefix frontend ci --legacy-peer-deps
COPY backend ./backend
COPY frontend ./frontend
COPY db.sql ./db.sql
RUN npm --prefix frontend run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/db.sql ./db.sql
USER node
CMD ["sh", "-c", "node backend/setup.js && node backend/server.js"]
