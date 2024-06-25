import React, { useState, useEffect } from 'react';
import Calendar from "./components/Calendar_component/Calendar";
import './App.css';

function App() {
  const [warningModalIsOpen, setWarningModalIsOpen] = useState(true);

  const closeWarningModal = () => {
    setWarningModalIsOpen(false);
  };

  useEffect(() => {
    // Aquí puedes realizar cualquier acción adicional al montar el componente
  }, []);

  return (
    <div className="App">
      <div className="calendar_container">
        <Calendar />
      </div>
      {warningModalIsOpen && (
        <div className="warning-modal-overlay">
          <div className="warning-modal">
            <div className="modal-content">
              <div className="warning-icon">⚠️</div>
              <h2>Recordatorio</h2>
              <p>Verifica los datos de tu registro antes de enviarlo. Cualquier modificación se deberá hacer bajo trámite directamente con el área designada.</p>
              <button onClick={closeWarningModal}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
