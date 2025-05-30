import base64
import os
import json
import tempfile

# Lista de imagens para converter
ghost_images = {
    'blinky': ['red_up.png', 'red_down.png', 'red_left.png', 'red_right.png'],
    'pinky': ['pink_up.png', 'pink_down.png', 'pink_left.png', 'pink_right.png'],
    'inky': ['cyan_up.png', 'cyan_down.png', 'cyan_left.png', 'cyan_right.png'],
    'clyde': ['orange_up.png', 'orange_down.png', 'orange_left.png', 'orange_right.png'],
    'eyes': ['eyes_up.png', 'eyes_down.png', 'eyes_left.png', 'eyes_right.png'],
    'scared': ['scared.png']
}

# Pasta onde as imagens estão armazenadas
image_folder = "img/ghosts/"

# Resultado da conversão
base64_data = {}

# Converter cada imagem
for ghost, images in ghost_images.items():
    base64_data[ghost] = {}
    
    if ghost == 'scared':
        image = images[0]
        try:
            with open(f"{image_folder}{image}", "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
                base64_data[ghost]['imgDate'] = f"data:image/png;base64,{encoded_string}"
                print(f"Convertido: {image}")
        except FileNotFoundError:
            print(f"Arquivo não encontrado: {image_folder}{image}")
            base64_data[ghost]['imgDate'] = "" # Placeholder vazio
    else:
        for image in images:
            direction = image.split('_')[1].split('.')[0]  # Extrair 'up', 'down', etc.
            try:
                with open(f"{image_folder}{image}", "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
                    base64_data[ghost][direction] = f"data:image/png;base64,{encoded_string}"
                    print(f"Convertido: {image}")
            except FileNotFoundError:
                print(f"Arquivo não encontrado: {image_folder}{image}")
                base64_data[ghost][direction] = "" # Placeholder vazio

# Usar um arquivo temporário para o JSON intermediário
with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_json:
    json.dump(base64_data, temp_json, indent=2)
    temp_file_path = temp_json.name

# Gerar código TypeScript para constants.ts
ts_code = """
// Definição de GHOSTS com imagens em Base64
export const GHOSTS: {
	[key in GhostName | 'scared']: { [direction in 'up' | 'down' | 'left' | 'right']?: string } | { imgDate: string }
} = {
"""

for ghost, data in base64_data.items():
    ts_code += f"\t{ghost}: {{\n"
    
    if ghost == 'scared':
        ts_code += f"\t\timgDate: '{data['imgDate']}'\n"
    else:
        for direction, base64_string in data.items():
            ts_code += f"\t\t{direction}: '{base64_string}',\n"
    
    ts_code += "\t},\n"

ts_code += "};"

# Salvar o código TypeScript
with open("ghosts_constants.txt", "w") as ts_file:
    ts_file.write(ts_code)
    print("Código TypeScript salvo em ghosts_constants.txt")

# Remover o arquivo temporário após o uso
os.unlink(temp_file_path)

print("Concluído!")