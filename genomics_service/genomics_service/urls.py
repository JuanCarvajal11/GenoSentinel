from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Genomics Microservice API",
        default_version='v1',
        description="""
        # Microservicio de Genómica
        
        Este microservicio proporciona funcionalidades para gestionar información genómica
        
        ## Características principales:
        
        ### 1. Gestión de Genes
        - CRUD completo de genes

        
        ### 2. Gestión de Variantes Genéticas
        - Registro de mutaciones específica
        
        ### 3. Gestión de Reportes de Pacientes
        - Asociar variantes genéticas a pacientes
        - Integración con microservicio de clínica
        - Consulta de información clínica del paciente
        
        ## Integración con Microservicio de Clínica
        
        El sistema valida automáticamente la existencia de pacientes mediante 
        el microservicio de clínica antes de crear reportes.
        
        ## Validación de Datos
        
        Todos los endpoints implementan validación mediante DTOs (Data Transfer Objects)
        para garantizar la integridad de los datos.
        """,
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@genomics.local"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('genoma/', include('genetics.urls')),
    
    # Swagger/OpenAPI URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', 
            schema_view.without_ui(cache_timeout=0), 
            name='schema-json'),
    path('swagger/', 
         schema_view.with_ui('swagger', cache_timeout=0), 
         name='schema-swagger-ui'),
    path('redoc/', 
         schema_view.with_ui('redoc', cache_timeout=0), 
         name='schema-redoc'),
    path('', 
         schema_view.with_ui('swagger', cache_timeout=0), 
         name='schema-swagger-ui-root'),
]