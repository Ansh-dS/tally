# 1. Use a lightweight, official Node.js image
FROM node:lts-alpine AS builder

# 2. Set the working directory inside the container
WORKDIR /tally

# Installing pnpm stable version 9. 
RUN corepack enable && corepack prepare pnpm@9 --activate

# 3. Copy only the package files first to cache dependencies locally
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# 4. Install all dependencies: used 'pnpm conifg' too, as pnpm not letting bcrpt and prisma, running at backend.
RUN pnpm install

# 5. Copy the rest of your application code into the container
COPY . .

# 6. Generate Prisma Client (REQUIRED before building Next.js)
RUN pnpm db:generate

# 7. Compile the Next.js application for production
RUN pnpm build

# 8. Expose the port Next.js runs on
EXPOSE 3000

# 9. Set the default launch command for the web container
CMD ["pnpm", "start"]