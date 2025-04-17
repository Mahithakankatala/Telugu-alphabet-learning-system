'use client';

import { useState } from 'react';
import axios from '../../utils/api';
import styles from './signup.module.css';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { Eye, EyeOff } from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const router = useRouter(); // Initialize router

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'password') {
      checkPasswordQuality(e.target.value);
    }
  };

  // Password quality check function
  const checkPasswordQuality = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      setPasswordError("Password must be at least 8 characters long");
    } else if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
      setPasswordError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError) {
      setMessage("Please fix the password quality issues before submitting.");
      return;
    }

    try {
      const response = await axios.post('/signup', formData);
      setMessage('Account created successfully');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Error creating account');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h1 className={styles.title}>Sign Up</h1>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <label htmlFor="username" className={styles.label}>Username:</label>
          <input
            id="username"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className={styles.inputField}
            required
          />

          <label htmlFor="email" className={styles.label}>Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className={styles.inputField}
            required
          />

          <label htmlFor="password" className={styles.label}>Password:</label>
          <div className={styles.passwordContainer}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              className={styles.inputField}
              required
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {passwordError && <p className={styles.error}>{passwordError}</p>}
          <button type="submit" className={styles.submitButton}>
            Sign Up
          </button>
        </form>
        {message && <p className={message.includes("success") ? styles.success : styles.error}>{message}</p>}
      </div>
    </div>
  );
}
