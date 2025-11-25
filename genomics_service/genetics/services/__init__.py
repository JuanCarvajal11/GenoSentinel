"""
Servicios de lógica de negocio
"""

from genetics.services.gene_service import GeneService
from genetics.services.variant_service import VariantService
from genetics.services.report_service import ReportService
from genetics.services.clinic_service import ClinicService

__all__ = [
    'GeneService',
    'VariantService',
    'ReportService',
    'ClinicService',
]