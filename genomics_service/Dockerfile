# Usar imagen base de Python
FROM python:3.11-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para mysqlclient
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    pkg-config \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivo de requisitos
COPY requeriments.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requeriments.txt

# Copiar el código de la aplicación
COPY . .

# Exponerse el puerto
EXPOSE 8000

# Variables de entorno
ENV DJANGO_SETTINGS_MODULE=genomics_service.settings
ENV PYTHONUNBUFFERED=1

# Comando para ejecutar la aplicación con Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "genomics_service.wsgi:application"]
