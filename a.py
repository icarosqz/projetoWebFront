import os
import json

IGNORAR = {"node_modules", ".next", ".git"}

def listar_estrutura(caminho):
    estrutura = {}
    for item in os.listdir(caminho):
        if item in IGNORAR:
            continue
        item_path = os.path.join(caminho, item)
        if os.path.isdir(item_path):
            estrutura[item] = listar_estrutura(item_path)
        else:
            estrutura[item] = "arquivo"
    return estrutura

if __name__ == "__main__":
    pasta_base = "."
    estrutura = listar_estrutura(pasta_base)
    print(json.dumps(estrutura, indent=4, ensure_ascii=False))
