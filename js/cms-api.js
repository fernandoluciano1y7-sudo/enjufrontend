/**
 * CMS API - C# (.NET)
 */
const CMS_API = {
  // Detectar se está rodando localmente
  API_URL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"
      ? "http://localhost:5000/api"
      : "https://lonely-viviana-fernandolucianoorg-3f894fa1.koyeb.app/api",
  AUTH_KEY: "enju_token",

  /**
   * Inicializa
   */
  async init() {
    try {
      const response = await fetch(`${this.API_URL}/content`);
      if (!response.ok) throw new Error("Servidor offline");
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      // Fallback JSON local se servidor off
      try {
        return await (await fetch("content-data.json")).json();
      } catch (e) {
        return null;
      }
    }
  },

  /**
   * Salva conteúdo no banco de dados
   */
  async saveContent(content) {
    if (!this.auth.isAuthenticated())
      return alert("Você precisa estar logado!");

    try {
      const response = await fetch(`${this.API_URL}/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.auth.getToken()}`,
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) throw new Error("Falha ao salvar");

      alert("Conteúdo salvo com sucesso! 🎉");
      return await response.json();
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
      throw error;
    }
  },

  /**
   * Upload de Imagem
   */
  async uploadImage(file) {
    if (!this.auth.isAuthenticated()) return alert("Faça login primeiro!");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${this.API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.auth.getToken()}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro no servidor");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Erro upload:", error);
      alert("Falha ao enviar imagem: " + error.message);
      throw error;
    }
  },

  /**
   * Upload de Vídeo
   */
  async uploadVideo(file) {
    if (!this.auth.isAuthenticated()) return alert("Faça login primeiro!");

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch(`${this.API_URL}/upload-video`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.auth.getToken()}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Erro no upload de vídeo");

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Erro upload vídeo:", error);
      alert("Falha ao enviar vídeo.");
      throw error;
    }
  },

  /**
   * Sistema de Login Simples
   */
  auth: {
    login: async (username, password) => {
      try {
        const response = await fetch(`${CMS_API.API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem(CMS_API.AUTH_KEY, data.token);
          return true;
        }
        return false;
      } catch (e) {
        console.error(e);
        alert("Erro de conexão ao tentar logar.");
        return false;
      }
    },

    logout: async () => {
      localStorage.removeItem(CMS_API.AUTH_KEY);
      window.location.reload();
    },

    isAuthenticated: () => !!localStorage.getItem(CMS_API.AUTH_KEY),
    getToken: () => localStorage.getItem(CMS_API.AUTH_KEY),
  },
};

window.CMS_API = CMS_API;
