document.addEventListener('DOMContentLoaded', () => { // Primer y único DOMContentLoaded

    const workoutRoutineDiv = document.getElementById('workout-routine');

    // Define tu rutina de entrenamiento aquí (asegúrate de que los nombres de los ejercicios
    // coincidan exactamente con las cabeceras de tu Google Sheet)
    const workoutDays = [
        {
            day: "Día 1: Pecho y Tríceps",
            exercises: [
                { name: "Press de Banca" },
                { name: "Press Inclinado con Mancuernas" },
                { name: "Aperturas con Mancuernas" },
                { name: "Fondos en Paralelas (o máquina)" },
                { name: "Extensión de Tríceps con Barra Z" }
            ]
        },
        {
            day: "Día 2: Espalda y Bíceps",
            exercises: [
                { name: "Dominadas (o Jalón al Pecho)" },
                { name: "Remo con Barra" },
                { name: "Remo con Mancuerna a una mano" },
                { name: "Peso Muerto Rumano" },
                { name: "Curl de Bíceps con Barra" },
                { name: "Curl de Martillo con Mancuernas" }
            ]
        }
        ,
        {
            day: "Día 3: Piernas y Hombros",
            exercises: [
                { name: "Sentadilla" },
                { name: "Prensa de Piernas" },
                { name: "Extensiones de Cuádriceps" },
                { name: "Curl Femoral Tumbado" },
                { name: "Press Militar con Mancuernas" },
                { name: "Elevaciones Laterales" }
            ]
        }
        // Puedes añadir más días según tu rutina
    ];

    // **IMPORTANTE: PEGA AQUÍ LA URL DE TU APLICACIÓN WEB DE GOOGLE APPS SCRIPT**
    // Debe verse algo como: 'https://script.google.com/macros/s/AKfyc.../exec'
    const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyE7CR8qTxZRTWdDsc2zgQkx8tRVstyE4t0jtjjrdAx21t82vrWq5XltYXXaFpPR7SI3w/exec'; // <--- ¡Pega tu URL aquí!

    // Function to render workout days (este código se mantiene igual)
    function renderWorkoutRoutine() {
        workoutRoutineDiv.innerHTML = ''; // Clear previous content

        workoutDays.forEach((dayData, dayIndex) => {
            const daySection = document.createElement('div');
            daySection.classList.add('day-section');
            daySection.innerHTML = `<h2>${dayData.day}</h2>`;

            dayData.exercises.forEach((exercise, exerciseIndex) => {
                const exerciseDiv = document.createElement('div');
                exerciseDiv.classList.add('exercise');
                exerciseDiv.innerHTML = `
                    <label for="day${dayIndex}-exercise${exerciseIndex}">${exercise.name}:</label>
                    <input type="number" id="day${dayIndex}-exercise${exerciseIndex}" placeholder="Peso (kg)" min="0">
                `;
                daySection.appendChild(exerciseDiv);
            });

            const saveButton = document.createElement('button');
            saveButton.classList.add('save-button');
            saveButton.textContent = `Guardar pesos del ${dayData.day}`;
            saveButton.addEventListener('click', () => saveDayWeights(dayIndex));
            daySection.appendChild(saveButton);

            workoutRoutineDiv.appendChild(daySection);
        });
    }

    // --- ¡LA FUNCIÓN saveDayWeights ES DONDE OCURRE EL CAMBIO PRINCIPAL! ---
    function saveDayWeights(dayIndex) {
        const dayData = workoutDays[dayIndex];
        const weightsToSave = {};
        let allWeightsEntered = true;

        dayData.exercises.forEach((exercise, exerciseIndex) => {
            const inputElement = document.getElementById(`day${dayIndex}-exercise${exerciseIndex}`);
            const weight = inputElement.value;

            if (weight === "" || parseFloat(weight) < 0) {
                allWeightsEntered = false;
                alert(`Por favor, ingresa un peso válido para "${exercise.name}" del ${dayData.day}.`);
                inputElement.focus();
                return;
            }
            weightsToSave[exercise.name] = parseFloat(weight);
        });

        if (!allWeightsEntered) {
            return; // Sale de la función si no todos los pesos son válidos
        }

        // Enviar los datos al backend (Google Apps Script Web App)
        fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                day: dayData.day,
                weights: weightsToSave
            })
        })
        .then(response => {
            // Verifica si la respuesta es exitosa (código 2xx)
            if (!response.ok) {
                // Si hay un error HTTP, lanza una excepción
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parsea la respuesta como JSON
        })
        .then(data => {
            if (data.success) {
                alert(data.message);
                // Opcional: limpiar los campos de entrada después de guardar exitosamente
                dayData.exercises.forEach((exercise, exerciseIndex) => {
                    document.getElementById(`day${dayIndex}-exercise${exerciseIndex}`).value = '';
                });
            } else {
                alert(`Error al guardar: ${data.message || 'Error desconocido'}`);
            }
        })
        .catch(error => {
            console.error('Error al enviar datos al backend:', error);
            alert(`Hubo un error al guardar los pesos: ${error.message}. Por favor, revisa la consola para más detalles.`);
        });
    }

    // Initial render
    renderWorkoutRoutine();
}); // Cierre del único DOMContentLoaded // Cierre del único DOMContentLoaded
