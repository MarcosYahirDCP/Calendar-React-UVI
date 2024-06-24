/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNotificationOnNewEvent = functions.firestore
    .document('events/{eventId}')
    .onCreate(async (snap, context) => {
        const event = snap.data();
        
        // Obtener los tokens de FCM
        const tokensSnapshot = await admin.firestore().collection('fcmTokens').get();
        const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

        if (tokens.length === 0) {
            console.log('No tokens found.');
            return;
        }

        // Crear la carga de la notificación
        const payload = {
            notification: {
                title: 'Nuevo Evento Registrado',
                body: `Evento: ${event.title}`,
            }
        };

        // Enviar la notificación a todos los tokens
        try {
            const response = await admin.messaging().sendToDevice(tokens, payload);
            console.log('Successfully sent message:', response);
        } catch (error) {
            console.log('Error sending message:', error);
        }
    });


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
