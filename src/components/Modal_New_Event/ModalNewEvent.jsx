import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, onSubmit, children }) => {
    //En esta seccion va el código relacionado con la interaccion de los componentes en javascript
    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal">
                    <button className="close-btn" onClick={onClose}>X</button>
                    <div className="modal-content">
                        <strong><h2>Datos del Evento</h2></strong>
                        {children}
                    </div>
                    <div><button type='button' className="registrar-btn" onClick={onSubmit}>Registrar</button></div>
                </div>
            </div>
        )
    );
}

export default Modal;
