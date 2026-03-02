/**
 * constants/sports.js
 *
 * Define la lista de deportes disponibles en GymRat.
 * Cada deporte tiene:
 *   - id: identificador único usado en la base de datos.
 *   - name: nombre mostrado al usuario.
 *   - icon: emoji representativo.
 *   - color: clase Tailwind para el color de fondo del icono.
 *   - unit: (opcional) unidad de distancia (km, m, etc.).
 *   - step: (opcional) incremento del input de distancia.
 *
 * Para añadir un nuevo deporte, simplemente añade un objeto a este array.
 */
export const SPORTS = [
    { id: 'running', name: 'Correr', icon: '🏃‍♂️', color: 'bg-blue-500', unit: 'km', step: 0.1 },
    { id: 'gym', name: 'Gimnasio', icon: '🏋️‍♀️', color: 'bg-purple-500' },
    { id: 'cycling', name: 'Ciclismo', icon: '🚴', color: 'bg-emerald-500', unit: 'km', step: 1 },
    { id: 'swimming', name: 'Natación', icon: '🏊‍♂️', color: 'bg-cyan-500', unit: 'm', step: 50 },
    { id: 'playbacks', name: 'Playbacks', icon: '💃', color: 'bg-pink-500' },
    { id: 'rugby', name: 'Rugby', icon: '🏉', color: 'bg-orange-500' },
    { id: 'b3b', name: 'B3B', icon: '🥊', color: 'bg-red-500' },
    { id: 'esquí', name: 'Esquí', icon: '⛷️', color: 'bg-blue-500', unit: 'km', step: 1 },
    { id: 'pádel', name: 'Pádel', icon: '🎾', color: 'bg-green-500' },
];
