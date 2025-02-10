import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import setupParkingLotRoutes from '../backend/route/parkingLotsRoutes.js';

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());


setupParkingLotRoutes(app);

const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

export { app, server };