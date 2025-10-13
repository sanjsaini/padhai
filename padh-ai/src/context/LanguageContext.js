import React, { createContext, useContext, useState } from "react";

// Language translations for entire website
const translations = {
  English: {
    // Welcome page
    welcomeTitle: "Welcome to English Learning",
    welcomeSubtitle: "Start your journey to master English",
    loginButton: "Login",
    signupButton: "Sign Up",

    // Login page
    loginTitle: "Login",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    loginButtonText: "Login",
    backToWelcome: "Back to Welcome",

    // SignUp pages
    signupTitle: "Sign Up",
    namePlaceholder: "Name (optional)",
    confirmPasswordPlaceholder: "Confirm Password",
    continueButton: "Continue",

    // SignUpStep2
    nativeLanguagePlaceholder: "Native Language",
    gradePlaceholder: "Grade",
    agePlaceholder: "Age (optional)",
    takeTestButton: "Take Placement Test",

    // Dashboard
    dashboardTitle: "Dashboard",
    greetingSubtitle: "Ready to improve your English?",
    menuTitle: "Menu",
    progressButton: "Progress",
    accountButton: "My Account",
    logoutButton: "Logout",

    // Placement Test
    testTitle: "Placement Test",
    questionText: "Question",
    nextButton: "Next",
    submitButton: "Start Test",
    backButton: "Back",

    // Test Results
    testResults: "Test Results",
    questionDetails: "Question Details",
    correct: "Correct",
    incorrect: "Incorrect",
    total: "Total",
    yourAnswer: "Your Answer",
    correctAnswer: "Correct Answer",
    startLearning: "Start Learning",
    noAnswer: "No answer",
    // App common
    settings: "Settings",
    profileSettings: "Profile Settings",
    buttonGenerate: "Generate",
    buttonStart: "Start",
    buttonContinue: "Continue",
    buttonReview: "Review",
    buttonGenerating: "Generating...",
    generatingLessons: "Generating {section} lessons...",
    pleaseWait: "Please wait while we prepare your lessons...",
    toastGenerating: "Generating {section} lessons...",
    toastGenerated: "{section} lessons generated.",
    toastGenerateFailed: "Failed to generate lessons. Please try again.",
    // Profile Settings
    loadingProfile: "Loading profile...",
    profileInformation: "Profile Information",
    profileSubtitle: "Update your name and language preferences",
    nameLabel: "Name",
    emailLabel: "Email",
    levelLabel: "Level",
    languageLabel: "Language",
    readOnly: "(Read-only)",
    languageUpdated: "Language preference updated.",
    languageUpdateFailed: "Failed to update language preference",
    saving: "Saving...",
    saveChanges: "Save Changes",
    securitySettings: "Security Settings",
    currentPasswordLabel: "Current Password",
    newPasswordLabel: "New Password",
    confirmPasswordLabel: "Confirm Password",
    currentPasswordPlaceholder: "Current password",
    newPasswordPlaceholder: "New password",
    confirmNewPassword: "Confirm new password",
    updatePassword: "Update Password",
    dontHaveAccount: "Don't have an account?",
    profileUpdated: "Profile updated successfully.",
    passwordUpdated: "Password updated successfully!",
    allPasswordRequired: "All password fields are required",
    passwordMismatch: "New password and confirmation do not match",
    passwordMinLength: "New password must be at least 6 characters long",
  },
  Hindi: {
    // Welcome page
    welcomeTitle: "अंग्रेजी सीखने में आपका स्वागत है",
    welcomeSubtitle: "अंग्रेजी में महारत हासिल करने की अपनी यात्रा शुरू करें",
    loginButton: "लॉगिन",
    signupButton: "साइन अप",

    // Login page
    loginTitle: "लॉगिन",
    emailPlaceholder: "अपना ईमेल दर्ज करें",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    loginButtonText: "लॉगिन",
    backToWelcome: "स्वागत पेज पर वापस जाएं",

    // SignUp pages
    signupTitle: "साइन अप",
    namePlaceholder: "नाम",
    confirmPasswordPlaceholder: "पासवर्ड की पुष्टि करें",
    continueButton: "जारी रखें",

    // SignUpStep2
    nativeLanguagePlaceholder: "मातृभाषा",
    gradePlaceholder: "कक्षा",
    agePlaceholder: "उम्र",
    takeTestButton: "प्लेसमेंट टेस्ट लें",

    // Dashboard
    dashboardTitle: "डैशबोर्ड",
    greetingSubtitle: "अंग्रेजी सुधारने के लिए तैयार हैं?",
    menuTitle: "मेनू",
    progressButton: "प्रगति",
    accountButton: "मेरा खाता",
    logoutButton: "लॉगआउट",

    // Placement Test
    testTitle: "प्लेसमेंट टेस्ट",
    questionText: "प्रश्न",
    nextButton: "अगला",
    submitButton: "टेस्ट सबमिट करें",
    backButton: "वापस",

    // Test Results
    testResults: "टेस्ट परिणाम",
    questionDetails: "प्रश्न विवरण",
    correct: "सही",
    incorrect: "गलत",
    total: "कुल",
    yourAnswer: "आपका जवाब",
    correctAnswer: "सही जवाब",
    startLearning: "सीखना शुरू करें",
    noAnswer: "कोई जवाब नहीं",
    // App common
    settings: "सेटिंग्स",
    profileSettings: "प्रोफ़ाइल सेटिंग्स",
    buttonGenerate: "जनरेट करें",
    buttonStart: "शुरू करें",
    buttonContinue: "जारी रखें",
    buttonReview: "समीक्षा",
    buttonGenerating: "जनरेट हो रहा है...",
    generatingLessons: "{section} पाठ जनरेट हो रहे हैं...",
    pleaseWait: "कृपया प्रतीक्षा करें, हम आपके पाठ तैयार कर रहे हैं...",
    toastGenerating: "{section} पाठ जनरेट हो रहे हैं...",
    toastGenerated: "{section} पाठ तैयार हो गए।",
    toastGenerateFailed: "पाठ जनरेट करने में विफल। कृपया पुनः प्रयास करें।",
    // Profile Settings
    loadingProfile: "प्रोफ़ाइल लोड हो रही है...",
    profileInformation: "प्रोफ़ाइल जानकारी",
    profileSubtitle: "अपना नाम और भाषा वरीयता अपडेट करें",
    nameLabel: "नाम",
    emailLabel: "ईमेल",
    levelLabel: "स्तर",
    languageLabel: "भाषा",
    readOnly: "(केवल-पढ़ने हेतु)",
    languageUpdated: "भाषा वरीयता अपडेट हो गई।",
    languageUpdateFailed: "भाषा वरीयता अपडेट करने में विफल",
    saving: "सहेजा जा रहा है...",
    saveChanges: "परिवर्तन सहेजें",
    securitySettings: "सुरक्षा सेटिंग्स",
    currentPasswordLabel: "वर्तमान पासवर्ड",
    newPasswordLabel: "नया पासवर्ड",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    currentPasswordPlaceholder: "वर्तमान पासवर्ड",
    newPasswordPlaceholder: "नया पासवर्ड",
    confirmNewPassword: "नया पासवर्ड पुष्टि करें",
    updatePassword: "पासवर्ड अपडेट करें",
  },
  Gujarati: {
    // Welcome page
    welcomeTitle: "અંગ્રેજી શીખવામાં આપનું સ્વાગત છે",
    welcomeSubtitle: "અંગ્રેજીમાં નિપુણતા મેળવવાની તમારી યાત્રા શરૂ કરો",
    loginButton: "લૉગિન",
    signupButton: "સાઇન અપ",

    // Login page
    loginTitle: "લૉગિન",
    emailPlaceholder: "તમારો ઈમેલ દાખલ કરો",
    passwordPlaceholder: "તમારો પાસવર્ડ દાખલ કરો",
    loginButtonText: "લૉગિન",
    backToWelcome: "સ્વાગત પેજ પર પાછા જાઓ",

    // SignUp pages
    signupTitle: "સાઇન અપ",
    namePlaceholder: "નામ (વૈકલ્પિક)",
    confirmPasswordPlaceholder: "પાસવર્ડની પુષ્ટિ કરો",
    continueButton: "જારી રાખો",

    // SignUpStep2
    nativeLanguagePlaceholder: "માતૃભાષા",
    gradePlaceholder: "કક્ષા",
    agePlaceholder: "ઉંમર",
    takeTestButton: "પ્લેસમેન્ટ ટેસ્ટ લો (આગળનું પેજ જાય છે)",

    // Dashboard
    dashboardTitle: "ડેશબોર્ડ",
    greetingSubtitle: "અંગ્રેજી સુધારવા માટે તૈયાર છો?",
    menuTitle: "મેનૂ",
    progressButton: "પ્રગતિ",
    accountButton: "મારું ખાતું",
    logoutButton: "લૉગઆઉટ",

    // Placement Test
    testTitle: "પ્લેસમેન્ટ ટેસ્ટ",
    questionText: "પ્રશ્ન",
    nextButton: "આગળ",
    submitButton: "ટેસ્ટ સબમિટ કરો",
    backButton: "પાછળ",

    // Test Results
    testResults: "ટેસ્ટ પરિણામ",
    questionDetails: "પ્રશ્ન વિગતો",
    correct: "સાચું",
    incorrect: "ખોટું",
    total: "કુલ",
    yourAnswer: "તમારો જવાબ",
    correctAnswer: "સાચો જવાબ",
    startLearning: "સીખવાનું શરૂ કરો",
    noAnswer: "કોઈ જવાબ નહીં",
    // App common
    settings: "સેટિંગ્સ",
    profileSettings: "પ્રોફાઇલ સેટિંગ્સ",
    buttonGenerate: "જનરેટ કરો",
    buttonStart: "શરૂ કરો",
    buttonContinue: "ચાલુ રાખો",
    buttonReview: "રીવ્યુ",
    buttonGenerating: "જનરેટ થઈ રહ્યું છે...",
    generatingLessons: "{section} પાઠ જનરેટ થઈ રહ્યા છે...",
    pleaseWait: "મહેરબાની કરીને રાહ જુઓ, અમે પાઠ તૈયાર કરી રહ્યા છીએ...",
    toastGenerating: "{section} પાઠ જનરેટ થઈ રહ્યા છે...",
    toastGenerated: "{section} પાઠ તૈયાર થઈ ગયા.",
    toastGenerateFailed:
      "પાઠ જનરેટ કરવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયત્ન કરો.",
    // Profile Settings
    loadingProfile: "પ્રોફાઇલ લોડ થઈ રહી છે...",
    profileInformation: "પ્રોફાઇલ માહિતી",
    profileSubtitle: "તમારું નામ અને ભાષા પસંદગી અપડેટ કરો",
    nameLabel: "નામ",
    emailLabel: "ઈમેલ",
    levelLabel: "સ્તર",
    languageLabel: "ભાષા",
    readOnly: "(માત્ર વાંચવા માટે)",
    languageUpdated: "ભાષા પસંદગી અપડેટ થઈ.",
    languageUpdateFailed: "ભાષા પસંદગી અપડેટ કરવામાં નિષ્ફળ",
    saving: "સાચવાઈ રહ્યું છે...",
    saveChanges: "બદલાવો સાચવો",
    securitySettings: "સિક્યોરિટી સેટિંગ્સ",
    currentPasswordLabel: "હાલનો પાસવર્ડ",
    newPasswordLabel: "નવો પાસવર્ડ",
    confirmPasswordLabel: "પાસવર્ડની પુષ્ટિ કરો",
    currentPasswordPlaceholder: "હાલનો પાસવર્ડ",
    newPasswordPlaceholder: "નવો પાસવર્ડ",
    confirmNewPassword: "નવો પાસવર્ડ પુષ્ટિ કરો",
    updatePassword: "પાસવર્ડ અપડેટ કરો",
  },
  Spanish: {
    // Welcome page
    welcomeTitle: "Bienvenido al Aprendizaje de Inglés",
    welcomeSubtitle: "Comienza tu viaje para dominar el inglés",
    loginButton: "Iniciar Sesión",
    signupButton: "Registrarse",

    // Login page
    loginTitle: "Iniciar Sesión",
    emailPlaceholder: "Ingresa tu correo",
    passwordPlaceholder: "Ingresa tu contraseña",
    loginButtonText: "Iniciar Sesión",
    backToWelcome: "Volver al Inicio",

    // SignUp pages
    signupTitle: "Registrarse",
    namePlaceholder: "Nombre",
    confirmPasswordPlaceholder: "Confirmar contraseña",
    continueButton: "Continuar",

    // SignUpStep2
    nativeLanguagePlaceholder: "Idioma nativo",
    gradePlaceholder: "Grado",
    agePlaceholder: "Edad",
    takeTestButton: "Tomar Prueba de Ubicación",

    // Dashboard
    dashboardTitle: "Panel de Control",
    greetingSubtitle: "¿Listo para mejorar tu inglés?",
    menuTitle: "Menú",
    progressButton: "Progreso",
    accountButton: "Mi Cuenta",
    logoutButton: "Cerrar Sesión",

    // Placement Test
    testTitle: "Prueba de Ubicación",
    questionText: "Pregunta",
    nextButton: "Siguiente",
    submitButton: "Enviar Prueba",
    backButton: "Atrás",

    // Test Results
    testResults: "Resultados de la Prueba",
    questionDetails: "Detalles de Preguntas",
    correct: "Correcto",
    incorrect: "Incorrecto",
    total: "Total",
    yourAnswer: "Tu Respuesta",
    correctAnswer: "Respuesta Correcta",
    startLearning: "Comenzar a Aprender",
    noAnswer: "Sin respuesta",
    // App common
    settings: "Configuración",
    profileSettings: "Configuración de Perfil",
    buttonGenerate: "Generar",
    buttonStart: "Comenzar",
    buttonContinue: "Continuar",
    buttonReview: "Revisar",
    buttonGenerating: "Generando...",
    generatingLessons: "Generando lecciones de {section}...",
    pleaseWait: "Espere mientras preparamos sus lecciones...",
    toastGenerating: "Generando lecciones de {section}...",
    toastGenerated: "Lecciones de {section} generadas.",
    toastGenerateFailed:
      "No se pudieron generar las lecciones. Inténtelo de nuevo.",
    // Profile Settings
    loadingProfile: "Cargando perfil...",
    profileInformation: "Información del Perfil",
    profileSubtitle: "Actualiza tu nombre y preferencia de idioma",
    nameLabel: "Nombre",
    emailLabel: "Correo",
    levelLabel: "Nivel",
    languageLabel: "Idioma",
    readOnly: "(Solo lectura)",
    languageUpdated: "Preferencia de idioma actualizada.",
    languageUpdateFailed: "Error al actualizar la preferencia de idioma",
    saving: "Guardando...",
    saveChanges: "Guardar Cambios",
    securitySettings: "Configuración de Seguridad",
    currentPasswordLabel: "Contraseña actual",
    newPasswordLabel: "Nueva contraseña",
    confirmPasswordLabel: "Confirmar contraseña",
    currentPasswordPlaceholder: "Contraseña actual",
    newPasswordPlaceholder: "Nueva contraseña",
    confirmNewPassword: "Confirmar nueva contraseña",
    updatePassword: "Actualizar Contraseña",
  },
  French: {
    // Welcome page
    welcomeTitle: "Bienvenue à l'Apprentissage de l'Anglais",
    welcomeSubtitle: "Commencez votre voyage pour maîtriser l'anglais",
    loginButton: "Se Connecter",
    signupButton: "S'inscrire",

    // Login page
    loginTitle: "Se Connecter",
    emailPlaceholder: "Entrez votre e-mail",
    passwordPlaceholder: "Entrez votre mot de passe",
    loginButtonText: "Se Connecter",
    backToWelcome: "Retour à l'Accueil",

    // SignUp pages
    signupTitle: "S'inscrire",
    namePlaceholder: "Nom",
    confirmPasswordPlaceholder: "Confirmer le mot de passe",
    continueButton: "Continuer",

    // SignUpStep2
    nativeLanguagePlaceholder: "Langue maternelle",
    gradePlaceholder: "Niveau",
    agePlaceholder: "Âge",
    takeTestButton: "Passer le Test de Placement",

    // Dashboard
    dashboardTitle: "Tableau de Bord",
    greetingSubtitle: "Prêt à améliorer votre anglais?",
    menuTitle: "Menu",
    progressButton: "Progrès",
    accountButton: "Mon Compte",
    logoutButton: "Se Déconnecter",

    // Placement Test
    testTitle: "Test de Placement",
    questionText: "Question",
    nextButton: "Suivant",
    submitButton: "Soumettre le Test",
    backButton: "Retour",

    // Test Results
    testResults: "Résultats du Test",
    questionDetails: "Détails des Questions",
    correct: "Correct",
    incorrect: "Incorrect",
    total: "Total",
    yourAnswer: "Votre Réponse",
    correctAnswer: "Réponse Correcte",
    startLearning: "Commencer à Apprendre",
    noAnswer: "Aucune réponse",
    // App common
    settings: "Paramètres",
    profileSettings: "Paramètres du Profil",
    buttonGenerate: "Générer",
    buttonStart: "Commencer",
    buttonContinue: "Continuer",
    buttonReview: "Revoir",
    buttonGenerating: "Génération...",
    generatingLessons: "Génération des leçons de {section}...",
    pleaseWait: "Veuillez patienter pendant que nous préparons vos leçons...",
    toastGenerating: "Génération des leçons de {section}...",
    toastGenerated: "Leçons de {section} générées.",
    toastGenerateFailed:
      "Échec de la génération des leçons. Veuillez réessayer.",
    // Profile Settings
    loadingProfile: "Chargement du profil...",
    profileInformation: "Informations du Profil",
    profileSubtitle: "Mettez à jour votre nom et votre langue",
    nameLabel: "Nom",
    emailLabel: "E-mail",
    levelLabel: "Niveau",
    languageLabel: "Langue",
    readOnly: "(Lecture seule)",
    languageUpdated: "Préférence de langue mise à jour.",
    languageUpdateFailed: "Échec de la mise à jour de la préférence de langue",
    saving: "Enregistrement...",
    saveChanges: "Enregistrer",
    securitySettings: "Paramètres de Sécurité",
    currentPasswordLabel: "Mot de passe actuel",
    newPasswordLabel: "Nouveau mot de passe",
    confirmPasswordLabel: "Confirmer le mot de passe",
    currentPasswordPlaceholder: "Mot de passe actuel",
    newPasswordPlaceholder: "Nouveau mot de passe",
    confirmNewPassword: "Confirmer le nouveau mot de passe",
    updatePassword: "Mettre à jour le mot de passe",
  },
  Punjabi: {
    // Welcome page
    welcomeTitle: "ਅੰਗਰੇਜ਼ੀ ਸਿੱਖਣ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ",
    welcomeSubtitle: "ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਮੁਹਾਰਤ ਹਾਸਲ ਕਰਨ ਦੀ ਆਪਣੀ ਯਾਤਰਾ ਸ਼ੁਰੂ ਕਰੋ",
    loginButton: "ਲੌਗ ਇਨ",
    signupButton: "ਸਾਈਨ ਅੱਪ",

    // Login page
    loginTitle: "ਲੌਗ ਇਨ",
    emailPlaceholder: "ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ",
    passwordPlaceholder: "ਆਪਣਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ",
    loginButtonText: "ਲੌਗ ਇਨ",
    backToWelcome: "ਸਵਾਗਤ ਪੰਨੇ ਤੇ ਵਾਪਸ ਜਾਓ",

    // SignUp pages
    signupTitle: "ਸਾਈਨ ਅੱਪ",
    namePlaceholder: "ਨਾਮ (ਵਿਕਲਪਿਕ)",
    confirmPasswordPlaceholder: "ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    continueButton: "ਜਾਰੀ ਰੱਖੋ",

    // SignUpStep2
    nativeLanguagePlaceholder: "ਮਾਤ ਭਾਸ਼ਾ",
    gradePlaceholder: "ਕਲਾਸ",
    agePlaceholder: "ਉਮਰ",
    takeTestButton: "ਪਲੇਸਮੈਂਟ ਟੈਸਟ ਲਓ",

    // Dashboard
    dashboardTitle: "ਡੈਸ਼ਬੋਰਡ",
    greetingSubtitle: "ਅੰਗਰੇਜ਼ੀ ਸੁਧਾਰਨ ਲਈ ਤਿਆਰ ਹੋ?",
    menuTitle: "ਮੀਨੂ",
    progressButton: "ਤਰੱਕੀ",
    accountButton: "ਮੇਰਾ ਖਾਤਾ",
    logoutButton: "ਲੌਗ ਆਉਟ",

    // Placement Test
    testTitle: "ਪਲੇਸਮੈਂਟ ਟੈਸਟ",
    questionText: "ਸਵਾਲ",
    nextButton: "ਅਗਲਾ",
    submitButton: "ਟੈਸਟ ਜਮ੍ਹਾ ਕਰੋ",
    backButton: "ਵਾਪਸ",

    // Test Results
    testResults: "ਟੈਸਟ ਨਤੀਜੇ",
    questionDetails: "ਸਵਾਲ ਦੇ ਵੇਰਵੇ",
    correct: "ਸਹੀ",
    incorrect: "ਗਲਤ",
    total: "ਕੁੱਲ",
    yourAnswer: "ਤੁਹਾਡਾ ਜਵਾਬ",
    correctAnswer: "ਸਹੀ ਜਵਾਬ",
    startLearning: "ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ",
    noAnswer: "ਕੋਈ ਜਵਾਬ ਨਹੀਂ",
    // App common
    settings: "ਸੈਟਿੰਗਜ਼",
    profileSettings: "ਪ੍ਰੋਫ਼ਾਈਲ ਸੈਟਿੰਗਜ਼",
    buttonGenerate: "ਜਨਰੇਟ ਕਰੋ",
    buttonStart: "ਸ਼ੁਰੂ ਕਰੋ",
    buttonContinue: "ਜਾਰੀ ਰੱਖੋ",
    buttonReview: "ਰੀਵਿਊ",
    buttonGenerating: "ਜਨਰੇਟ ਹੋ ਰਿਹਾ ਹੈ...",
    generatingLessons: "{section} ਪਾਠ ਜਨਰੇਟ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...",
    pleaseWait: "ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ, ਅਸੀਂ ਤੁਹਾਡੇ ਪਾਠ ਤਿਆਰ ਕਰ ਰਹੇ ਹਾਂ...",
    toastGenerating: "{section} ਪਾਠ ਜਨਰੇਟ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...",
    toastGenerated: "{section} ਪਾਠ ਤਿਆਰ ਹੋ ਗਏ।",
    toastGenerateFailed: "ਪਾਠ ਜਨਰੇਟ ਕਰਨਾ ਅਸਫਲ ਰਿਹਾ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    // Profile Settings
    loadingProfile: "ਪ੍ਰੋਫ਼ਾਈਲ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...",
    profileInformation: "ਪ੍ਰੋਫ਼ਾਈਲ ਜਾਣਕਾਰੀ",
    profileSubtitle: "ਆਪਣਾ ਨਾਮ ਅਤੇ ਭਾਸ਼ਾ ਅਪਡੇਟ ਕਰੋ",
    nameLabel: "ਨਾਮ",
    emailLabel: "ਈਮੇਲ",
    levelLabel: "ਪੱਧਰ",
    languageLabel: "ਭਾਸ਼ਾ",
    readOnly: "(ਕੇਵਲ-ਪੜ੍ਹਨ ਲਈ)",
    languageUpdated: "ਭਾਸ਼ਾ ਪਸੰਦ ਅਪਡੇਟ ਹੋ ਗਈ।",
    languageUpdateFailed: "ਭਾਸ਼ਾ ਪਸੰਦ ਅਪਡੇਟ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
    saving: "ਸੇਵ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    saveChanges: "ਬਦਲਾਅ ਸੇਵ ਕਰੋ",
    securitySettings: "ਸੁਰੱਖਿਆ ਸੈਟਿੰਗਜ਼",
    currentPasswordLabel: "ਮੌਜੂਦਾ ਪਾਸਵਰਡ",
    newPasswordLabel: "ਨਵਾਂ ਪਾਸਵਰਡ",
    confirmPasswordLabel: "ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    currentPasswordPlaceholder: "ਮੌਜੂਦਾ ਪਾਸਵਰਡ",
    newPasswordPlaceholder: "ਨਵਾਂ ਪਾਸਵਰਡ",
    confirmNewPassword: "ਨਵਾਂ ਪਾਸਵਰਡ ਪੁਸ਼ਟੀ ਕਰੋ",
    updatePassword: "ਪਾਸਵਰਡ ਅਪਡੇਟ ਕਰੋ",
  },
  Telugu: {
    // Welcome page
    welcomeTitle: "ఇంగ్లీష్ నేర్చుకోవడానికి స్వాగతం",
    welcomeSubtitle: "ఇంగ్లీష్‌లో నిపుణత సాధించే మీ ప్రయాణాన్ని ప్రారంభించండి",
    loginButton: "లాగిన్",
    signupButton: "సైన్ అప్",

    // Login page
    loginTitle: "లాగిన్",
    emailPlaceholder: "మీ ఇమెయిల్‌ను నమోదు చేయండి",
    passwordPlaceholder: "మీ పాస్‌వర్డ్‌ను నమోదు చేయండి",
    loginButtonText: "లాగిన్",
    backToWelcome: "స్వాగత పేజీకి తిరిగి వెళ్లండి",

    // SignUp pages
    signupTitle: "సైన్ అప్",
    namePlaceholder: "పేరు (ఐచ్ఛికం)",
    confirmPasswordPlaceholder: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    continueButton: "కొనసాగించండి",

    // SignUpStep2
    nativeLanguagePlaceholder: "మాతృభాష",
    gradePlaceholder: "తరగతి",
    agePlaceholder: "వయస్సు",
    takeTestButton: "ప్లేస్‌మెంట్ టెస్ట్ తీసుకోండి",

    // Dashboard
    dashboardTitle: "డాష్‌బోర్డ్",
    greetingSubtitle: "మీ ఇంగ్లీష్‌ను మెరుగుపరచడానికి సిద్ధంగా ఉన్నారా?",
    menuTitle: "మెనూ",
    progressButton: "పురోగతి",
    accountButton: "నా ఖాతా",
    logoutButton: "లాగ్‌అవుట్",

    // Placement Test
    testTitle: "ప్లేస్‌మెంట్ టెస్ట్",
    questionText: "ప్రశ్న",
    nextButton: "తదుపరి",
    submitButton: "టెస్ట్‌ను సమర్పించండి",
    backButton: "వెనుకకు",

    // Test Results
    testResults: "టెస్ట్ ఫలితాలు",
    questionDetails: "ప్రశ్న వివరాలు",
    correct: "సరైనది",
    incorrect: "తప్పు",
    total: "మొత్తం",
    yourAnswer: "మీ సమాధానం",
    correctAnswer: "సరైన సమాధానం",
    startLearning: "నేర్చుకోవడం ప్రారంభించండి",
    noAnswer: "సమాధానం లేదు",
    // App common
    settings: "సెట్టింగ్స్",
    profileSettings: "ప్రొఫైల్ సెట్టింగ్స్",
    buttonGenerate: "జనరేట్ చేయండి",
    buttonStart: "ప్రారంభించండి",
    buttonContinue: "కొనసాగించండి",
    buttonReview: "రివ్యూ",
    buttonGenerating: "జనరేట్ అవుతోంది...",
    generatingLessons: "{section} పాఠాలను సృష్టిస్తున్నాం...",
    pleaseWait: "దయచేసి వేచి ఉండండి, మీ పాఠాలను సిద్ధం చేస్తున్నాం...",
    toastGenerating: "{section} పాఠాలను సృష్టిస్తున్నాం...",
    toastGenerated: "{section} పాఠాలు సిద్ధమయ్యాయి.",
    toastGenerateFailed: "పాఠాలను సృష్టించడం విఫలమైంది. మళ్లీ ప్రయత్నించండి.",
    // Profile Settings
    loadingProfile: "ప్రొఫైల్ లోడ్ అవుతోంది...",
    profileInformation: "ప్రొఫైల్ వివరాలు",
    profileSubtitle: "మీ పేరు మరియు భాష ఎంపికను నవీకరించండి",
    nameLabel: "పేరు",
    emailLabel: "ఇమెయిల్",
    levelLabel: "స్థాయి",
    languageLabel: "భాష",
    readOnly: "(చదవటానికి మాత్రమే)",
    languageUpdated: "భాష ఎంపిక నవీకరించబడింది.",
    languageUpdateFailed: "భాష ఎంపిక నవీకరణ విఫలమైంది",
    saving: "భద్రపరుస్తున్నాం...",
    saveChanges: "మార్పులను భద్రపరచండి",
    securitySettings: "భద్రతా సెట్టింగ్స్",
    currentPasswordLabel: "ప్రస్తుత పాస్వర్డ్",
    newPasswordLabel: "కొత్త పాస్వర్డ్",
    confirmPasswordLabel: "పాస్వర్డ్ నిర్ధారించండి",
    currentPasswordPlaceholder: "ప్రస్తుత పాస్వర్డ్",
    newPasswordPlaceholder: "కొత్త పాస్వర్డ్",
    confirmNewPassword: "కొత్త పాస్వర్డ్ నిర్ధారించండి",
    updatePassword: "పాస్వర్డ్ నవీకరించండి",
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // First check if user is logged in and has a language preference
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.languagePreference) {
          return userData.languagePreference;
        }
      } catch (e) {
        console.error("Error parsing stored user data:", e);
      }
    }
    // Fallback to localStorage or default
    return localStorage.getItem("selectedLanguage") || "English";
  });

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem("selectedLanguage", language);
  };

  const t = translations[currentLanguage] || translations["English"];

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
