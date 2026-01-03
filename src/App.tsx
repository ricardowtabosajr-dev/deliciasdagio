import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { PublicHome } from './pages/PublicHome';
import { Dashboard } from './pages/admin/Dashboard';
import { Orders } from './pages/admin/Orders';
import { Products } from './pages/admin/Products';
import { CreateProduct } from './pages/admin/CreateProduct';
import { Login as AdminLogin } from './pages/admin/Login';
import { ConfirmDelivery } from './pages/ConfirmDelivery';
import { AdminLayout } from './components/AdminLayout';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAdminAuth, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!isAdminAuth) return <Navigate to="/admin/login" replace />;

    return <>{children}</>;
};

export const App: React.FC = () => {
    return (
        <StoreProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<PublicHome />} />
                    <Route path="/confirm" element={<ConfirmDelivery />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <Dashboard />
                            </AdminLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/products" element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <Products />
                            </AdminLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/products/new" element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <CreateProduct />
                            </AdminLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/products/edit/:id" element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <CreateProduct />
                            </AdminLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/orders" element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <Orders />
                            </AdminLayout>
                        </ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </StoreProvider>
    );
};
