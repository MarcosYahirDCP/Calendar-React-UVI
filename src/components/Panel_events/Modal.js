function generateSpeakerFields() {
    const numPonentes = parseInt(document.getElementById("numPonentes").value);
    const container = document.getElementById("speakerFieldsContainer");
    container.innerHTML = ""; // Limpiar los campos previos

    for (let i = 0; i < numPonentes; i++) {
        const speakerField = `
        <div class="speaker-field">
            <div class="add-event-input">
                <input type="text" id="cargoPonente${i + 1}" placeholder="Cargo" class="event-manager-name" name="cargoPonente${i + 1}" required />
            </div>
            <div style="width:25px"></div>
            <div class="add-event-input">
                <input type="text" placeholder="Nombre"  id="nombrePonente${i + 1}" class="event-manager-name" name="nombrePonente${i + 1}" required />
            </div>
        </div>
        `;
        container.innerHTML += speakerField;
    }
}