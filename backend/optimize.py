import pulp
import json
import sys
import time

start_time = time.time()

# ======================================================================
# 0. LEER NÚMERO DE PERSONAS DESDE STDIN
# ======================================================================
_raw = sys.stdin.read().strip()
_body = json.loads(_raw) if _raw else {}
_params = _body.get("params", _body)

_DEFAULTS = {
    "pequena": {"count": 12,  "gramProt": 100,   "gramComp": 52.5},
    "mediana": {"count": 61,  "gramProt": 180,   "gramComp": 92.5},
    "grande":  {"count": 7,   "gramProt": 250,   "gramComp": 140.0},
}
def _get(size, field):
    return _params.get(size, {}).get(field, _DEFAULTS[size][field])

count_pequena = int(_get("pequena", "count"))
count_mediana = int(_get("mediana", "count"))
count_grande  = int(_get("grande",  "count"))

personas = count_pequena + count_mediana + count_grande
if personas == 0:
    personas = 80  # fallback

dist = {
    "Pequena": count_pequena / personas,
    "Mediana": count_mediana / personas,
    "Grande":  count_grande  / personas,
}

# ======================================================================
# 1. DEFINICIÓN DE CONJUNTOS (SETS)
# ======================================================================
I = ["Arroz", "Calabacita", "Zanahoria", "Papa", "Atun", "Pollo", "Res", "Pasta", "Frijoles", "Jitomate", "Mojarra", "Huevo", "Jamon", "Avena", "Leche", "Bolillo"]
K = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"]
DAY_NAMES = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]
L = ["Pequena", "Mediana", "Grande"]
C = ["Desayuno", "Comida", "Cena"]
U = ["ArrozCalabacita", "PapasZanahoria","ArrozJitomate","PastaJitomate","FrijolesPapa","PastaCalabacita", "AvenaLeche", "BolilloFrijol"]
P = ["Atun", "Pollo", "Res", "Mojarra", "Huevo", "Jamon"]
No_P = [i for i in I if i not in P]
J = ["Ambiente", "Refrigerado", "Congelado"]

valid_P = {
    "Desayuno": ["Huevo", "Jamon"],
    "Comida": ["Pollo", "Res", "Mojarra"],
    "Cena": ["Atun", "Huevo", "Jamon"]
}
valid_U = {
    "Desayuno": ["FrijolesPapa", "AvenaLeche", "BolilloFrijol"],
    "Comida": ["ArrozCalabacita", "PapasZanahoria", "ArrozJitomate"],
    "Cena": ["PastaJitomate", "PastaCalabacita", "FrijolesPapa"]
}

# ======================================================================
# 2. PARÁMETROS PRINCIPALES
# ======================================================================
costo = {"Arroz": 16.9, "Calabacita": 29.9, "Zanahoria": 15.9, "Papa": 19.9, "Atun": 14.1, "Pollo": 94.0, "Res": 109.0, "Pasta":11.1, "Frijoles":26.5, "Jitomate":49.9, "Mojarra":109.0, "Huevo":50.0, "Jamon":120.0, "Avena":30.0, "Leche":28.0, "Bolillo": 18.0}
gramos = {"Arroz": 900, "Calabacita": 1000, "Zanahoria": 1000, "Papa": 1000, "Atun": 140, "Pollo": 1000, "Res": 1000, "Pasta":200, "Frijoles":908, "Jitomate":1000, "Mojarra":1000, "Huevo":1000, "Jamon":1000, "Avena":1000, "Leche":1000, "Bolillo": 1000}
restante = {"Arroz": 100000, "Calabacita": 0, "Zanahoria": 0, "Papa": 0, "Atun": 7280, "Pollo": 0, "Res": 0, "Pasta":60000, "Frijoles":330000, "Jitomate":0, "Mojarra":0, "Huevo":0, "Jamon":0, "Avena":0, "Leche":0, "Bolillo": 0}
factor_vol = {"Arroz": 1.18, "Calabacita": 2.20, "Zanahoria": 1.65, "Papa": 1.55, "Atun": 1.10, "Pollo": 1.05, "Res": 0.95, "Pasta": 0.39, "Frijoles": 0.75, "Jitomate": 0.65, "Mojarra": 1.00, "Huevo": 1.0, "Jamon": 1.1, "Avena": 0.4, "Leche": 1.0, "Bolillo": 0.8}
capacidad = {"Ambiente": 999999, "Refrigerado": 550, "Congelado": 750}

gram_prot = {"Pequena": 100, "Mediana": 180, "Grande": 250}
gram_comp = {"Pequena": 52.599, "Mediana": 90.99, "Grande": 140.0}

porc_emergencia = 0.15

