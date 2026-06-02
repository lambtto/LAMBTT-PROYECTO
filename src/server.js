const { app } = require('./app');

// Render inyecta el puerto dinámico en la variable process.env.PORT. Si no existe (en local), usa el 3000.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});