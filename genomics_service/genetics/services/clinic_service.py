import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class ClinicService:
    """Servicio para comunicación con el microservicio de clínica"""
    
    def __init__(self):
        self.base_url = settings.CLINIC_SERVICE_URL
        self.timeout = 10  # segundos
    
    def get_patient_info(self, patient_id):
        """
        Obtiene información del paciente desde el microservicio de clínica
        
        Args:
            patient_id: UUID del paciente
            
        Returns:
            dict: Datos del paciente o None si no se encuentra
        """
        try:
            url = f"{self.base_url}/patients/{patient_id}"
            response = requests.get(url, timeout=self.timeout)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                logger.warning(f"Paciente {patient_id} no encontrado en el servicio de clínica")
                return None
            else:
                logger.error(f"Error al obtener paciente {patient_id}: {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            logger.error(f"Timeout al consultar paciente {patient_id}")
            return None
        except requests.exceptions.ConnectionError:
            logger.error(f"Error de conexión con el servicio de clínica para paciente {patient_id}")
            return None
        except Exception as e:
            logger.error(f"Error inesperado al consultar paciente {patient_id}: {str(e)}")
            return None
    
    def validate_patient_exists(self, patient_id):
        """
        Valida si un paciente existe en el microservicio de clínica
        
        Args:
            patient_id: UUID del paciente
            
        Returns:
            bool: True si el paciente existe, False en caso contrario
        """
        patient_info = self.get_patient_info(patient_id)
        return patient_info is not None
    
    def get_patients_batch(self, patient_ids):
        """
        Obtiene información de múltiples pacientes en lote
        
        Args:
            patient_ids: Lista de UUIDs de pacientes
            
        Returns:
            dict: Diccionario con patient_id como clave y datos como valor
        """
        result = {}
        
        for patient_id in patient_ids:
            patient_data = self.get_patient_info(patient_id)
            if patient_data:
                result[str(patient_id)] = patient_data
        
        return result