receta_comp = {
    "Arroz": {"ArrozCalabacita": 0.75, "PapasZanahoria": 0, "ArrozJitomate":0.6, "PastaJitomate":0, "FrijolesPapa":0, "PastaCalabacita":0, "AvenaLeche": 0, "BolilloFrijol": 0},
    "Calabacita": {"ArrozCalabacita": 0.25, "PapasZanahoria": 0, "ArrozJitomate":0, "PastaJitomate":0, "FrijolesPapa":0, "PastaCalabacita":0.6667, "AvenaLeche": 0, "BolilloFrijol": 0},
    "Papa": {"ArrozCalabacita": 0, "PapasZanahoria": 0.6667, "ArrozJitomate":0, "PastaJitomate":0, "FrijolesPapa":0.4, "PastaCalabacita":0, "AvenaLeche": 0, "BolilloFrijol": 0},
    "Zanahoria": {"ArrozCalabacita": 0, "PapasZanahoria": 0.3333, "ArrozJitomate":0, "PastaJitomate":0, "FrijolesPapa":0, "PastaCalabacita":0, "AvenaLeche": 0, "BolilloFrijol": 0},
    "Pasta": {"ArrozCalabacita": 0, "PapasZanahoria": 0, "ArrozJitomate":0, "PastaJitomate":0.3333, "FrijolesPapa":0, "PastaCalabacita":0.3333, "AvenaLeche": 0, "BolilloFrijol": 0},
    "Frijoles": {"ArrozCalabacita": 0, "PapasZanahoria": 0, "ArrozJitomate":0, "PastaJitomate":0, "FrijolesPapa":0.6, "PastaCalabacita":0, "AvenaLeche": 0, "BolilloFrijol": 0.5},
    "Jitomate": {"ArrozCalabacita": 0, "PapasZanahoria": 0, "ArrozJitomate":0.4, "PastaJitomate":0.6667, "FrijolesPapa":0, "PastaCalabacita":0, "AvenaLeche": 0, "BolilloFrijol": 0},
    "Avena": {"ArrozCalabacita": 0, "PapasZanahoria": 0, "ArrozJitomate":0, "PastaJitomate":0, "FrijolesPapa":0, "PastaCalabacita":0, "AvenaLeche": 0.3, "BolilloFrijol": 0},
    "Leche": {"ArrozCalabacita": 0, "PapasZanahoria": 0, "ArrozJitomate":0, "PastaJitomate":0, "FrijolesPapa":0, "PastaCalabacita":0, "AvenaLeche": 0.7, "BolilloFrijol": 0},
    "Bolillo": {"ArrozCalabacita": 0, "PapasZanahoria": 0, "ArrozJitomate":0, "PastaJitomate":0, "FrijolesPapa":0, "PastaCalabacita":0, "AvenaLeche": 0, "BolilloFrijol": 0.5},
}

vida_util = {
    "Arroz": {"Ambiente": 730, "Refrigerado": 730, "Congelado": 0},
    "Calabacita": {"Ambiente": 4, "Refrigerado": 8, "Congelado": 240},
    "Zanahoria": {"Ambiente": 8, "Refrigerado": 25, "Congelado": 300},
    "Papa": {"Ambiente": 17, "Refrigerado": 7, "Congelado": 300},
    "Atun": {"Ambiente": 1095, "Refrigerado": 1095, "Congelado": 0},
    "Pollo": {"Ambiente": 0, "Refrigerado": 2, "Congelado": 180},
    "Res": {"Ambiente": 0, "Refrigerado": 2, "Congelado": 90},
    "Pasta": {"Ambiente": 730, "Refrigerado": 730, "Congelado": 0},
    "Frijoles": {"Ambiente": 365, "Refrigerado": 365, "Congelado": 0},
    "Jitomate": {"Ambiente": 7, "Refrigerado": 14, "Congelado": 0},
    "Mojarra": {"Ambiente": 0, "Refrigerado": 2, "Congelado": 180},
    "Huevo": {"Ambiente": 15, "Refrigerado": 15, "Congelado": 0},
    "Jamon": {"Ambiente": 0, "Refrigerado": 10, "Congelado": 0},
    "Avena": {"Ambiente": 365, "Refrigerado": 365, "Congelado": 0},
    "Leche": {"Ambiente": 180, "Refrigerado": 180, "Congelado": 0},
    "Bolillo": {"Ambiente": 3, "Refrigerado": 7, "Congelado": 30}
}

# Parámetros Calculados
req_prot_comida = personas * sum(dist[l] * gram_prot[l] for l in L)
req_comp_comida = personas * sum(dist[l] * gram_comp[l] for l in L)

# MULTIPLICADOR DE PORCIÓN SEGÚN EL HORARIO
factor_porcion = {
    "Desayuno": 0.5,
    "Comida": 1.0,
    "Cena": 0.5
}

