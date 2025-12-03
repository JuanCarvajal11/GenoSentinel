import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class ClinicService:
    """Servicio para comunicación con el microservicio de clínica"""
    
    def __init__(self):
        self.base_url = settings.CLINIC_SERVICE_URL
        self.timeout = 10  # segundos

    def fetch_patient(self, patient_id):
        """
        Obtiene información de un paciente o None si no existe o hay error.
        
        Args:
            patient_id: UUID del paciente
            
        Returns:
            dict | None: Datos del paciente o None
        """
        try:
            url = f"{self.base_url}/clinica/patients/{patient_id}"
            response = requests.get(url, timeout=self.timeout)

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                logger.warning(f"Paciente {patient_id} no encontrado en el servicio de clínica")
            else:
                logger.error(f"Error al obtener paciente {patient_id}: {response.status_code}")

        except requests.exceptions.Timeout:
            logger.error(f"Timeout al consultar paciente {patient_id}")
        except requests.exceptions.ConnectionError:
            logger.error(f"Error de conexión con el servicio de clínica para paciente {patient_id}")
        except Exception as e:
            logger.error(f"Error inesperado al consultar paciente {patient_id}: {str(e)}")
        
        return None

    def patient_exists(self, patient_id):
        """Verifica si el paciente existe"""
        return self.fetch_patient(patient_id) is not None

    def fetch_patients_batch(self, patient_ids):
        """
        Obtiene información de múltiples pacientes en lote.
        
        Args:
            patient_ids: lista de UUIDs de pacientes
            
        Returns:
            dict: {patient_id: datos} solo de los pacientes encontrados
        """
        result = {}
        for pid in patient_ids:
            data = self.fetch_patient(pid)
            if data:
                result[str(pid)] = data
        return result
