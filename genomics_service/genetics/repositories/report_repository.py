from typing import Optional, List
from uuid import UUID
from datetime import date
from decimal import Decimal
from genetics.models import GeneticVariant, PatientVariantReport
from django.db.models import Q


class ReportRepository:
    """Repositorio para operaciones de acceso a datos de reportes de pacientes"""
    
    @staticmethod
    def create(patient_id: UUID, variant: GeneticVariant,
               detection_date: date,
               allele_frequency: Optional[Decimal] = None) -> PatientVariantReport:
        """
        Crea un nuevo reporte de variante del paciente
        
        Args:
            patient_id: UUID del paciente
            variant: Instancia de la variante genética
            detection_date: Fecha de detección
            allele_frequency: Frecuencia alélica
            
        Returns:
            PatientVariantReport: Instancia del reporte creado
        """
        report = PatientVariantReport.objects.create(
            patient_id=patient_id,
            variant=variant,
            detection_date=detection_date,
            allele_frequency=allele_frequency
        )
        return report
    
    @staticmethod
    def find_by_id(report_id: str) -> Optional[PatientVariantReport]:
        """
        Busca un reporte por su ID
        
        Args:
            report_id: UUID del reporte
            
        Returns:
            PatientVariantReport o None si no existe
        """
        try:
            return PatientVariantReport.objects.select_related(
                'variant__gene'
            ).get(pk=report_id)
        except PatientVariantReport.DoesNotExist:
            return None
    
    @staticmethod
    def find_all() -> List[PatientVariantReport]:
        """
        Obtiene todos los reportes
        
        Returns:
            Lista de reportes
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).all())
    
    @staticmethod
    def find_by_patient(patient_id: UUID) -> List[PatientVariantReport]:
        """
        Busca reportes por ID de paciente
        
        Args:
            patient_id: UUID del paciente
            
        Returns:
            Lista de reportes del paciente
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(patient_id=patient_id))
    
    @staticmethod
    def find_by_variant(variant: GeneticVariant) -> List[PatientVariantReport]:
        """
        Busca reportes por variante
        
        Args:
            variant: Instancia de la variante genética
            
        Returns:
            Lista de reportes con esa variante
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(variant=variant))
    
    @staticmethod
    def find_by_variant_id(variant_id: str) -> List[PatientVariantReport]:
        """
        Busca reportes por ID de variante
        
        Args:
            variant_id: UUID de la variante
            
        Returns:
            Lista de reportes con esa variante
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(variant_id=variant_id))
    
    @staticmethod
    def find_by_patient_and_variant(patient_id: UUID, 
                                    variant_id: str) -> List[PatientVariantReport]:
        """
        Busca reportes por paciente y variante
        
        Args:
            patient_id: UUID del paciente
            variant_id: UUID de la variante
            
        Returns:
            Lista de reportes que coinciden
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(patient_id=patient_id, variant_id=variant_id))
    
    @staticmethod
    def find_by_gene(gene_id: int) -> List[PatientVariantReport]:
        """
        Busca reportes por gen
        
        Args:
            gene_id: ID del gen
            
        Returns:
            Lista de reportes con variantes del gen especificado
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(variant__gene_id=gene_id))
    
    @staticmethod
    def find_by_date_range(start_date: date, end_date: date) -> List[PatientVariantReport]:
        """
        Busca reportes en un rango de fechas
        
        Args:
            start_date: Fecha inicial
            end_date: Fecha final
            
        Returns:
            Lista de reportes en el rango
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(detection_date__gte=start_date, detection_date__lte=end_date))
    
    @staticmethod
    def find_by_patient_and_date_range(patient_id: UUID, 
                                       start_date: date,
                                       end_date: date) -> List[PatientVariantReport]:
        """
        Busca reportes de un paciente en un rango de fechas
        
        Args:
            patient_id: UUID del paciente
            start_date: Fecha inicial
            end_date: Fecha final
            
        Returns:
            Lista de reportes que coinciden
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(
            patient_id=patient_id,
            detection_date__gte=start_date,
            detection_date__lte=end_date
        ))
    
    @staticmethod
    def find_by_impact(impact: str) -> List[PatientVariantReport]:
        """
        Busca reportes por tipo de impacto de la variante
        
        Args:
            impact: Tipo de impacto
            
        Returns:
            Lista de reportes con variantes del impacto especificado
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(variant__impact=impact))
    
    @staticmethod
    def find_by_patient_and_impact(patient_id: UUID, impact: str) -> List[PatientVariantReport]:
        """
        Busca reportes de un paciente con impacto específico
        
        Args:
            patient_id: UUID del paciente
            impact: Tipo de impacto
            
        Returns:
            Lista de reportes que coinciden
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(patient_id=patient_id, variant__impact=impact))
    
    @staticmethod
    def find_recent_by_patient(patient_id: UUID, limit: int = 10) -> List[PatientVariantReport]:
        """
        Busca los reportes más recientes de un paciente
        
        Args:
            patient_id: UUID del paciente
            limit: Número máximo de reportes a retornar
            
        Returns:
            Lista de reportes más recientes
        """
        return list(PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(patient_id=patient_id).order_by('-detection_date')[:limit])
    
    @staticmethod
    def update(report: PatientVariantReport,
               detection_date: Optional[date] = None,
               allele_frequency: Optional[Decimal] = None) -> PatientVariantReport:
        """
        Actualiza un reporte existente
        
        Args:
            report: Instancia del reporte a actualizar
            detection_date: Nueva fecha de detección (opcional)
            allele_frequency: Nueva frecuencia alélica (opcional)
            
        Returns:
            PatientVariantReport: Instancia actualizada
        """
        if detection_date is not None:
            report.detection_date = detection_date
        if allele_frequency is not None:
            report.allele_frequency = allele_frequency
        
        report.save()
        return report
    
    @staticmethod
    def delete(report: PatientVariantReport) -> None:
        """
        Elimina un reporte
        
        Args:
            report: Instancia del reporte a eliminar
        """
        report.delete()
    
    @staticmethod
    def delete_by_id(report_id: str) -> bool:
        """
        Elimina un reporte por su ID
        
        Args:
            report_id: UUID del reporte
            
        Returns:
            bool: True si se eliminó, False si no existía
        """
        deleted, _ = PatientVariantReport.objects.filter(pk=report_id).delete()
        return deleted > 0
    
    @staticmethod
    def delete_by_patient(patient_id: UUID) -> int:
        """
        Elimina todos los reportes de un paciente
        
        Args:
            patient_id: UUID del paciente
            
        Returns:
            int: Número de reportes eliminados
        """
        deleted, _ = PatientVariantReport.objects.filter(patient_id=patient_id).delete()
        return deleted
    
    @staticmethod
    def count() -> int:
        """
        Cuenta el número total de reportes
        
        Returns:
            int: Número de reportes
        """
        return PatientVariantReport.objects.count()
    
    @staticmethod
    def count_by_patient(patient_id: UUID) -> int:
        """
        Cuenta reportes de un paciente específico
        
        Args:
            patient_id: UUID del paciente
            
        Returns:
            int: Número de reportes del paciente
        """
        return PatientVariantReport.objects.filter(patient_id=patient_id).count()
    
    @staticmethod
    def count_by_variant(variant_id: str) -> int:
        """
        Cuenta reportes de una variante específica
        
        Args:
            variant_id: UUID de la variante
            
        Returns:
            int: Número de reportes con esa variante
        """
        return PatientVariantReport.objects.filter(variant_id=variant_id).count()
    
    @staticmethod
    def count_by_gene(gene_id: int) -> int:
        """
        Cuenta reportes por gen
        
        Args:
            gene_id: ID del gen
            
        Returns:
            int: Número de reportes con variantes del gen
        """
        return PatientVariantReport.objects.filter(variant__gene_id=gene_id).count()
    
    @staticmethod
    def get_unique_patient_ids() -> List[UUID]:
        """
        Obtiene lista de IDs únicos de pacientes con reportes
        
        Returns:
            Lista de UUIDs de pacientes
        """
        return list(PatientVariantReport.objects.values_list(
            'patient_id', flat=True
        ).distinct())
    
    @staticmethod
    def paginate(page: int = 1, page_size: int = 10):
        """
        Obtiene reportes paginados
        
        Args:
            page: Número de página (1-indexed)
            page_size: Tamaño de página
            
        Returns:
            QuerySet: Reportes de la página especificada
        """
        start = (page - 1) * page_size
        end = start + page_size
        return PatientVariantReport.objects.select_related(
            'variant__gene'
        ).all()[start:end]