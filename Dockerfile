FROM node:25-alpine AS build

WORKDIR /app

RUN npm install --global pnpm@11.1.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Vite substitutes import.meta.env at build time, so the API and WebSocket
# origins are compiled into the bundle and cannot be changed afterwards: an
# image is built for one deployment. Both are the site's own origin when the
# frontend and the API are served from the same host, which is the arrangement
# the auth cookies assume.
ARG PUBLIC_ASKIT_SERVER_URL
ARG PUBLIC_ASKIT_WEBSOCKET_URL
ENV PUBLIC_ASKIT_SERVER_URL=${PUBLIC_ASKIT_SERVER_URL}
ENV PUBLIC_ASKIT_WEBSOCKET_URL=${PUBLIC_ASKIT_WEBSOCKET_URL}

RUN test -n "$PUBLIC_ASKIT_SERVER_URL" \
    || (echo "PUBLIC_ASKIT_SERVER_URL build argument is required" && exit 1)
RUN test -n "$PUBLIC_ASKIT_WEBSOCKET_URL" \
    || (echo "PUBLIC_ASKIT_WEBSOCKET_URL build argument is required" && exit 1)

RUN pnpm build


# The unprivileged variant runs as a non-root user, which cannot bind a port
# below 1024, hence 8000 rather than 80.
FROM nginxinc/nginx-unprivileged:alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget --spider -q http://127.0.0.1:8000/ || exit 1
