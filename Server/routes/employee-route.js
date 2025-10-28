import express from "express";
import { addEmployee, getEmployees, deleteEmployee } from "../controllers/employee-controller.js";
import { protect } from "../middlewares/protect.js";

const employeeRouter = express.Router();

employeeRouter.post('/add-employee', addEmployee);
employeeRouter.get('/get-employees', getEmployees);
employeeRouter.delete('/delete-employee/:CID', deleteEmployee);

export default employeeRouter;