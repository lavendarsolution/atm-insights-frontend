FROM node:20-alpine as builder

WORKDIR /app

COPY . .

RUN npm ci 

ENV $(cat .env | xargs)

# Build the app
RUN npm run build
# ==== RUN =======

# Bundle static assets with nginx
FROM nginx:alpine as production
ENV NODE_ENV production
# Copy built assets from `builder` image
COPY --from=builder /app/dist /usr/share/nginx/html
# Add your nginx.conf
COPY ./pipeline/nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 9090
# Start nginx
CMD ["nginx", "-g", "daemon off;"]