# ======================================================================
# 3. INICIALIZACIÓN DEL MODELO Y VARIABLES
# ======================================================================
model = pulp.LpProblem("CasaMonarca_3Comidas", pulp.LpMinimize)

x_store = pulp.LpVariable.dicts("X_Store", (I, J), lowBound=0, cat='Continuous')
inv_inicial = pulp.LpVariable.dicts("Inv_Inicial", (I, J), lowBound=0, cat='Continuous')
inv = pulp.LpVariable.dicts("Inv", (I, J, K), lowBound=0, cat='Continuous')
transfer = pulp.LpVariable.dicts("Transfer", (I, K), lowBound=0, cat='Continuous')
consumo_amb = pulp.LpVariable.dicts("ConsumoAmb", (I, K), lowBound=0, cat='Continuous')
consumo_refri = pulp.LpVariable.dicts("ConsumoRefri", (I, K), lowBound=0, cat='Continuous')
consumo_total = pulp.LpVariable.dicts("ConsumoTotal", (I, K), lowBound=0, cat='Continuous')

y_prot = pulp.LpVariable.dicts("Y_Prot", (I, K, C), lowBound=0, cat='Continuous')
w = pulp.LpVariable.dicts("W", (U, K, C), lowBound=0, cat='Continuous')

b_prot = pulp.LpVariable.dicts("B_Prot", (I, K, C), cat='Binary')
b_comp = pulp.LpVariable.dicts("B_Comp", (U, K, C), cat='Binary')

# ======================================================================
# 4. FUNCIÓN OBJETIVO Y ECUACIONES
# ======================================================================
model += pulp.lpSum(costo[i] * x_store[i][j] for i in I for j in J), "Z_CostoTotal"

for i in I:
    model += pulp.lpSum(inv_inicial[i][j] for j in J) == restante[i]
    for j in J:
        if vida_util[i][j] == 0:
            model += inv[i][j]["d1"] + inv_inicial[i][j] + x_store[i][j] == 0

for i in I:
    model += inv[i]["Congelado"]["d1"] == inv_inicial[i]["Congelado"] + x_store[i]["Congelado"] * gramos[i] - transfer[i]["d1"]
    model += inv[i]["Refrigerado"]["d1"] == inv_inicial[i]["Refrigerado"] + x_store[i]["Refrigerado"] * gramos[i] - consumo_refri[i]["d1"]
    model += inv[i]["Ambiente"]["d1"] == inv_inicial[i]["Ambiente"] + x_store[i]["Ambiente"] * gramos[i] - consumo_amb[i]["d1"]

    for k_idx in range(1, len(K)):
        k = K[k_idx]
        k_prev = K[k_idx - 1]
        model += inv[i]["Congelado"][k] == inv[i]["Congelado"][k_prev] - transfer[i][k]
        model += inv[i]["Refrigerado"][k] == inv[i]["Refrigerado"][k_prev] + transfer[i][k_prev] - consumo_refri[i][k]
        model += inv[i]["Ambiente"][k] == inv[i]["Ambiente"][k_prev] - consumo_amb[i][k]

for i in I:
    for k in K:
        model += consumo_total[i][k] == consumo_amb[i][k] + consumo_refri[i][k]
        if i in P:
            model += consumo_total[i][k] == pulp.lpSum(y_prot[i][k][c] for c in C)
        else:
            model += consumo_total[i][k] == pulp.lpSum(w[u][k][c] * receta_comp.get(i, {}).get(u, 0) for u in U for c in C)

M = 100000
for k in K:
    for c in C:
        req_prot_actual = req_prot_comida * factor_porcion[c]
        req_comp_actual = (req_comp_comida * 2) * factor_porcion[c]

        model += pulp.lpSum(y_prot[i][k][c] for i in valid_P[c]) >= req_prot_actual
        model += pulp.lpSum(w[u][k][c] for u in valid_U[c]) >= req_comp_actual

        model += pulp.lpSum(b_prot[i][k][c] for i in valid_P[c]) == 1
        model += pulp.lpSum(b_comp[u][k][c] for u in valid_U[c]) == 1

        for i in P:
            if i not in valid_P[c]:
                model += b_prot[i][k][c] == 0
                model += y_prot[i][k][c] == 0
            else:
                model += y_prot[i][k][c] <= M * b_prot[i][k][c]
                model += y_prot[i][k][c] >= req_prot_actual * b_prot[i][k][c]

        for u in U:
            if u not in valid_U[c]:
                model += b_comp[u][k][c] == 0
                model += w[u][k][c] == 0
            else:
                model += w[u][k][c] <= M * b_comp[u][k][c]
                model += w[u][k][c] >= req_comp_actual * b_comp[u][k][c]

