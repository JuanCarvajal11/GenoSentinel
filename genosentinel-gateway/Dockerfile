# File: Dockerfile
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
ARG JAR=target/genosentinel-gateway-0.0.1-SNAPSHOT.jar
COPY --from=builder /workspace/${JAR} /app/app.jar
EXPOSE 8080
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]