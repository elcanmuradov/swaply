FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Gradle wrapper and build files first so the wrapper jar is available
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
RUN chmod +x ./gradlew

# Then copy application source
COPY src src

RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
