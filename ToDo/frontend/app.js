const API = "http://localhost:3000/api/tareas";

// Referencias al HTML
const input = document.querySelector(".toDo-Section__agregar input");
const btnAgregar = document.querySelector(".todo-button");
const listaTareas = document.getElementById("lista-tareas");
const contador = document.getElementById("contador");
const btnMarcarTodas = document.querySelector(".toDo-Section__lista__titulos button");

// ========================
// CARGAR TAREAS AL INICIO
// ========================
async function cargarTareas() {
  try {
    const res = await fetch(API);
    const tareas = await res.json();
    listaTareas.innerHTML = "";
    tareas.forEach(tarea => renderTarea(tarea));
    actualizarContador(tareas);
  } catch (err) {
    console.error("Error al cargar tareas:", err);
    listaTareas.innerHTML = "<p style='padding:16px;color:red'>Error al conectar con el servidor</p>";
  }
}

// ========================
// PINTAR UNA TAREA EN EL HTML
// ========================
function renderTarea(tarea) {
  const div = document.createElement("div");
  div.classList.add("toDo-Section__lista__tareas", "toDo-Section__lista__tareas-flex");
  div.dataset.id = tarea.id;

  if (tarea.completada) div.classList.add("completada");

  div.innerHTML = `
    <label style="display:flex;align-items:center;gap:12px;flex:1;cursor:pointer">
      <input type="checkbox" ${tarea.completada ? "checked" : ""} 
             style="width:24px;height:24px;accent-color:#3292f2;cursor:pointer">
      <p style="font-family:'Museo-Sans-Rounded';font-size:17px;
                ${tarea.completada ? "text-decoration:line-through;color:#898A92" : "color:#000005"}">
        ${tarea.titulo}
      </p>
    </label>
    <div class="toDo-Section__lista__tareas-btn">
      <button class="toDo-Section__lista__tareas__botones btn-editar" title="Editar">
        <img src="imagenes/lapiz-3d.png" width="40px" height="40px">
      </button>
      <button class="toDo-Section__lista__tareas__botones btn-eliminar" title="Eliminar">
        <img src="imagenes/borrar.png" width="40px" height="40px">
      </button>
    </div>
  `;

  // Checkbox — marcar/desmarcar completada
  const checkbox = div.querySelector("input[type='checkbox']");
  checkbox.addEventListener("change", () => toggleCompletada(tarea.id, checkbox.checked, div));

  // Doble click en el título — editar con prompt
  const parrafo = div.querySelector("p");
  parrafo.addEventListener("dblclick", () => editarInline(div, tarea));

  // Botón eliminar
  div.querySelector(".btn-eliminar").addEventListener("click", () => eliminarTarea(tarea.id, div));

  // Botón editar — abre prompt
  div.querySelector(".btn-editar").addEventListener("click", () => {
    const nuevoTitulo = prompt("Editá el título de la tarea:", tarea.titulo);
    if (nuevoTitulo === null) return;
    if (!nuevoTitulo.trim()) {
      alert("El título no puede estar vacío");
      return;
    }
    guardarEdicion(nuevoTitulo.trim(), tarea, div);
  });

  listaTareas.appendChild(div);
}

// ========================
// AGREGAR TAREA
// ========================
async function agregarTarea() {
  const titulo = input.value.trim();
  if (!titulo) return;

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo })
    });

    if (!res.ok) return;

    const tarea = await res.json();
    renderTarea(tarea);
    input.value = "";
    actualizarContadorDOM();
  } catch (err) {
    console.error("Error al agregar tarea:", err);
  }
}

// Agregar con botón
btnAgregar.addEventListener("click", agregarTarea);

// Agregar con Enter
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") agregarTarea();
});

// ========================
// MARCAR / DESMARCAR COMPLETADA
// ========================
async function toggleCompletada(id, completada, div) {
  try {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completada })
    });

    const parrafo = div.querySelector("p");
    if (completada) {
      parrafo.style.textDecoration = "line-through";
      parrafo.style.color = "#898A92";
      div.classList.add("completada");
    } else {
      parrafo.style.textDecoration = "none";
      parrafo.style.color = "#000005";
      div.classList.remove("completada");
    }

    actualizarContadorDOM();
  } catch (err) {
    console.error("Error al actualizar tarea:", err);
  }
}

// ========================
// EDITAR CON DOBLE CLICK
// ========================
function editarInline(div, tarea) {
  const nuevoTitulo = prompt("Editá el título de la tarea:", tarea.titulo);
  if (nuevoTitulo === null) return;
  if (!nuevoTitulo.trim()) {
    alert("El título no puede estar vacío");
    return;
  }
  guardarEdicion(nuevoTitulo.trim(), tarea, div);
}

async function guardarEdicion(nuevoTitulo, tarea, div) {
  try {
    const res = await fetch(`${API}/${tarea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: nuevoTitulo })
    });

    const tareaActualizada = await res.json();
    tarea.titulo = tareaActualizada.titulo;

    const parrafo = div.querySelector("p");
    parrafo.textContent = tareaActualizada.titulo;
  } catch (err) {
    console.error("Error al editar tarea:", err);
  }
}

// ========================
// ELIMINAR TAREA
// ========================
async function eliminarTarea(id, div) {
  if (!confirm("¿Seguro que querés eliminar esta tarea?")) return;

  try {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    div.remove();
    actualizarContadorDOM();
  } catch (err) {
    console.error("Error al eliminar tarea:", err);
  }
}

// ========================
// MARCAR TODAS
// ========================
btnMarcarTodas.addEventListener("click", async () => {
  const divs = listaTareas.querySelectorAll("[data-id]");
  const todasCompletadas = [...divs].every(d => d.classList.contains("completada"));
  const nuevoEstado = !todasCompletadas;

  for (const div of divs) {
    const id = div.dataset.id;
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completada: nuevoEstado })
    });

    const checkbox = div.querySelector("input[type='checkbox']");
    const parrafo = div.querySelector("p");
    checkbox.checked = nuevoEstado;

    if (nuevoEstado) {
      parrafo.style.textDecoration = "line-through";
      parrafo.style.color = "#898A92";
      div.classList.add("completada");
    } else {
      parrafo.style.textDecoration = "none";
      parrafo.style.color = "#000005";
      div.classList.remove("completada");
    }
  }

  actualizarContadorDOM();
});

// ========================
// CONTADOR DE PENDIENTES
// ========================
function actualizarContador(tareas) {
  const pendientes = tareas.filter(t => !t.completada).length;
  contador.textContent = `${pendientes} tarea${pendientes !== 1 ? "s" : ""} restante${pendientes !== 1 ? "s" : ""}`;
}

function actualizarContadorDOM() {
  const divs = listaTareas.querySelectorAll("[data-id]");
  const pendientes = [...divs].filter(d => !d.classList.contains("completada")).length;
  contador.textContent = `${pendientes} tarea${pendientes !== 1 ? "s" : ""} restante${pendientes !== 1 ? "s" : ""}`;
}

// ========================
// INICIAR
// ========================
cargarTareas();