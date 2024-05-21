import React, { useState, useEffect } from 'react';
import './PanelEvents.css';
import Modal from '../Modal_New_Event/ModalNewEvent';
import { collection, addDoc, getDocs } from "firebase/firestore";
import db from '../../firebase';
import Card from 'react-bootstrap/Card';

const EventPanel = ({ isOpen, selectedDate, selectedDate2, eventosEnFechaSeleccionada }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [numPonentes, setNumPonentes] = useState(1);
    const [isChecked, setIsChecked] = useState({
        pantallas: false,
        tripie: false,
        microfonos: false,
        proyectores: false,
        bocina: false,
        equipoVideoconferencia: false,
        extension: false,
        laptop: false
    });
    const [eventData, setEventData] = useState({
        eventName: '',
        eventManagerName: '',
        eventTimeFrom: '',
        eventTimeTo: '',
        services: [],
        speakers: []
    });
    const [loading, setLoading] = useState(false); // Nuevo estado para controlar la carga
    const [successMessage, setSuccessMessage] = useState(false); // Nuevo estado para mostrar el mensaje de éxito
    useEffect(() => {
        const selectedServices = Object.entries(isChecked)
            .filter(([key, value]) => value)
            .map(([key, value]) => key);
        setEventData({
            ...eventData,
            services: selectedServices
        });
    }, [isChecked]);

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setIsChecked(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEventData({
            ...eventData,
            [name]: value
        });
    };

    const handleNumPonentesChange = (event) => {
        const { value } = event.target;
        setNumPonentes(parseInt(value));
    };

    const handleSpeakerInputChange = (index, event) => {
        const { name, value } = event.target;
        const updatedSpeakers = [...eventData.speakers];
        updatedSpeakers[index] = {
            ...updatedSpeakers[index],
            [name]: value
        };
        setEventData({
            ...eventData,
            speakers: updatedSpeakers,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Inicia la carga
        try {
            const docRef = await addDoc(collection(db, "events"), {
                date: selectedDate2,
                eventData
            });
            console.log("Document written with ID: ", docRef.id);
            setLoading(false); // Finaliza la carga
            setSuccessMessage(true); // Muestra el mensaje de éxito
            setTimeout(() => {
                window.location.reload(); // Recarga la página después de un tiempo determinado
            }, 3000); // Cambia 3000 por el tiempo que desees mostrar el mensaje de éxito
        } catch (e) {
            console.error("Error adding document: ", e);
            setLoading(false); // Finaliza la carga en caso de error
        }
    };

    const generateSpeakerFields = () => {
        const fields = [];
        for (let i = 0; i < numPonentes; i++) {
            fields.push(
                <div key={i} className="speaker-field">
                    <div className="add-event-input">
                        <input type="text" placeholder="Nombre" id={`nombrePonente${i + 1}`} className="event-manager-name" name={`nombrePonente${i + 1}`} onChange={(e) => handleSpeakerInputChange(i, e)} required />
                    </div>
                    <div style={{ width: "25px" }}></div>
                    <div className="add-event-input">
                        <input type="text" id={`cargoPonente${i + 1}`} placeholder="Cargo" className="event-manager-name" name={`cargoPonente${i + 1}`} onChange={(e) => handleSpeakerInputChange(i, e)} required />
                    </div>
                </div>
            );
        }
        return fields;
    };
    

    const openModal = () => {
        setModalOpen(true);
    };

    const showDetails = () =>{
    }

    const closeModal = () => {
        setModalOpen(false);
    };
    
    return (
        <div className={`event-panel ${isOpen ? 'panelOpen' : 'panelClosed'}`}>
            <Modal isOpen={modalOpen} onClose={closeModal} onSubmit={handleSubmit}>
                <form>
                    <div className="add-event-input">
                        <input type="text" placeholder="Nombre Del Evento" className="event-name" name="eventName" onChange={handleInputChange} />
                    </div>
                    <div className="add-event-input">
                        <input type="text" placeholder="Nombre Del Encargado del Evento" className="event-manager-name" name="eventManagerName" onChange={handleInputChange} />
                    </div>
                    <div className='time_start_finish'>
                        <div className="add-event-input">
                            <input type="text" placeholder="Hora de Inicio Estimada" className="event-time-from" name="eventTimeFrom" onChange={handleInputChange} />
                        </div>
                        <div style={{ width: "30%" }}></div>
                        <div className="add-event-input">
                            <input type="text" placeholder="Hora de Fin Estimada" className="event-time-to" name="eventTimeTo" onChange={handleInputChange} />
                        </div>
                    </div>
                    <div>
                        <label id='options'>De los siguientes servicios selecciona los que necesites:</label>
                        <div className="checklist">
                            <div><input type="checkbox" id="screen" name="pantallas" value="Pantallas" checked={isChecked.screen} onChange={handleCheckboxChange} /> Pantallas</div>
                            <div><input type="checkbox" id="tripie" name="tripie" value="Tripié" checked={isChecked.tripie} onChange={handleCheckboxChange} /> Tripié</div>
                            <div><input type="checkbox" id="microfonos" name="microfonos" value="Microfonos" checked={isChecked.microfonos} onChange={handleCheckboxChange} /> Microfonos</div>
                            <div><input type="checkbox" id="proyectores" name="proyectores" value="Proyectores" checked={isChecked.proyectores} onChange={handleCheckboxChange} /> Proyectores</div>
                            <div><input type="checkbox" id="bocina" name="bocina" value="Bocina" checked={isChecked.bocina} onChange={handleCheckboxChange} /> Bocina</div>
                            <div><input type="checkbox" id="eqconfe" name="equipoVideoconferencia" value="Equipo de Videoconferencia" checked={isChecked.eqconfe} onChange={handleCheckboxChange} /> Equipo de Videoconferencia</div>
                            <div><input type="checkbox" id="extension" name="extension" value="Extensión" checked={isChecked.extension} onChange={handleCheckboxChange} /> Extensión</div>
                            <div><input type="checkbox" id="laptop" name="laptop" value="Laptop" checked={isChecked.laptop} onChange={handleCheckboxChange} /> Laptop</div>
                        </div>
                    </div>
                    <div className="num_persons">
                        <label htmlFor="numPonentes">¿Cuántos Ponentes Asistirán?:</label>
                        <select name="numPonentes" id="numPonentes" onChange={handleNumPonentesChange}>
                            {[...Array(10)].map((_, index) => (
                                <option key={index + 1} value={index + 1}>{index + 1}</option>
                            ))}
                        </select>
                    </div>
                    {/* Genera los campos de ponentes dinámicamente respecto al numero de ponentes seleccionado */}
                    <div id="speakerFieldsContainer">
                        {generateSpeakerFields()}
                    </div>
                </form>
                {loading && <div className="loading-screen">Guardando Evento...</div>} {/* Muestra la pantalla de carga si loading es true */}
                {successMessage && <div className="success-message">¡El evento se ha guardado correctamente!</div>} {/* Muestra el mensaje de éxito si successMessage es true */}
            </Modal>
            <div id='selected_date'>{selectedDate}</div>
            <div id='registered_events'>Eventos Registrados</div>
            <div className='events_container'>
                {eventosEnFechaSeleccionada.length === 0 ? (
                    <div id='cards_events'>Sin Eventos Registrados</div>
                ) : (
                    <div className="card-container">
                        {eventosEnFechaSeleccionada.map(evento => (
                            <Card key={evento.id} className="event-card" onClick={showDetails(evento)}>
                                <Card.Body>
                                    <Card.Title>{evento.title}</Card.Title>
                                    <Card.Text>Horario: {evento.extendedProps.timeStart} - {evento.extendedProps.timeEnd}</Card.Text>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <button id='btn_new_event' onClick={openModal}>Registrar Evento</button>
        </div>
    );
}

export default EventPanel;
