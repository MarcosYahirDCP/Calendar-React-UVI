import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from "@fullcalendar/react";
import DayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import EventPanel from '../Panel_events/PanelEvents';
import './Calendar.css';
import esLocale from '@fullcalendar/core/locales/es';
import { obtenerDocumentos } from '../funtion';
import { format } from 'date-fns'




function Calendar() {
    const [eventosFirestore, setEventosFirestore] = useState([]);
    const [panelOpen, setPanelOpen] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDate2, setSelectedDate2] = useState(null); // Nuevo estado para el formato AAAA-MM-DD
    const [currentDate] = useState(new Date());
    const calendarRef = useRef(null);
    const [currentCell, setCurrentCell] = useState(null);
    const eventosEnFechaSeleccionada = eventosFirestore.filter(evento => evento.start === selectedDate2);

    useEffect(() => {
        const formattedDate = currentDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
        setSelectedDate(formattedDate);
        // Formato AAAA-MM-DD
        const formattedDate2 = format(currentDate, 'yyyy-MM-dd');
        setSelectedDate2(formattedDate2);
    }, [currentDate]);

    const handleDateClick = (arg) => {
        const date = new Date(arg.date);
        const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
        setSelectedDate(formattedDate);
        // Formato AAAA-MM-DD
        const formattedDate2 = format(date, 'yyyy-MM-dd');
        setSelectedDate2(formattedDate2);
        setPanelOpen(true);
        if (currentCell) {
            currentCell.style.backgroundColor = ''; // Restablece el color de la celda actual
            currentCell.style.color = 'black'
        }
        setCurrentCell(arg.dayEl); // Almacena la celda actual
        arg.dayEl.style.backgroundColor = '#3dcc6f'; // Cambia el color de la celda presionada a verde
        arg.dayEl.style.colorr = '#fffff';
    };

    const closePanel = () => {
        setPanelOpen(false);
    };

    const endMonth = (selectInfo) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.gotoDate(selectInfo.startStr);
    };

    useEffect(() => {
        const fetchEventosFirestore = async () => {
            try {
                const documentos = await obtenerDocumentos("events");
                const eventos = documentos.map(documento => ({
                    id: documento.id,
                    title: documento.eventData.eventName,
                    start:documento.date,
                    extendedProps: {
                        eventManager: documento.eventData.eventManagerName,
                        timeStart: documento.eventData.eventTimeFrom,
                        timeEnd: documento.eventData.eventTimeTo,
                        place: documento.eventData.selectedSpace
                    },
                }));
                console.log(eventos)
                setEventosFirestore(eventos);
            } catch (error) {
                console.error("Error al obtener documentos de Firestore:", error);
            }
        };

        fetchEventosFirestore();
    }, []);

    return (
        <div className='panelsContainer'>
            <div className='bodyCalendar' >
                <FullCalendar
                    ref={calendarRef}
                    plugins={[DayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={"dayGridMonth"}
                    headerToolbar={{
                        start: "today prev,next",
                        center: "title",
                        end: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    locales={['es']}
                    locale={esLocale}
                    height={'90vh'}
                    lang="es"
                    selectable={true}
                    dateClick={handleDateClick}
                    select={endMonth}
                    fixedWeekCount={false}
                    events={[
                        ...eventosFirestore,
                    ]}
                    displayEventTime={false}
                />
            </div>
            <div style={{ flex: panelOpen ? '1' : '0', overflowY: 'auto' }}>
                {/* Pasa ambos estados al componente EventPanel */}
                <EventPanel isOpen={panelOpen} onClose={closePanel} selectedDate={selectedDate} selectedDate2={selectedDate2} eventosEnFechaSeleccionada={eventosEnFechaSeleccionada} />
            </div>
        </div>
    );
}

export default Calendar;