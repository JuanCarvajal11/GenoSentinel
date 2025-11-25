"""
Data Transfer Objects (DTOs) para validación y transferencia de datos
"""

from genetics.dto.gene_dto import (
    GeneCreateDTO,
    GeneUpdateDTO,
    GeneResponseDTO
)

from genetics.dto.variant_dto import (
    VariantCreateDTO,
    VariantUpdateDTO,
    VariantResponseDTO
)

from genetics.dto.report_dto import (
    ReportCreateDTO,
    ReportUpdateDTO,
    ReportResponseDTO
)

__all__ = [
    'GeneCreateDTO',
    'GeneUpdateDTO',
    'GeneResponseDTO',
    'VariantCreateDTO',
    'VariantUpdateDTO',
    'VariantResponseDTO',
    'ReportCreateDTO',
    'ReportUpdateDTO',
    'ReportResponseDTO',
]