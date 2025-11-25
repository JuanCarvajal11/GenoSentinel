"""
Repositorios para acceso a datos y operaciones de base de datos
"""

from genetics.repositories.gene_repository import GeneRepository
from genetics.repositories.variant_repository import VariantRepository
from genetics.repositories.report_repository import ReportRepository

__all__ = [
    'GeneRepository',
    'VariantRepository',
    'ReportRepository',
]