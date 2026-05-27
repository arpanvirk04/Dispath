import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../../services/authService.js";

const Register = () => {
    const navigate = useNavigate();
    // Common fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CUSTOMER");

    // Role-specific fields
    const [address, setAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [vehicleId, setVehicleId] = useState("");
    const [department, setDepartment] = useState("");

    // For form handling
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const userData = {
                firstName,
                lastName,
                email,
                password,
                role
            };

            // Add role-specific fields
            if (role === "CUSTOMER") {
                userData.address = address;
                userData.phoneNumber = phoneNumber;
            } else if (role === "DRIVER") {
                userData.licenseNumber = licenseNumber;
                userData.vehicleId = vehicleId;
            } else if (role === "DISPATCHER") {
                userData.department = department;
            }

            const response = await authService.register(userData);
            navigate("/login", { state: { message: "Registration successful. Please login." } });
        } catch (error) {
            setError(error.response?.data || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Common fields */}
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="CUSTOMER">Customer</option>
                        <option value="DRIVER">Driver</option>
                        <option value="DISPATCHER">Dispatcher</option>
                    </select>
                </div>

                {/* Conditional fields based on role */}
                {role === "CUSTOMER" && (
                    <>
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                {role === "DRIVER" && (
                    <>
                        <div className="form-group">
                            <label>License Number</label>
                            <input
                                type="text"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Vehicle ID</label>
                            <input
                                type="text"
                                value={vehicleId}
                                onChange={(e) => setVehicleId(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                {role === "DISPATCHER" && (
                    <div className="form-group">
                        <label>Department</label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                        />
                    </div>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            <div className="login-link">
                Already have an account? <span onClick={() => navigate("/login")}>Login</span>
            </div>
        </div>
    );
};

export default Register;