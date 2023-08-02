import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyAHc_8wewa0y1wl8sQxa9V_ZAUPa6GKw9E",
    authDomain: "whatsapp-b18b1.firebaseapp.com",
    projectId: "whatsapp-b18b1",
    storageBucket: "whatsapp-b18b1.appspot.com",
    messagingSenderId: "23523995841",
    appId: "1:23523995841:web:049bddbc08660cc210e440",
}

const app = initializeApp(firebaseConfig)

export const firebaseAuth = getAuth(app)
