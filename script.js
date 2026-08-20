let personajes = JSON.parse(localStorage.getItem("personajes")) || [];

let modoCombate = false;
let turnoActual = 0;

/* 🧠 modo de orden visual */
let modoOrden = "preparacion";

const protagonistas = ["PLATA", "MARAVI", "TAKESHI", "MARTINA", "IMME"];

function save(){
    localStorage.setItem("personajes", JSON.stringify(personajes));
}

/* 📱 avanzar input + siguiente a 0 */
function siguienteInput(actualId){

    const inputs = Array.from(document.querySelectorAll("input[type='number']"));

    const index = inputs.findIndex(i => i.id === actualId);

    const current = inputs[index];
    const next = inputs[index + 1];

    const personajeIndex = parseInt(current.dataset.personaje);

    if(!isNaN(personajeIndex)){
        const valorActual = parseInt(current.value);

        if(!isNaN(valorActual)){
            personajes[personajeIndex].ultimoDado = personajes[personajeIndex].dado ?? 0;
            personajes[personajeIndex].dado = valorActual;
            personajes[personajeIndex].total =
                personajes[personajeIndex].ini + valorActual;
        }
    }

    if(next){
        next.value = 0;
        next.focus();
        next.select();
    } else {
        document.activeElement.blur();
    }

    save();
    render();
}

/* 🧠 ORDEN PREPARACIÓN */
function ordenarPreparacion(lista){

    return [...lista].sort((a,b) => {

        const A = a.nombre.trim().toUpperCase();
        const B = b.nombre.trim().toUpperCase();

        const rank = (name) => {

            // 1. Cualquier nombre que contenga números
            if(/\d/.test(name)) return 0;

            // 2. Protagonistas en el orden establecido
            if(name === "PLATA") return 1;
            if(name === "MARAVI") return 2;
            if(name === "MARTINA") return 3;
            if(name === "TAKESHI") return 4;
            if(name === "IMME") return 5;

            // 3. Cualquier otro nombre sin números
            return 6;
        };

        const rA = rank(A);
        const rB = rank(B);

        // Si pertenecen al mismo grupo, ordenar alfabéticamente
        if(rA === rB){
            return A.localeCompare(B, "es");
        }

        return rA - rB;
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
                data-personaje="${i}"
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

            ${p.ultimoDado !== undefined && p.ultimoDado !== null ? `
                <div class="ultimo-dado">
                    ${p.ultimoDado}
                </div>
            ` : ""}

            <button class="delete" onclick="borrar(${i})">🗑️</button>
        </div>
        `;
    });

    actualizarBotones();

    /* Detectar cambios manuales en los dados */
    document.querySelectorAll(".card input[type='number']").forEach(input => {

        input.addEventListener("change", function(){

            const index = parseInt(this.dataset.personaje);

            if(isNaN(index)) return;

            const valorNuevo = parseInt(this.value);

            if(isNaN(valorNuevo)) return;

            const valorAnterior = personajes[index].dado ?? 0;

            if(valorNuevo !== valorAnterior){
                personajes[index].ultimoDado = valorAnterior;
            }

            personajes[index].dado = valorNuevo;
            personajes[index].total =
                personajes[index].ini + valorNuevo;

            save();
            render();
        });
    });
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

    let ini = parseInt(document.getElementById("ini").value);

    if(!nombre) return;

    if(isNaN(ini)){
        ini = 0;
    }

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

        if(!isNaN(dado)){
            if(dado !== (p.dado ?? 0)){
                p.ultimoDado = p.dado ?? 0;
            }

            p.dado = dado;
            p.total = p.ini + dado;
        }
    });

    modoOrden = "combate";
    save();
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

                if(!isNaN(dado)){

                    if(dado !== (p.dado ?? 0)){
                        p.ultimoDado = p.dado ?? 0;
                    }

                    p.dado = dado;
                    p.total = p.ini + dado;
                }
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
