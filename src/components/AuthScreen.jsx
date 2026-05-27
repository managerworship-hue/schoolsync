import React, { useState } from "react";

export default function AuthScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  const handleToggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError("");
    setName("");
    setPassword("");
    setConfirmPassword("");
  };

  const validateEmail = (emailStr) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const hashPassword = async (passwordStr) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(passwordStr);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Trim inputs
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Por favor, introduza um e-mail válido.");
      return;
    }

    // Get current registered users database
    let users = [];
    try {
      const savedUsers = localStorage.getItem("schoolsync_users");
      if (savedUsers && savedUsers !== "undefined" && savedUsers !== "null") {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed)) {
          users = parsed;
        }
      }
    } catch (e) {
      console.error("Erro ao ler base de utilizadores:", e);
    }

    // Deterministic user ID generation helper
    const getDeterministicUserId = (emailStr) => {
      return `user-${emailStr.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    };

    if (mode === "login") {
      // Find matching user
      let user = users.find((u) => u.email === trimmedEmail);

      if (user) {
        const hashedPassword = await hashPassword(trimmedPassword);
        const isLegacyPlainMatch = user.password === trimmedPassword;
        const isHashMatch = user.password === hashedPassword;

        if (isHashMatch || isLegacyPlainMatch) {
          // Atualização de segurança: Se for uma senha legada em texto simples, atualiza para hash SHA-256
          if (isLegacyPlainMatch) {
            user.password = hashedPassword;
            try {
              localStorage.setItem("schoolsync_users", JSON.stringify(users));
            } catch (e) {
              console.error("Erro ao atualizar palavra-passe para hash:", e);
            }
          }
          // Sucesso no login
          onLoginSuccess({ id: user.id, name: user.name, email: user.email }, rememberMe);
        } else {
          setError("E-mail ou palavra-passe incorretos.");
        }
      } else {
        setError("E-mail ou palavra-passe incorretos.");
      }
    } else {
      // Register Mode
      if (!trimmedName) {
        setError("Por favor, introduza o seu nome.");
        return;
      }

      if (trimmedPassword.length < 6) {
        setError("A palavra-passe deve ter pelo menos 6 caracteres.");
        return;
      }

      if (trimmedPassword !== confirmPassword.trim()) {
        setError("As palavras-passe introduzidas não coincidem.");
        return;
      }

      // Check if email already registered
      const existingUserIndex = users.findIndex((u) => u.email === trimmedEmail);
      if (existingUserIndex !== -1) {
        setError("Este endereço de e-mail já está registado.");
        return;
      }

      // Hash the password securely with SHA-256
      const hashedPassword = await hashPassword(trimmedPassword);

      // Create new user with deterministic ID
      const newUser = {
        id: getDeterministicUserId(trimmedEmail),
        name: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
      };

      // Add to local database
      users.push(newUser);
      try {
        localStorage.setItem("schoolsync_users", JSON.stringify(users));
        // Auto Login after successful registration
        onLoginSuccess({ id: newUser.id, name: newUser.name, email: newUser.email }, rememberMe);
      } catch (e) {
        setError("Erro ao guardar os dados do utilizador. O localStorage pode estar cheio.");
        console.error(e);
      }
    }
  };

  return (
    <div className="auth-container">
      {/* Decorative Glowing Orbs in Background */}
      <div className="auth-orb auth-orb-blue"></div>
      <div className="auth-orb auth-orb-orange"></div>

      <div className="glass-panel auth-card animate-fade-in">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="auth-logo">
            <img src="/logo.jpg" alt="SchoolSync Logo" />
          </div>
          <h1 className="gradient-text">Horário Escolar</h1>
          <p className="auth-subtitle">Gestão Inteligente de Horários</p>
        </div>

        {/* Action Toggle Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => mode !== "login" && handleToggleMode()}
          >
            Iniciar Sessão
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => mode !== "register" && handleToggleMode()}
          >
            Criar Conta
          </button>
        </div>

        {/* Error Display */}
        {error && <div className="auth-error-box animate-shake">{error}</div>}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Nome Completo</label>
              <input
                id="auth-name"
                type="text"
                className="form-input"
                placeholder="Ex: Manuel Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Endereço de E-mail</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="Ex: pai@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Palavra-passe</label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-confirm-password">Confirmar Palavra-passe</label>
              <input
                id="auth-confirm-password"
                type="password"
                className="form-input"
                placeholder="Introduza novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-options">
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Lembrar a minha sessão</span>
            </label>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn">
            {mode === "login" ? "Entrar na Conta" : "Finalizar Registo"}
          </button>
        </form>

        <p className="auth-footer-text">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button type="button" className="auth-link" onClick={handleToggleMode}>
                Registe-se aqui
              </button>
            </>
          ) : (
            <>
              Já tem conta registada?{" "}
              <button type="button" className="auth-link" onClick={handleToggleMode}>
                Inicie sessão
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
