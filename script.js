let personajes = JSON.parse(localStorage.getItem("personajes")) || [];

let modoCombate = false;
let turnoActual = 0;

/* 🧠 modo de orden visual */
let modoOrden = "preparacion";

const protagonistas = ["PLATA", "MARAVI", "TAKESHI", "MARTINA"];

function save(){
    localStorage.setItem("personajes", JSON.stringify(personajes));
}

/* 📱 avanzar input + siguiente a 0 */
function siguienteInput(actualId){

    const inputs = Array.from(document.querySelectorAll("input[type='number']"));

    const index = inputs.findIndex(i => i.id === actualId);

    const current = inputs[index];
    const next = inputs[index + 1];

    current.value = parseInt(current.value) || 0;

    if(next){
        next.value = 0;
        next.focus();
        next.select();
    } else {
        document.activeElement.blur();
    }
}

/* 🧠 ORDEN PREPARACIÓN (tu regla nueva) */
function ordenarPreparacion(lista){

    return [...lista].sort((a,b) => {

        const A = a.nombre.toUpperCase();
        const B = b.nombre.toUpperCase();

        const rank = (name) => {

            if(name === "PLATA") return 0;
            if(name === "TAKESHI") return 1;
            if(name === "MARAVI") return 2;
            if(name === "MARTINA") return 3;

            const numA = name.match(/\d+/);
            if(numA) return 100 + parseInt(numA[0]);

            return 1000;
        };

        return rank(A) - rank(B);
    });
}

/* ⚔️ ORDEN COMBATE */
function ordenarCombate(lista){
    return [...lista].sort((a,b) => b.total - a.total);
}

function render(){

    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    const ordenados = modoOrden === "combate"
        ? ordenarCombate(personajes)
        : ordenarPreparacion(personajes);

    ordenados.forEach(p => p.warning = []);

    for(let j = 0; j < ordenados.length; j++){
        for(let i = 0; i < j; i++){

            const gap = ordenados[i].total - ordenados[j].total;

            if(gap >= 150){
                ordenados[j].warning.push(ordenados[i].nombre);
            }
        }
    }

    personajes = ordenados;

    personajes.forEach((p, i) => {

        const activo = modoCombate && i === turnoActual ? "🔴" : "";

        let nombreRaw = p.nombre.trim();

        let color = "#ff9800";

        if(nombreRaw.toUpperCase().startsWith("ALIADO ")){
            color = "#2e7d32";
            nombreRaw = nombreRaw.replace(/^[Aa]liado\s+/, "");
        }
        else if(protagonistas.includes(nombreRaw.toUpperCase())){
            color = "#ffffff";
        }

        const warningText = p.warning.length > 0
            ? `⚠ ${p.warning.join(", ")}`
            : "";

        lista.innerHTML += `
        <div class="card">
            <b style="color:${color}">
                ${activo} ${nombreRaw}
            </b>

            — Base: ${p.ini}

            <br>

            🎲 Dado:
            <input type="number"
                id="dado-${i}"
                value="${p.dado ?? 0}"
                onkeydown="if(event.key==='Enter'){ event.preventDefault(); siguienteInput(this.id); }"
            >

            <div style="
                display:flex;
                align-items:center;
                margin-top:8px;
                font-size:18px;
                font-weight:bold;
                gap:10px;
            ">
                <div>
                    Total: ${p.total ?? p.ini}
                </div>

                ${p.warning.length > 0 ? `
                    <div style="color:#e53935;font-size:14px;font-weight:normal;">
                        ${warningText}
                    </div>
                ` : ""}
            </div>

            <button class="delete" onclick="borrar(${i})">🗑️</button>
        </div>
        `;
    });

    actualizarBotones();
}

function actualizarBotones(){

    const btn = document.querySelector(".combat.iniciar");

    btn.textContent = modoCombate
        ? "Finalizar combate"
        : "Iniciar combate";

    if(modoCombate){
        btn.classList.add("activo");
    } else {
        btn.classList.remove("activo");
    }
}

function addPersonaje(){

    const nombre = document.getElementById("nombre").value.trim();
    const ini = parseInt(document.getElementById("ini").value);

    if(!nombre || isNaN(ini)) return;

    personajes.push({
        nombre,
        ini,
        dado: 0,
        total: ini
    });

    document.getElementById("nombre").value = "";
    document.getElementById("ini").value = "";

    save();
    render();
}

function borrar(i){
    personajes.splice(i,1);
    save();
    render();
}

/* 🎲 ordenar manual combate */
function ordenar(){

    personajes.forEach((p, i) => {

        const input = document.getElementById(`dado-${i}`);
        const dado = parseInt(input.value);

        p.dado = isNaN(dado) ? 0 : dado;
        p.total = p.ini + p.dado;
    });

    modoOrden = "combate";
    render();
}

/* ⚔️ toggle combate */
function iniciarCombate(){

    if(personajes.length === 0) return;

    if(!modoCombate){

        // Leer los valores escritos en los dados
        personajes.forEach((p, i) => {

            const input = document.getElementById(`dado-${i}`);

            if(input){
                const dado = parseInt(input.value);

                p.dado = isNaN(dado) ? 0 : dado;
                p.total = p.ini + p.dado;
            }

        });

        // Ordenar igual que hace el botón "Ordenar"
        personajes.sort((a,b) => b.total - a.total);

        modoOrden = "combate";
        modoCombate = true;
        turnoActual = 0;

    }else{

        modoCombate = false;
        modoOrden = "preparacion";
    }

    save();
    render();
}

function siguienteTurno(){

    if(!modoCombate) return;

    turnoActual++;

    if(turnoActual >= personajes.length){
        modoCombate = false;
        turnoActual = 0;
        modoOrden = "preparacion";
    }

    render();
}

/* 📱 cerrar teclado */
document.addEventListener("click", function(e){
    if(e.target.tagName !== "INPUT"){
        document.activeElement.blur();
    }
});

render();
