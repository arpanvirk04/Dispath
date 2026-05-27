import React, { useState } from 'react';
import { Users, Route, TrendingUp, Clock, MapPin, Activity, Navigation } from 'lucide-react';
import { Card } from './ui/Card';
import ActiveRoutesView from './ActiveRoutesView';

const Dashboard = ({ stats, onNavigateToOrders, onNavigateToRoutes, onNavigateToCustomers, onNavigateToActiveRoutes }) => {
    const [showActiveRoutes, setShowActiveRoutes] = useState(false);

    if (showActiveRoutes) {
        return <ActiveRoutesView onBack={() => setShowActiveRoutes(false)} />;
    }

    const statCards = [
        {
            title: 'Total Customers',
            value: stats?.totalCustomers || 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            onClick: onNavigateToCustomers
        },
        {
            title: 'Total Routes',
            value: stats?.totalRoutes || 0,
            icon: Route,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            onClick: onNavigateToRoutes
        },
        {
            title: 'Active Routes',
            value: 3, // Mock number of active routes
            icon: Navigation,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            onClick: onNavigateToActiveRoutes
        },
        {
            title: 'Total Orders',
            value: stats?.totalOrders || 0,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            onClick: onNavigateToOrders
        },
        {
            title: 'Pending Orders',
            value: stats?.pendingOrders || 0,
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            onClick: onNavigateToOrders
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome to DisPath logistics management system</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card
                        key={index}
                        hover
                        className={`p-6 ${stat.onClick ? 'cursor-pointer transition-transform hover:scale-105' : ''}`}
                        onClick={stat.onClick}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        {stat.onClick && (
                            <div className="mt-4 text-sm text-blue-600 font-medium">
                                Click to view details →
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Route completed</p>
                                <p className="text-xs text-gray-600">Downtown Express - 3 deliveries</p>
                            </div>
                            <span className="text-xs text-gray-500">2 min ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">New customer added</p>
                                <p className="text-xs text-gray-600">Sarah Wilson - North York</p>
                            </div>
                            <span className="text-xs text-gray-500">15 min ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Route delayed</p>
                                <p className="text-xs text-gray-600">Midtown Circuit - Traffic congestion</p>
                            </div>
                            <span className="text-xs text-gray-500">1 hour ago</span>
                        </div>
                    </div>
                </Card>

                {/* Quick Stats */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Today's Overview</h3>
                        <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Routes in Progress</span>
                            <span className="text-xl font-bold text-blue-600">3</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Deliveries Completed</span>
                            <span className="text-xl font-bold text-green-600">12</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pending Deliveries</span>
                            <span className="text-xl font-bold text-amber-600">8</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Distance</span>
                            <span className="text-xl font-bold text-purple-600">142 km</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

