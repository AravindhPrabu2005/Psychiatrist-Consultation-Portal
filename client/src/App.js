import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignupPage from './components/Signup';
import LoginPage from './components/Loginpage';
import AdminSignupPage from './components/AdminSignup';
import AdminHome from './components/admin/AdminHome';
import Userhome from './components/user/Userhome';
import AdminProfile from './components/admin/AdminProfile';
import UserProfile from './components/user/UserProfile';
import AllPsychiatrists from './components/user/AllPsychiatrists';
import About from './components/user/about';
import ContactUs from './components/user/Contact';
import BookingPage from './components/user/BookingPage';
import SlotManagement from './components/admin/SlotManagement';
import BookRequests from './components/admin/BookRequests';
import Appointments from './components/admin/Appointments';
import LandingPage from './components/Hero';
import Approved from './components/user/Approved';
import Chatbot from './components/user/Chatbot';
import UserMessenger from './components/user/UserMessenger';
import AdminMessenger from './components/admin/AdminMessenger';


const App = () => {

    return (
        <Router>
            <Routes>
                {/* common routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/user/signup" element={<SignupPage />} />
                <Route path="/admin/Signup" element={<AdminSignupPage />} />
                <Route path="/" element={<LandingPage /> } />   

                {/* admin routes */}
                <Route path="/admin/home" element={<AdminHome />} />
                <Route path="/admin/:id" element={<AdminProfile /> } />
                <Route path="/admin/slots" element={<SlotManagement /> } />
                <Route path="/admin/requests" element={<BookRequests /> } />
                <Route path="/admin/appointments" element={<Appointments /> } />
                <Route path='/admin/messenger' element={<AdminMessenger/> } />

                {/* user routes */}
                <Route path="/user/home" element={<Userhome />} />
                <Route path="/user/:id" element={<UserProfile /> } />
                <Route path="/user/doctors" element={<AllPsychiatrists /> } />
                <Route path="/user/about" element={<About /> } />
                <Route path="/user/contact" element={<ContactUs /> } />
                <Route path="/user/book/:id" element={<BookingPage /> } />
                <Route path="/user/approved" element={<Approved /> } />
                <Route path='/user/chatbot' element={<Chatbot/> } />
                <Route path='/user/messenger' element={<UserMessenger/> } />
                
            </Routes>
        </Router>
    );
};

export default App;
