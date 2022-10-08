import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Service worker register

// const registerServiceWorker = async () => {
//   if ("serviceWorker" in navigator) {
//     try {
//       const registration = await navigator.serviceWorker.register("./serviceWorker.js", {
//         scope: "/",
//       });
//       if (registration.installing) {
//         console.log("Service worker installing");
//       } else if (registration.waiting) {
//         console.log("Service worker installed");
//       } else if (registration.active) {
//         console.log("Service worker active");
//       }
//     } catch (error) {
//       console.error(`Registration failed with ${error}`);
//     }
//   }
// };

// registerServiceWorker();

// Notification
// const now = new Date()
// const reservedTime = now.getTime() + 10000
// function showNotification() {
//   Notification.requestPermission((result) => {
//     if (result === 'granted') {
//       navigator.serviceWorker.ready.then((registration) => {
//         const options = {
//           body: 'Buzz! Buzz!',
//           icon: './logo192.png',
//           vibrate: [200, 100, 200, 100, 200, 100, 200],
//           tag: 'vibration-sample',
//           //timestamp: reservedTime
//           // @ts-ignore
//           showTrigger: new TimestampTrigger(reservedTime),
//         }
//         registration.showNotification('Vibration Sample', options);
//       });
//     }
//   });
// }

// showNotification();
