let personajes = JSON.parse(localStorage.getItem("personajes")) || [];

let modoCombate = false;
let turnoActual = 0;

function save(){
    localStorage.setItem("personajes", JSON.stringify(personajes));
}

function render(){

    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    personajes.forEach((p, i) => {

        const activo = modoCombate && i === turnoActual ? "🔴" : "";

        lista.innerHTML += `
        <div class="card">
            <b>${activo} ${p.nombre}</b> — Base: ${p.ini}

            <br>

            🎲 Dado:
            <input type="number" id="dado-${i}" value="${p.dado ?? ''}" placeholder="d100">

            <div class="total">
                Total: ${p.total ?? p.ini}
            </div>

            <button class="delete" onclick="borrar(${i})">🗑️</button>
        </div>
        `;
    });

    actualizarBotonCombate();
}

function actualizarBotonCombate(){

    const btn = document.querySelector(".combat.iniciar");

    if(modoCombate){
        btn.classList.add("activo");
        btn.innerHTML = "⛔ Terminar combate";
    } else {
        btn.classList.remove("activo");
        btn.innerHTML = "▶ Iniciar combate";
    }
}

function addPersonaje(){

    const nombre = document.getElementById("nombre").value.trim();
    const ini = parseInt(document.getElementById("ini").value);

    if(!nombre || isNaN(ini)) return;

    personajes.push({
        nombre,
        ini,
        dado: null,
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

function ordenar(){

    personajes.forEach((p, i) => {

        const input = document.getElementById(`dado-${i}`);
        const dado = parseInt(input.value);

        p.dado = isNaN(dado) ? 0 : dado;
        p.total = p.ini + p.dado;
    });

    personajes.sort((a,b) => b.total - a.total);

    save();
    render();
}

function iniciarCombate(){

    if(personajes.length === 0) return;

    modoCombate = !modoCombate;

    if(modoCombate){
        turnoActual = 0;
    }

    render();
}

function siguienteTurno(){

    if(!modoCombate) return;

    turnoActual++;

    if(turnoActual >= personajes.length){
        modoCombate = false;
        turnoActual = 0;
    }

    render();
}

render();