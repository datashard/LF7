FROM denoland/deno:alpine as base

WORKDIR /app

COPY . ./

RUN deno cache index.ts

CMD ["run", "--allow-all", "index.ts"]