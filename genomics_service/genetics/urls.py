from django.urls import path, include
from rest_framework.routers import DefaultRouter
from genetics.views import GeneViewSet, VariantViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'genes', GeneViewSet, basename='gene')
router.register(r'variants', VariantViewSet, basename='variant')
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]