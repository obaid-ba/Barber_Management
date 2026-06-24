import { User } from "../models/user.model.js";
import {Appointment} from "../models/appointment.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Service } from "../models/service.model.js";
import { Op } from "sequelize";



export const login = async(req, res) => {
  try {
    const {email, pwd} = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const validPassword = await bcrypt.compare(pwd, user.pwd);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      {id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
export const logout = async(req, res) => {
  try {
    console.log(res)
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
export const signup = async(req, res) => {
  try {
    const {firstName , lastName , email , phone , pwd } = req.body;
    // check if user already exists
    console.log(req.body);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return  res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      pwd: await bcrypt.hash(pwd, salt),
      role: 'client'
    });
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.status(201).json({
      message: 'User created successfully' , 
      token ,
      user: 
      {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      } });
  }catch (error) {
    console.error('Error creating user signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
export const appointment = async(req, res) => {
  try{
    const {firstName, lastName, phone, email ,appointmentDate,appointmentTime, service,message} = req.body
    // validate requied fields 
    // if(!firstName || !lastName || !phone || !email || !appointmentDate || !appointmentTime  || !service || !message){
    //   return res.status(400).json({message: 'All fields are required'})
    // }
    const day = new Date(appointmentDate)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const appointmentDay = days[day.getDay()];
    //Check if time slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        appointmentDate: day,
        appointmentTime,
        status: { [Op.ne]: 'Cancelled' },
      },
    });
    if(existingAppointment){
      return res.status(400).json({message: 'This Time is already booked, please choose another time slot'})
    }
    // Link to an existing client account: the logged-in user, or a user matching the email.
    let userId = req.user?.id || null;
    if (!userId && email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) userId = existingUser._id;
    }
    //create new appintment
    const newAppointment = await Appointment.create({
      firstName,
      lastName,
      phone,
      email,
      appointmentDate: day,
      appointmentDay,
      appointmentTime,
      service,
      message: message || '',
      status:'Pending',
      userId,
    });
    res.status(201).json({message: 'Appointment created successfully', appointment: newAppointment});
  }catch (error) {
    console.error('Error creating user appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAppointments = async(req, res) => {
  try {
    const appointments = await Appointment.findAll({
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
    });
    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAppointmentStatus = async(req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }
    const [updatedCount] = await Appointment.update({ status }, { where: { _id: id } });
    if (!updatedCount) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const updatedAppointment = await Appointment.findByPk(id);
    res.status(200).json({ message: 'Appointment status updated successfully', appointment: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAppointment = async(req, res) => {
  try {
    const { id } = req.params;
    const deletedAppointment = await Appointment.destroy({ where: { _id: id } });
    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Service Controllers
export const createService = async(req, res) => {
  try{
    const {name, duration, price} = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and Price are required' });
    }
    const findService = await Service.findOne({ where: { name } });
    if (findService) {
      return res.status(400).json({ message: 'Service already exists' });
    }
    const newService = await Service.create({
      name,
      duration: duration || 30,
      price
    });
    res.status(201).json({message: 'Service created successfully', service: newService});
  }catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  } 
}
export const getServices = async(req, res) => {
  try{
    const services = await Service.findAll();
    res.status(200).json({services});
  }catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error' });
  } 
}
export const deleteService = async(req, res) => {
  try{
    const {id} = req.params;
    const deletedService = await Service.destroy({ where: { _id: id } });
    if(!deletedService){
      return res.status(404).json({message: 'Service not found'});
    }
    res.status(200).json({message: 'Service deleted successfully'});
  }catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal server error' });
  } 
}
export const updateService = async(req, res) => {
  try{
    const {id} = req.params;
    const { name, duration, price} = req.body;
    const [updatedCount] = await Service.update({name, duration, price}, { where: { _id: id } });
    if(!updatedCount){
      return res.status(404).json({message: 'Service not found'});
    }
    const updatedService = await Service.findByPk(id);
    res.status(200).json({message: 'Service updated successfully', service: updatedService});
  }catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Client Controllers
export const getClients = async(req, res) => {
  try {
    const clients = await User.findAll({
      where: { role: 'client' },
      attributes: { exclude: ['pwd'] },
    });
    res.status(200).json({ clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createClient = async(req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingClient = await User.findOne({ where: { email } });
    if (existingClient) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = 'DefaultPassword123';
    const newClient = await User.create({
      firstName,
      lastName,
      email,
      phone,
      pwd: await bcrypt.hash(defaultPassword, salt),
      role: 'client'
    });

    const clientData = newClient.toJSON();
    delete clientData.pwd;
    
    res.status(201).json({ 
      message: 'Client created successfully', 
      client: clientData 
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateClient = async(req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    const [updatedCount] = await User.update(
      { firstName, lastName, email, phone },
      { where: { _id: id } }
    );

    if (!updatedCount) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const updatedClient = await User.findByPk(id, {
      attributes: { exclude: ['pwd'] },
    });

    res.status(200).json({
      message: 'Client updated successfully',
      client: updatedClient
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteClient = async(req, res) => {
  try {
    const { id } = req.params;

    const deletedClient = await User.destroy({ where: { _id: id } });

    if (!deletedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};