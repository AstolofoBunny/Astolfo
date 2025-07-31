import React, { useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBlc9uBfGYL1RNBh9-oMIqNKTwcfcWkt7c",
  authDomain: "astolfo-podval4k.firebaseapp.com",
  projectId: "astolfo-podval4k",
  storageBucket: "astolfo-podval4k.firebasestorage.app",
  messagingSenderId: "318980963399",
  appId: "1:318980963399:web:2208221794760fac250562",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Auth: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const register = async () => {
    setMessage("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Регистрация успешна!");
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const login = async () => {
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Вход успешен!");
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setMessage("Вы вышли из системы");
  };

  return (
    <div style={{ maxWidth: 300, margin: "auto" }}>
      <h2>Firebase Auth</h2>
      {user ? (
        <>
          <p>Привет, {user.email}</p>
          <button onClick={logout}>Выйти</button>
        </>
      ) : (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button onClick={register} style={{ marginRight: 8 }}>
            Зарегистрироваться
          </button>
          <button onClick={login}>Войти</button>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Auth;
