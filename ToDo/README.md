To-Do List — Proyecto Final Ingeniería Web 1

Aplicación web para gestionar tareas del día a día. El usuario puede agregar, editar, completar y eliminar tareas. Los datos se guardan en una base de datos MySQL, por lo que las tareas no se pierden al cerrar el navegador.
Tecnologías

- HTML, CSS y JavaScript puro en el frontend
- Node.js con Express en el backend
- MySQL como base de datos
Estructura del proyecto

ToDo/
├── frontend/
│   ├── index.html
│   ├── toDo.html
│   ├── style.css
│   ├── app.js
│   └── imagenes/
├── src/
│   ├── server.js
│   └── db_tareas.sql
├── package.json
└── README.md

Cómo correr el proyecto

Requisitos
- Tener Node.js instalado
- Tener MySQL instalado y corriendo

Pasos

1. Clonar el repositorio
bash
git clone https://github.com/Alvarez-Dylan/ToDoList.git
cd ToDoList


2. Instalar las dependencias
bash
npm install

3. Crear la base de datos

Abrir MySQL Workbench y ejecutar el archivo src/db_tareas.sql. Esto crea la base de datos todolist_db con la tabla tareas.

4. Configurar la contraseña de MySQL

Abrir src/server.js y cambiar la contraseña en esta parte:
javascript
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "tu_contraseña",
  database: "todolist_db",
});

5. Correr el backend
bash
node src/server.js

Tiene que aparecer: API corriendo en http://localhost:3000

6. Abrir el frontend

Abrir frontend/index.html con Live Server desde VS Code.

El backend tiene que estar corriendo primero antes de abrir el frontend.

Endpoints

Método / URL / Qué hace 

GET       /api/tareas       Trae todas las tareas 
POST      /api/tareas       Crea una tarea 
PATCH    /api/tareas/:id    Edita el título o el estado 
DELETE   /api/tareas/:id    Elimina una tarea 

Autor

Dylan Darel Alvarez Pabon
