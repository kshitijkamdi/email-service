import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Compose from './pages/Compose.jsx';
import EmailDetail from './pages/EmailDetail.jsx';
import Inbox from './pages/Inbox.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Sent from './pages/Sent.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/inbox" replace />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/sent" element={<Sent />} />
      <Route path="/compose" element={<Compose />} />
      <Route path="/email/:id" element={<EmailDetail />} />
    </Route>
    <Route path="*" element={<Navigate to="/inbox" replace />} />
  </Routes>
);

export default App;
