# =====================================================
# AŞAMA 1: BUILD (React Uygulamasını Derleme)
# =====================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 1. package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# 2. Bağımlılıkları yükle
RUN npm ci || npm install

# 3. Tüm kaynak kodları kopyala
COPY . .

# 4. Uygulamayı production modunda build et
RUN npm run build

# =====================================================
# AŞAMA 2: SERVE (Nginx ile Statik Dosyaları Sunma)
# =====================================================
FROM nginx:alpine

# Nginx konfigürasyon dosyasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build aşamasından oluşan statik dosyaları Nginx klasörüne kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx'in dinlediği port
EXPOSE 80
EXPOSE 443

# Nginx'i foreground modda çalıştır
CMD ["nginx", "-g", "daemon off;"]
