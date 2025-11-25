from django.db import transaction
from genetics.models import GeneticVariant, PatientVariantReport
from genetics.dto.report_dto import ReportCreateDTO, ReportUpdateDTO, ReportResponseDTO
from genetics.services.clinic_service import ClinicService
from rest_framework.exceptions import ValidationError, NotFound
from datetime import date


class ReportService:
    """Servicio para gestión de reportes de variantes de pacientes"""
    
    def __init__(self):
        self.clinic_service = ClinicService()
    
    def create_report(self, dto: ReportCreateDTO) -> ReportResponseDTO:
        """Crea un nuevo reporte de variante del paciente"""
        errors = dto.validate()
        if errors:
            raise ValidationError({'errors': errors})
        
        # Validar que la variante exista
        try:
            variant = GeneticVariant.objects.select_related('gene').get(pk=dto.variant_id)
        except GeneticVariant.DoesNotExist:
            raise ValidationError({'variant_id': 'La variante especificada no existe'})
        
        # Validar que el paciente exista en el microservicio de clínica
        if not self.clinic_service.validate_patient_exists(dto.patient_id):
            raise ValidationError({
                'patient_id': 'El paciente especificado no existe en el sistema de clínica'
            })
            
        with transaction.atomic():
            report = PatientVariantReport.objects.create(
                patient_id=dto.patient_id.strip(),
                variant=variant,
                detection_date=date.fromisoformat(dto.detection_date),
                allele_frequency=dto.allele_frequency
            )
        
        # Obtener datos del paciente para el response
        patient_data = self.clinic_service.get_patient_info(dto.patient_id)
        
        return ReportResponseDTO.from_model(report, patient_data)
    
    def update_report(self, report_id: str, dto: ReportUpdateDTO) -> ReportResponseDTO:
        """Actualiza un reporte existente"""
        errors = dto.validate()
        if errors:
            raise ValidationError({'errors': errors})
        
        try:
            report = PatientVariantReport.objects.select_related(
                'variant__gene'
            ).get(pk=report_id)
        except PatientVariantReport.DoesNotExist:
            raise NotFound('Reporte no encontrado')
        
        with transaction.atomic():
            if dto.detection_date is not None:
                report.detection_date = date.fromisoformat(dto.detection_date)
            if dto.allele_frequency is not None:
                report.allele_frequency = dto.allele_frequency
            
            report.save()
        
        # Obtener datos del paciente para el response
        patient_data = self.clinic_service.get_patient_info(report.patient_id)
        
        return ReportResponseDTO.from_model(report, patient_data)
    
    def get_report(self, report_id: str) -> ReportResponseDTO:
        """Obtiene un reporte por ID"""
        try:
            report = PatientVariantReport.objects.select_related(
                'variant__gene'
            ).get(pk=report_id)
            
            # Obtener datos del paciente
            patient_data = self.clinic_service.get_patient_info(report.patient_id)
            
            return ReportResponseDTO.from_model(report, patient_data)
        except PatientVariantReport.DoesNotExist:
            raise NotFound('Reporte no encontrado')
    
    def list_reports(self, filters=None):
        """Lista todos los reportes con filtros opcionales"""
        queryset = PatientVariantReport.objects.select_related(
            'variant__gene'
        ).all()
        
        if filters:
            if 'patient_id' in filters:
                queryset = queryset.filter(patient_id=filters['patient_id'])
            if 'variant_id' in filters:
                queryset = queryset.filter(variant_id=filters['variant_id'])
            if 'gene_id' in filters:
                queryset = queryset.filter(variant__gene_id=filters['gene_id'])
            if 'detection_date_from' in filters:
                queryset = queryset.filter(
                    detection_date__gte=filters['detection_date_from']
                )
            if 'detection_date_to' in filters:
                queryset = queryset.filter(
                    detection_date__lte=filters['detection_date_to']
                )
        
        return queryset
    
    def delete_report(self, report_id: str):
        """Elimina un reporte"""
        try:
            report = PatientVariantReport.objects.get(pk=report_id)
            with transaction.atomic():
                report.delete()
        except PatientVariantReport.DoesNotExist:
            raise NotFound('Reporte no encontrado')
    
    def get_patient_reports(self, patient_id: str):
        """Obtiene todos los reportes de un paciente específico"""
        # Validar que el paciente existe
        if not self.clinic_service.validate_patient_exists(patient_id):
            raise ValidationError({
                'patient_id': 'El paciente especificado no existe en el sistema de clínica'
            })
        
        return PatientVariantReport.objects.select_related(
            'variant__gene'
        ).filter(patient_id=patient_id)
    
    def enrich_reports_with_patient_data(self, reports):
        """Enriquece una lista de reportes con datos de pacientes"""
        # Obtener IDs únicos de pacientes
        patient_ids = list(set([str(report.patient_id) for report in reports]))
        
        # Obtener datos de pacientes en lote
        patients_data = self.clinic_service.get_patients_batch(patient_ids)
        
        # Crear DTOs con datos enriquecidos
        result = []
        for report in reports:
            patient_data = patients_data.get(str(report.patient_id))
            result.append(ReportResponseDTO.from_model(report, patient_data))
        
        return result