# ======================================================================
# RESTRICCIONES DE VARIEDAD
# ======================================================================
for k in K:
    for i in P:
        model += pulp.lpSum(b_prot[i][k][c] for c in C) <= 1
    for u in U:
        model += pulp.lpSum(b_comp[u][k][c] for c in C) <= 1

for k_idx in range(len(K) - 1):
    k = K[k_idx]
    k_next = K[k_idx + 1]
    for c in C:
        for i in P:
            model += b_prot[i][k][c] + b_prot[i][k_next][c] <= 1
        for u in U:
            model += b_comp[u][k][c] + b_comp[u][k_next][c] <= 1

model += pulp.lpSum(b_prot["Res"][k]["Comida"] for k in K) >= 1
model += pulp.lpSum(b_prot["Mojarra"][k]["Comida"] for k in K) >= 1

for j in J:
    if j != "Ambiente":
        for k in K:
            model += pulp.lpSum((inv[i][j][k] / 1000) * factor_vol[i] for i in I) <= capacidad[j]

total_mult_dia = sum(factor_porcion.values())
model += pulp.lpSum(inv[i][j]["d7"] for i in P for j in J) >= porc_emergencia * (req_prot_comida * total_mult_dia)

emergencia_comp_rhs = porc_emergencia * sum(
    sum(receta_comp.get(i, {}).get(u, 0) * (req_comp_comida * 2 * total_mult_dia) for u in U)
    for i in No_P
)
model += pulp.lpSum(inv[i][j]["d7"] for i in No_P for j in J) >= emergencia_comp_rhs

# ======================================================================
# 4.5 RESTRICCIONES DE CADUCIDAD
# ======================================================================
for i in I:
    v_amb = vida_util[i]["Ambiente"]
    if 0 < v_amb < len(K):
        for k_idx in range(len(K)):
            k = K[k_idx]
            if (k_idx + 1) >= v_amb:
                model += inv[i]["Ambiente"][k] == 0

    v_cong = vida_util[i]["Congelado"]
    if 0 < v_cong < len(K):
        for k_idx in range(len(K)):
            k = K[k_idx]
            if (k_idx + 1) >= v_cong:
                model += inv[i]["Congelado"][k] == 0

    v_ref = vida_util[i]["Refrigerado"]
    if 0 < v_ref < len(K):
        for k_idx in range(len(K)):
            k = K[k_idx]
            dia_actual = k_idx + 1
            t_min = dia_actual - v_ref + 2
            inflows_validos = []
            if t_min <= 1:
                inflows_validos.append(inv_inicial[i]["Refrigerado"] + x_store[i]["Refrigerado"] * gramos[i])
            for t_llegada in range(max(2, t_min), dia_actual + 1):
                t_idx = t_llegada - 2
                inflows_validos.append(transfer[i][K[t_idx]])
            model += inv[i]["Refrigerado"][k] <= pulp.lpSum(inflows_validos)

# ======================================================================
# 5. RESOLVER Y EXPORTAR JSON
# ======================================================================
model.solve(pulp.PULP_CBC_CMD(msg=False))

elapsed = round(time.time() - start_time, 2)
status  = pulp.LpStatus[model.status]

if model.status != pulp.LpStatusOptimal:
    print(json.dumps({"status": status, "error": "No se encontro solucion optima", "elapsed": elapsed}))
    sys.exit(0)

menu = []
for k_idx, k in enumerate(K):
    meals = {}
    for c in C:
        protein = next((i for i in valid_P[c] if pulp.value(b_prot[i][k][c]) and pulp.value(b_prot[i][k][c]) > 0.5), None)
        garnish = next((u for u in valid_U[c] if pulp.value(b_comp[u][k][c]) and pulp.value(b_comp[u][k][c]) > 0.5), None)
        prot_g  = round(sum(pulp.value(y_prot[i][k][c]) or 0 for i in P), 1)
        garn_g  = round(sum(pulp.value(w[u][k][c]) or 0 for u in U), 1)
        meals[c] = {"protein": protein, "garnish": garnish, "proteinGrams": prot_g, "garnishGrams": garn_g}
    menu.append({"day": k, "dayName": DAY_NAMES[k_idx], "meals": meals})

purchases = []
for i in I:
    for j in J:
        val = pulp.value(x_store[i][j])
        if val and val > 0.01:
            purchases.append({"product": i, "storage": j, "units": round(val, 2), "cost": round(val * costo[i], 2)})

print(json.dumps({
    "status": status,
    "cost": round(pulp.value(model.objective), 2),
    "personas": personas,
    "menu": menu,
    "purchases": purchases,
    "reqProtComida": round(req_prot_comida, 1),
    "reqCompComida": round(req_comp_comida * 2, 1),
    "factorPorcion": factor_porcion,
    "elapsed": elapsed,
}, ensure_ascii=False))
