'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt'

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

const translations: Translations = {
  en: {
    // Dashboard
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    calendar: 'Calendar',
    projects: 'Projects',
    timeTracker: 'Time Tracker',
    assistant: 'Assistant',
    settings: 'Settings',
    logout: 'Logout',
    welcome: 'Welcome',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    
    // Tasks
    newTask: 'New Task',
    addTask: 'Add Task',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    taskTitle: 'Task Title',
    taskDescription: 'Description',
    dueDate: 'Due Date',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    // Projects
    newProject: 'New Project',
    projectName: 'Project Name',
    projectDescription: 'Project Description',
    status: 'Status',
    active: 'Active',
    completed: 'Completed',
    onHold: 'On Hold',
    planning: 'Planning'
  },
  de: {
    // Dashboard
    dashboard: 'Übersicht',
    tasks: 'Aufgaben',
    calendar: 'Kalender',
    projects: 'Projekte',
    timeTracker: 'Zeiterfassung',
    assistant: 'Assistent',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    welcome: 'Willkommen',
    
    // Auth
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    name: 'Name',
    createAccount: 'Konto erstellen',
    alreadyHaveAccount: 'Bereits ein Konto?',
    dontHaveAccount: 'Noch kein Konto?',
    
    // Tasks
    newTask: 'Neue Aufgabe',
    addTask: 'Aufgabe hinzufügen',
    editTask: 'Aufgabe bearbeiten',
    deleteTask: 'Aufgabe löschen',
    taskTitle: 'Aufgabentitel',
    taskDescription: 'Beschreibung',
    dueDate: 'Fälligkeitsdatum',
    priority: 'Priorität',
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
    
    // Projects
    newProject: 'Neues Projekt',
    projectName: 'Projektname',
    projectDescription: 'Projektbeschreibung',
    status: 'Status',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    onHold: 'Pausiert',
    planning: 'Planung'
  },
  fr: {
    // Dashboard
    dashboard: 'Tableau de bord',
    tasks: 'Tâches',
    calendar: 'Calendrier',
    projects: 'Projets',
    timeTracker: 'Suivi du temps',
    assistant: 'Assistant',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    welcome: 'Bienvenue',
    
    // Auth
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    email: 'Email',
    password: 'Mot de passe',
    name: 'Nom',
    createAccount: 'Créer un compte',
    alreadyHaveAccount: 'Déjà un compte?',
    dontHaveAccount: 'Pas encore de compte?',
    
    // Tasks
    newTask: 'Nouvelle tâche',
    addTask: 'Ajouter une tâche',
    editTask: 'Modifier la tâche',
    deleteTask: 'Supprimer la tâche',
    taskTitle: 'Titre de la tâche',
    taskDescription: 'Description',
    dueDate: "Date d'échéance",
    priority: 'Priorité',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
    
    // Projects
    newProject: 'Nouveau projet',
    projectName: 'Nom du projet',
    projectDescription: 'Description du projet',
    status: 'Statut',
    active: 'Actif',
    completed: 'Terminé',
    onHold: 'En pause',
    planning: 'Planification'
  },
  es: {
    // Dashboard
    dashboard: 'Panel',
    tasks: 'Tareas',
    calendar: 'Calendario',
    projects: 'Proyectos',
    timeTracker: 'Seguimiento de tiempo',
    assistant: 'Asistente',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
    welcome: 'Bienvenido',
    
    // Auth
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    name: 'Nombre',
    createAccount: 'Crear cuenta',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    dontHaveAccount: '¿No tienes cuenta?',
    
    // Tasks
    newTask: 'Nueva tarea',
    addTask: 'Añadir tarea',
    editTask: 'Editar tarea',
    deleteTask: 'Eliminar tarea',
    taskTitle: 'Título de la tarea',
    taskDescription: 'Descripción',
    dueDate: 'Fecha de vencimiento',
    priority: 'Prioridad',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
    
    // Projects
    newProject: 'Nuevo proyecto',
    projectName: 'Nombre del proyecto',
    projectDescription: 'Descripción del proyecto',
    status: 'Estado',
    active: 'Activo',
    completed: 'Completado',
    onHold: 'En espera',
    planning: 'Planificación'
  },
  it: {
    dashboard: 'Pannello',
    tasks: 'Compiti',
    calendar: 'Calendario',
    projects: 'Progetti',
    settings: 'Impostazioni',
    signIn: 'Accedi',
    signUp: 'Registrati',
    email: 'Email',
    password: 'Password',
    name: 'Nome'
  },
  pt: {
    dashboard: 'Painel',
    tasks: 'Tarefas',
    calendar: 'Calendário',
    projects: 'Projetos',
    settings: 'Configurações',
    signIn: 'Entrar',
    signUp: 'Cadastrar',
    email: 'Email',
    password: 'Senha',
    name: 'Nome'
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem('studex-language')
    if (saved) {
      setLanguage(saved as Language)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0]
      if (browserLang in translations) {
        setLanguage(browserLang as Language)
      }
    }
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('studex-language', lang)
  }

  const translate = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
