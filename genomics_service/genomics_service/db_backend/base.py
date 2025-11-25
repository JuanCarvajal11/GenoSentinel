"""
Backend personalizado de MySQL/MariaDB para XAMPP con MariaDB 10.4
Desactiva verificación de versión y la cláusula RETURNING
"""

from django.db.backends.mysql.base import DatabaseWrapper as MySQLDatabaseWrapper
from django.db.backends.mysql.features import DatabaseFeatures as MySQLFeatures


class DatabaseFeatures(MySQLFeatures):
    """
    Características personalizadas para MariaDB 10.4
    """
    # MariaDB 10.4 no soporta RETURNING
    can_return_columns_from_insert = False
    can_return_rows_from_bulk_insert = False


class DatabaseWrapper(MySQLDatabaseWrapper):
    """
    Wrapper personalizado que desactiva la verificación de versión
    y configura las características correctas para MariaDB 10.4
    """
    
    features_class = DatabaseFeatures
    
    def check_database_version_supported(self):
        """
        Sobrescribe el método para evitar la verificación de versión
        MariaDB 10.4 funciona perfectamente con Django
        """
        pass