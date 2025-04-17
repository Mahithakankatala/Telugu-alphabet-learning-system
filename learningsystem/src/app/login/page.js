'use client';

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import axios from "../../utils/api"; 
import styles from "./login.module.css"; 
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', {
        email: formData.email,
        password: formData.password,
      });
      if (response.status === 200) {
        localStorage.setItem('user', JSON.stringify({ email: formData.email }));
        router.push('/learn');
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message || 'Error logging in');
    }
  };

  const handleSignUpRedirect = () => {
    router.push('/signup'); 
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h1 className={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.passwordContainer}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.input}
              />
              <button
                type="button"
                className={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.button}>Log In</button>
        </form>

        {message && (
          <p className={`${styles.message} ${message.includes('success') ? styles.success : styles.error}`}>
            {message}
          </p>
        )}

        <p className={styles.signupText}>
          New here?{" "}
          <button onClick={handleSignUpRedirect} className={styles.signupButton}>Sign Up</button>
        </p>
      </div>
    </div>
  );
}
