from dataclasses import dataclass
from typing import Optional


@dataclass
class GeneCreateDTO:
    """DTO para crear un nuevo gen"""
    symbol: str
    full_name: Optional[str] = None
    function_summary: Optional[str] = None

    def validate(self):
        """Valida los datos del DTO"""
        errors = []
        
        if not self.symbol or len(self.symbol.strip()) == 0:
            errors.append("El símbolo del gen es requerido")
        
        if self.symbol and len(self.symbol) > 50:
            errors.append("El símbolo del gen no puede exceder 50 caracteres")
        
        if self.full_name and len(self.full_name) > 255:
            errors.append("El nombre completo no puede exceder 255 caracteres")
        
        return errors


@dataclass
class GeneUpdateDTO:
    """DTO para actualizar un gen existente"""
    symbol: Optional[str] = None
    full_name: Optional[str] = None
    function_summary: Optional[str] = None

    def validate(self):
        """Valida los datos del DTO"""
        errors = []
        
        if self.symbol is not None:
            if len(self.symbol.strip()) == 0:
                errors.append("El símbolo del gen no puede estar vacío")
            
            if len(self.symbol) > 50:
                errors.append("El símbolo del gen no puede exceder 50 caracteres")
        
        if self.full_name is not None and len(self.full_name) > 255:
            errors.append("El nombre completo no puede exceder 255 caracteres")
        
        return errors


@dataclass
class GeneResponseDTO:
    """DTO para respuestas de gen"""
    id: int
    symbol: str
    full_name: Optional[str]
    function_summary: Optional[str]

    @classmethod
    def from_model(cls, gene):
        """Crea un DTO desde un modelo Gene"""
        return cls(
            id=gene.id,
            symbol=gene.symbol,
            full_name=gene.full_name,
            function_summary=gene.function_summary
        )