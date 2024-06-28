import React, { useState, useEffect } from 'react';
import './PanelEvents.css';
import Modal from '../Modal_New_Event/ModalNewEvent';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { query, where } from 'firebase/firestore';
import db from '../../firebase';
import Card from 'react-bootstrap/Card';
import emailjs from '@emailjs/browser';



const EventPanel = ({ isOpen, selectedDate, selectedDate2, eventosEnFechaSeleccionada }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [numPonentes, setNumPonentes] = useState(1);
    const [isChecked, setIsChecked] = useState({
        Pantallas: false,
        Tripie: false,
        Micrófonos: false,
        Proyectores: false,
        Bocina: false,
        equipoVideoconferencia: false,
        Extension: false,
        Laptop: false,
        AsistenciaTécnica: false
    });
    const [eventData, setEventData] = useState({
        eventName: '',
        eventManagerName: '',
        eventTimeFrom: '',
        eventTimeTo: '',
        services: [],
        speakers: []
    });
    const [selectedSpace, setSelectedSpace] = useState(''); // Estado para almacenar el espacio seleccionado
    const [horariosDisponibles, setHorariosDisponibles] = useState([]); // Estado para almacenar los horarios disponibles del espacio seleccionado
    const [selectedHorarios, setSelectedHorarios] = useState([]); // Estado para almacenar los horarios seleccionados
    const [salones, setSalones] = useState([]);
    useEffect(() => {
        const fetchSalones = async () => {
            // No es necesario consultar Firebase para los salones estáticos definidos arriba
            setSalones(['Salon 1', 'Auditorio', 'Aula Híbrida']);
        };

        fetchSalones();
    }, []);
    //Con esta funcion se recupera los salones
    useEffect(() => {
        const fetchSalones = async () => {
            try {
                const salonesCollection = collection(db, 'salones');
                const snapshot = await getDocs(salonesCollection);
                const salonesData = snapshot.docs.map(doc => doc.id);
                setSalones(salonesData);
            } catch (error) {
                console.error('Error fetching salones: ', error);
            }
        };

        fetchSalones();
    }, []);
    const [loading, setLoading] = useState(false); // Nuevo estado para controlar la carga
    const [successMessage, setSuccessMessage] = useState(false); // Nuevo estado para mostrar el mensaje de éxito

    useEffect(() => {
        const selectedServices = Object.entries(isChecked)
            .filter(([key, value]) => value)
            .map(([key, value]) => key);
        setEventData(prevEventData => ({
            ...prevEventData,
            services: selectedServices
        }));
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


    const handleSpaceChange = async (event) => {
        const space = event.target.value;
        if (space === '') {
            // Si se selecciona la opción 'Seleccione un espacio', limpiar los horarios disponibles
            setHorariosDisponibles([]);
            setSelectedSpace('');
            setSelectedHorarios([]);
            return;
        }

        setSelectedSpace(space);

        // Generar horarios de ejemplo (de 8:00 a 20:59 con intervalo de 1 hora)
        const horarios = [];
        let hora = 8;
        while (hora <= 20) {
            const horaInicio = hora.toString().padStart(2, '0');
            const horaFin = hora.toString().padStart(2, '0');
            horarios.push(`${horaInicio}:00 - ${horaFin}:59`);
            hora++;
        }

        try {
            // Consultar eventos en Firestore para el espacio y fecha seleccionados
            const eventsCollection = collection(db, 'events');
            const q = query(eventsCollection,
                where(`eventData.selectedSpace`, '==', space),
                where('date', '==', selectedDate2)
            );
            const querySnapshot = await getDocs(q);

            // Obtener los horarios ocupados de los eventos en Firestore
            let selectedHorariosFirestore = [];
            querySnapshot.forEach((doc) => {
                const eventData = doc.data().eventData;
                selectedHorariosFirestore = selectedHorariosFirestore.concat(eventData.selectedHorarios);
            });

            // Filtrar los horarios disponibles para mostrar en la checklist
            const horariosDisponiblesFiltrados = horarios.filter(horario => !selectedHorariosFirestore.includes(horario));

            // Actualizar el estado de horariosDisponibles con los horarios filtrados
            setHorariosDisponibles(horariosDisponiblesFiltrados);
        } catch (error) {
            console.error('Error fetching events from Firestore: ', error);
        }
    };
    const handleHorarioChange = (event) => {
        const horario = event.target.value;
        if (selectedHorarios.includes(horario)) {
            setSelectedHorarios(selectedHorarios.filter(item => item !== horario));
        } else {
            setSelectedHorarios([...selectedHorarios, horario]);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Ordenar los horarios seleccionados para asegurarse de obtener el primero y el último correctamente
            const sortedHorarios = selectedHorarios.sort();

            // Obtener el horario más temprano (eventTimeFrom) antes del guion del primer intervalo
            const eventTimeFrom = sortedHorarios[0].split(' - ')[0];

            // Obtener el horario más tardío (eventTimeTo) después del guion del último intervalo
            const eventTimeTo = sortedHorarios[selectedHorarios.length - 1].split(' - ')[1];

            // Guardar los datos del evento en Firestore
            const docRef = await addDoc(collection(db, "events"), {
                date: selectedDate2,
                eventData: {
                    ...eventData,
                    selectedHorarios: selectedHorarios,
                    selectedSpace: selectedSpace,
                    eventTimeFrom: eventTimeFrom,
                    eventTimeTo: eventTimeTo
                },
            });
            // Enviar el correo electrónico usando EmailJS
            const templateParams = {
                selectedDate2: selectedDate2,
                eventName: eventData.eventName, // Asegúrate de que eventName esté en eventData
                eventManagerName: eventData.eventManagerName, // Asegúrate de que eventManagerName esté en eventData
            };

            emailjs.send('service_mwvoss9', 'template_j7kw3s2', templateParams, 'GJn-sdnYOhmMJ52vy')
                .then((response) => {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('Correo enviado exitosamente');
                }, (error) => {
                    console.log('FAILED...', error);
                    alert('Error al enviar el correo');
                });


            console.log("Documento creado con ID: ", docRef.id);
            setLoading(false);
            setSuccessMessage(true);

            // Restaurar la página después de un tiempo
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            console.error("Error al agregar documento: ", error);
            setLoading(false);
        }
    };
    const resetForm = () => {
        setIsChecked({
            Pantallas: false,
            Tripie: false,
            Micrófonos: false,
            Proyectores: false,
            Bocina: false,
            equipoVideoconferencia: false,
            Extension: false,
            Laptop: false,
            AsistenciaTécnica: false
        });
        setEventData({
            eventName: '',
            eventManagerName: '',
            eventTimeFrom: '',
            eventTimeTo: '',
            services: [],
            speakers: []
        });
        setSelectedSpace('');
        setSelectedHorarios([]);
        setSuccessMessage(false);
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
        setModalOpen(true);
        setHorariosDisponibles([]);
        setSelectedSpace('');
        setSelectedHorarios([]);
    };

    const showDetails = () => {
    }

    const closeModal = () => {
        setModalOpen(false);
        resetForm(); // Restablecer el formulario al cerrar el modal

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
                        <input type="text" placeholder="Email@example.com" className="event-manager-name" name="email" onChange={handleInputChange} />
                    </div>

                    <div style={{ display: 'none' }} className='time_start_finish'>
                        <div className="add-event-input">
                            <input type="text" placeholder="Hora de Inicio Estimada" className="event-time-from" name="eventTimeFrom" onChange={handleInputChange} readOnly />
                        </div>
                        <div style={{ width: "30%" }}></div>
                        <div className="add-event-input">
                            <input type="text" placeholder="Hora de Fin Estimada" className="event-time-to" name="eventTimeTo" onChange={handleInputChange} readOnly />
                        </div>
                    </div>
                    <div>
                        <select value={selectedSpace} onChange={handleSpaceChange}>
                            <option value="">Seleccione un espacio</option>
                            {salones.map((salon, index) => (
                                <option key={index} value={salon}>{salon}</option>
                            ))}
                        </select>
                    </div>
                    <div className='titulo-container'>
                        <label className='titulo'>Seleccione horarios disponibles:</label>
                        <div className="checklist">
                            {horariosDisponibles.map(horario => (
                                <div key={horario}>
                                    <input
                                        type="checkbox"
                                        id={horario}
                                        name={horario}
                                        value={horario}
                                        checked={selectedHorarios.includes(horario)}
                                        onChange={handleHorarioChange}
                                    />
                                    <label htmlFor={horario}>{horario}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label id='options'>De los siguientes servicios selecciona los que necesites:</label>
                        <div className="checklist">
                            <div><input type="checkbox" id="screen" name="Pantallas" value="Pantallas" checked={isChecked.screen} onChange={handleCheckboxChange} /> Pantallas</div>
                            <div><input type="checkbox" id="tripie" name="Tripié" value="Tripié" checked={isChecked.tripie} onChange={handleCheckboxChange} /> Tripié</div>
                            <div><input type="checkbox" id="microfonos" name="Micrófonos" value="Microfonos" checked={isChecked.microfonos} onChange={handleCheckboxChange} /> Microfonos</div>
                            <div><input type="checkbox" id="proyectores" name="Proyectores" value="Proyectores" checked={isChecked.proyectores} onChange={handleCheckboxChange} /> Proyectores</div>
                            <div><input type="checkbox" id="bocina" name="Bocina" value="Bocina" checked={isChecked.bocina} onChange={handleCheckboxChange} /> Bocina</div>
                            <div><input type="checkbox" id="eqconfe" name="Equipo de Videoconferencia" value="Equipo de Videoconferencia" checked={isChecked.eqconfe} onChange={handleCheckboxChange} /> Equipo de Videoconferencia</div>
                            <div><input type="checkbox" id="extension" name="Extension" value="Extensión" checked={isChecked.extension} onChange={handleCheckboxChange} /> Extensión</div>
                            <div><input type="checkbox" id="laptop" name="Laptop" value="Laptop" checked={isChecked.laptop} onChange={handleCheckboxChange} /> Laptop</div>
                            <div><input type="checkbox" id="asistenciaTecnica" name="Asistencia Técnica" value="Asistencia Técnica" checked={isChecked.AsistenciaTecnica} onChange={handleCheckboxChange} /> Asistencia Técnica</div>

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
                                    <Card.Text>Lugar: {evento.extendedProps.place}</Card.Text>

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
