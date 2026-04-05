# 🌿 HidroVerde — Sistema de Gestión de Granjas Hidropónicas

<p align="center">
  <img src="https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/SQL_Server-Azure-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" />
  <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
</p>

Aplicación web full-stack para la administración integral de granjas hidropónicas. Permite gestionar cultivos, sensores, sistemas de riego, producción y más, a través de una interfaz moderna y responsiva.

---

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Ejecución](#-ejecución)
- [Despliegue](#-despliegue)
- [Autor](#-autor)

---

## 🏗 Arquitectura

El proyecto sigue una **arquitectura en capas** con separación clara entre Backend y Frontend:

```
┌─────────────────────────────┐
│     Frontend (React SPA)    │
│   React 19 + Vite + TW CSS  │
│       React Router DOM      │
└──────────┬──────────────────┘
           │  HTTP / REST API
┌──────────▼──────────────────┐
│   Backend (ASP.NET Core)    │
│  ┌────────────────────────┐ │
│  │     Controllers        │ │
│  ├────────────────────────┤ │
│  │     Services           │ │
│  ├────────────────────────┤ │
│  │     Data Access        │ │
│  └────────┬───────────────┘ │
└───────────┼─────────────────┘
            │
┌───────────▼─────────────────┐
│    Azure SQL / SQL Server   │
└─────────────────────────────┘
```

---

## 🛠 Stack Tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| .NET 8 | Framework principal |
| ASP.NET Core Web API | API REST |
| Entity Framework Core | ORM y acceso a datos |
| SQL Server / Azure SQL | Base de datos relacional |
| JWT + Cookies | Autenticación y autorización |

### Frontend
| Tecnología | Uso |
|---|---|
| React 19 | Librería de UI |
| Vite | Build tool y dev server |
| Tailwind CSS | Framework de estilos |
| React Router DOM | Navegación SPA |
| JavaScript (ES6+) | Lenguaje principal |

### DevOps
| Tecnología | Uso |
|---|---|
| GitHub Actions | CI/CD automatizado |
| Azure App Service | Hosting de API y Web |
| Azure SQL Database | Base de datos en la nube |
| DACPAC | Despliegue de esquema de BD |

---

## 📁 Estructura del Proyecto

```
Hidroverde/
├── Backend/
│   └── Hidroverde.API/
│       └── API/
│           ├── Controllers/      # Endpoints REST
│           ├── Services/         # Lógica de negocio
│           ├── Models/           # Entidades del dominio
│           ├── Data/             # DbContext y configuración
│           └── Program.cs        # Punto de entrada
│
├── Frontend/
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Vistas/páginas
│   │   ├── services/             # Llamadas a la API
│   │   ├── App.jsx               # Componente raíz
│   │   └── main.jsx              # Punto de entrada
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ✅ Requisitos Previos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) y npm
- [SQL Server](https://www.microsoft.com/sql-server) (local o Azure SQL)
- [Git](https://git-scm.com/)

---

## ⚙ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/GersChacon/Hidroverde.git
cd Hidroverde
```

### 2. Configurar el Backend

```bash
cd Backend/Hidroverde.API/API
```

Crear el archivo `appsettings.json` (no se incluye en el repo por seguridad):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=HidroVerde;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "TU_SECRET_KEY",
    "Issuer": "HidroVerde",
    "Audience": "HidroVerde"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

Restaurar dependencias:

```bash
dotnet restore
```

### 3. Configurar el Frontend

```bash
cd ../../../Frontend
npm install
```

---

## 🔐 Variables de Entorno

| Variable | Descripción | Ubicación |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | Cadena de conexión a SQL Server | `appsettings.json` |
| `Jwt:Key` | Clave secreta para tokens JWT | `appsettings.json` |
| `Jwt:Issuer` | Emisor del token | `appsettings.json` |
| `Jwt:Audience` | Audiencia del token | `appsettings.json` |

> 🔒 El archivo `appsettings.json` está excluido del repositorio vía `.gitignore`. Nunca subas credenciales al código fuente.

---

## 🚀 Ejecución

### Backend

```bash
cd Backend/Hidroverde.API/API
dotnet run
```

La API estará disponible en `https://localhost:5001` (o el puerto configurado).

### Frontend

```bash
cd Frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## ☁ Despliegue

El proyecto está configurado para desplegarse en **Microsoft Azure** mediante **GitHub Actions**:

- **API:** Azure App Service
- **Base de Datos:** Azure SQL Database (desplegada vía DACPAC)
- **Frontend:** Azure App Service

Los workflows de CI/CD se ejecutan automáticamente al hacer push a la rama principal.

---

## 👤 Autores

**Gerson Chacón Quirós**

Estudiante de Ingeniería en Sistemas — Universidad Fidélitas, Costa Rica

[![GitHub](https://img.shields.io/badge/GitHub-GersChacon-181717?style=flat&logo=github)](https://github.com/GersChacon)


**Mariano Mora Arrieta**

Estudiante de Ingeniería en Sistemas — Universidad Fidélitas, Costa Rica

[![GitHub](https://img.shields.io/badge/GitHub-MarianoM31-181717?style=flat&logo=github)](https://github.com/MarianoM31)