from dataclasses import dataclass
from typing import Optional
from datetime import date
from decimal import Decimal


@dataclass
class ReportCreateDTO:
    """DTO para crear un nuevo reporte de variante del paciente"""
    patient_id: str
    variant_id: str
    detection_date: str  # formato: YYYY-MM-DD
    allele_frequency: Optional[float] = None

    def validate(self):
        """Valida los datos del DTO"""
        errors = []
        
        if not self.patient_id or len(self.patient_id.strip()) == 0:
            errors.append("El ID del paciente es requerido")
        
        if not self.variant_id or len(self.variant_id.strip()) == 0:
            errors.append("El ID de la variante es requerido")
        
        if not self.detection_date:
            errors.append("La fecha de detección es requerida")
        else:
            try:
                date.fromisoformat(self.detection_date)
            except ValueError:
                errors.append("La fecha de detección debe estar en formato YYYY-MM-DD")
        
        if self.allele_frequency is not None:
            if self.allele_frequency < 0 or self.allele_frequency > 100:
                errors.append("La frecuencia alélica debe estar entre 0 y 100")
        
        return errors


@dataclass
class ReportUpdateDTO:
    """DTO para actualizar un reporte de variante del paciente"""
    detection_date: Optional[str] = None
    allele_frequency: Optional[float] = None

    def validate(self):
        """Valida los datos del DTO"""
        errors = []
        
        if self.detection_date is not None:
            try:
                date.fromisoformat(self.detection_date)
            except ValueError:
                errors.append("La fecha de detección debe estar en formato YYYY-MM-DD")
        
        if self.allele_frequency is not None:
            if self.allele_frequency < 0 or self.allele_frequency > 100:
                errors.append("La frecuencia alélica debe estar entre 0 y 100")
        
        return errors


@dataclass
class ReportResponseDTO:
    """DTO para respuestas de reporte de variante del paciente"""
    id: str
    patient_id: str
    patient_name: Optional[str]
    variant_id: str
    gene_symbol: str
    chromosome: Optional[str]
    position: Optional[int]
    impact: str
    detection_date: str
    allele_frequency: Optional[float]

    @classmethod
    def from_model(cls, report, patient_data=None):
        """Crea un DTO desde un modelo PatientVariantReport"""
        return cls(
            id=str(report.id),
            patient_id=str(report.patient_id),
            patient_name=patient_data.get('name') if patient_data else None,
            variant_id=str(report.variant.id),
            gene_symbol=report.variant.gene.symbol,
            chromosome=report.variant.chromosome,
            position=report.variant.position,
            impact=report.variant.impact,
            detection_date=report.detection_date.isoformat(),
            allele_frequency=float(report.allele_frequency) if report.allele_frequency else None
        )