import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Clock, 
  Users, 
  BarChart3, 
  Smartphone,
  Monitor,
  Star,
  ChevronRight,
  Package,
  Globe,
  Shield,
  Zap
} from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Truck,
      title: "Smart Route Optimization",
      description: "AI-powered route planning for maintenance, repair, and recurring service visits that reduces travel time and operational costs by up to 30%.",
      stats: "30% faster service delivery"
    },
    {
      icon: MapPin,
      title: "Real-time Service Tracking",
      description: "Monitor your field service teams and maintenance schedules in real-time with GPS tracking and live service updates.",
      stats: "99.9% tracking accuracy"
    },
    {
      icon: BarChart3,
      title: "Service Analytics",
      description: "Comprehensive dashboards and reports to optimize your recurring service operations and maintenance schedules.",
      stats: "25% cost reduction"
    },
    {
      icon: Users,
      title: "Customer Service Management",
      description: "Complete customer relationship management with service preferences, maintenance history, and recurring appointment scheduling.",
      stats: "40% higher satisfaction"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Operations Manager, TechMaintenance Pro",
      rating: 5,
      comment: "DisPath transformed our field service operations. We've seen a 35% improvement in efficiency for our recurring maintenance routes."
    },
    {
      name: "Michael Chen",
      role: "CEO, Premium HVAC Services",
      rating: 5,
      comment: "The real-time tracking and route optimization features have revolutionized how we manage our HVAC maintenance schedules."
    },
    {
      name: "Emily Rodriguez",
      role: "Service Dispatcher, CleanCorp Solutions",
      rating: 5,
      comment: "Perfect for managing our cleaning service routes. Our technicians love the mobile app, and customers appreciate knowing when we'll arrive."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DisPath</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Optimize Your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {" "}Service Routes
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  DisPath is the complete service management platform that helps businesses 
                  optimize recurring service routes, manage maintenance schedules, and deliver exceptional field services.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg font-semibold shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-lg font-semibold">
                  Watch Demo
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-gray-600">Service Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-gray-600">Daily Service Visits</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">99.8%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                {/* Dashboard Preview */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="ml-4 text-sm text-gray-600">DisPath Dashboard</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
                      <div className="text-sm text-gray-500">Welcome to DisPath logistics management system</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Total Customers</div>
                            <div className="text-2xl font-bold text-gray-900">2</div>
                          </div>
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Active Routes</div>
                            <div className="text-2xl font-bold text-gray-900">3</div>
                          </div>
                          <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Route completed</div>
                          <div className="text-xs text-gray-600">Downtown Express - 3 deliveries</div>
                        </div>
                        <span className="text-xs text-gray-500">2 min ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">New customer added</div>
                          <div className="text-xs text-gray-600">Sarah Wilson - North York</div>
                        </div>
                        <span className="text-xs text-gray-500">15 min ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile App Preview */}
              <div className="absolute -bottom-8 -right-8 z-20">
                <div className="bg-white rounded-3xl shadow-xl border-8 border-gray-100 w-64">
                  <div className="bg-gray-900 h-6 rounded-t-2xl flex items-center justify-center">
                    <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="p-4">
                    <div className="text-lg font-bold text-gray-900 mb-2">Your Deliveries</div>
                    <div className="text-sm text-gray-500 mb-4">1 of 3 Deliveries</div>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold text-gray-900">Order #3241</div>
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Delivered
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Recipient: Alice Johnson</div>
                          <div className="text-blue-600">123 Main Street, New York, NY</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold text-gray-900">Order #3242</div>
                          <div className="flex items-center gap-1 text-orange-600 text-sm">
                            <Clock className="w-4 h-4" />
                            In-progress
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Recipient: Bob Smith</div>
                          <div className="text-blue-600">456 Elm Avenue, Brooklyn, NY</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Elements */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100 rounded-full opacity-50"></div>
              <div className="absolute -bottom-10 -left-5 w-20 h-20 bg-indigo-100 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage field services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From recurring maintenance to on-demand repairs, DisPath provides all the tools 
              you need to run an efficient service operation with optimized routes and scheduling.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all ${
                    activeFeature === index
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      activeFeature === index ? 'bg-blue-600' : 'bg-gray-400'
                    }`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{feature.description}</p>
                      <div className="text-sm font-semibold text-blue-600">
                        {feature.stats}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Multi-Platform Access</h3>
                  <div className="flex space-x-2">
                    <Monitor className="w-6 h-6" />
                    <Smartphone className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-blue-100 mb-8">
                  Access DisPath from anywhere with our responsive web dashboard 
                  and dedicated mobile apps for field technicians and service customers.
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm text-blue-200">Support</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">99.9%</div>
                    <div className="text-sm text-blue-200">Uptime</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">50+</div>
                    <div className="text-sm text-blue-200">Integrations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Preview Section */}
      <section id="dashboard" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Dashboard & Mobile Apps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the full power of DisPath with our intuitive web dashboard 
              and mobile applications designed for service teams, technicians, and customers.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Web Dashboard */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-800 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="ml-4 text-white text-sm">dashboard.dispath.com</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Service Management Dashboard</h3>
                    <p className="text-gray-600">Real-time insights into your field service operations</p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                      <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">2</div>
                      <div className="text-sm text-gray-600">Customers</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                      <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">3</div>
                      <div className="text-sm text-gray-600">Service Routes</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-100">
                      <Package className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">2</div>
                      <div className="text-sm text-gray-600">Service Orders</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-100">
                      <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">2</div>
                      <div className="text-sm text-gray-600">Scheduled</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div className="flex-1 text-sm">Service completed - HVAC Maintenance Route</div>
                        <span className="text-xs text-gray-500">2 min ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div className="flex-1 text-sm">New service client - Wilson Manufacturing</div>
                        <span className="text-xs text-gray-500">15 min ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile App */}
            <div className="flex justify-center">
              <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="bg-white rounded-3xl w-80 overflow-hidden">
                  <div className="bg-white p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Truck className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Technician App</h3>
                      <p className="text-gray-600">Your Service Assignments</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-900">Service #3241</span>
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Wilson Manufacturing</div>
                          <div className="text-blue-600">HVAC Maintenance - Unit 4A</div>
                          <div className="mt-2 text-xs">Service: High Priority</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-900">Service #3242</span>
                          <div className="flex items-center gap-1 text-orange-600 text-sm">
                            <Clock className="w-4 h-4" />
                            In-progress
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>TechCorp Office</div>
                          <div className="text-blue-600">Network Equipment Check</div>
                          <div className="mt-2 text-xs">ETA: 15:10</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-900">Service #3243</span>
                          <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <Clock className="w-4 h-4" />
                            Scheduled
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Metro Building Complex</div>
                          <div className="text-blue-600">Elevator Maintenance - Floor 12</div>
                          <div className="mt-2 text-xs">Scheduled: 16:00</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by service professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our service industry customers have to say about DisPath
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to optimize your service operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of service businesses already using DisPath to improve their field operations.
            Perfect for maintenance services, cleaning companies, repair services, and recurring service management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg font-semibold shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-lg font-semibold">
              Schedule Demo
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="w-8 h-8 text-blue-200 mx-auto mb-2" />
              <div className="text-white font-semibold">Enterprise Security</div>
              <div className="text-blue-200 text-sm">Bank-level encryption</div>
            </div>
            <div>
              <Globe className="w-8 h-8 text-blue-200 mx-auto mb-2" />
              <div className="text-white font-semibold">Global Coverage</div>
              <div className="text-blue-200 text-sm">Available worldwide</div>
            </div>
            <div>
              <Zap className="w-8 h-8 text-blue-200 mx-auto mb-2" />
              <div className="text-white font-semibold">Quick Setup</div>
              <div className="text-blue-200 text-sm">Ready in minutes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DisPath</span>
              </div>
              <p className="text-gray-400">
                The complete logistics management platform for modern delivery operations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DisPath. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
