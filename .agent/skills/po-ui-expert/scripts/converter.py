import sys
import re

def sql_to_po_component(sql_type):
    """
    Mapeia tipos de dados SQL para componentes PO-UI recomendados.
    """
    sql_type = sql_type.lower()
    
    if 'date' in sql_type or 'datetime' in sql_type:
        return 'po-datepicker'
    if 'int' in sql_type or 'decimal' in sql_type or 'float' in sql_type:
        return 'po-number'
    if 'varchar' in sql_type or 'char' in sql_type:
        length_match = re.search(r'\((\d+)\)', sql_type)
        if length_match:
            length = int(length_match.group(1))
            if length == 1:
                return 'po-checkbox' # Assumindo boolean/flag
            if length > 255:
                return 'po-textarea'
        return 'po-input'
    if 'text' in sql_type:
        return 'po-textarea'
    
    return 'po-input'

def generate_dynamic_fields_from_sql(sql_content):
    """
    Extrai definições de colunas de um comando CREATE TABLE e gera o metadado PO-UI.
    """
    fields = []
    # Regex simples para capturar "campo tipo"
    matches = re.finditer(r'([a-zA-Z0-9_]+)\s+([a-zA-Z]+\(?\d*\)?)\s*(?:NOT NULL|DEFAULT|PRIMARY KEY|,)', sql_content)
    
    for match in matches:
        prop = match.group(1).lower()
        sql_type = match.group(2)
        po_comp = sql_to_po_component(sql_type)
        
        label = prop.replace('_', ' ').title()
        
        fields.append({
            'property': prop,
            'label': label,
            'component': po_comp
        })
    
    return fields

if __name__ == "__main__":
    # Exemplo rápido para teste manual
    if len(sys.argv) > 1:
        print(f"Sugestão para '{sys.argv[1]}': {sql_to_po_component(sys.argv[1])}")
    else:
        print("Uso: python converter.py 'VARCHAR(50)'")
