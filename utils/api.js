import axios from "axios";
import { NativeModules } from "react-native";

let host = "192.168.1.22"; // IP ADRESS XXX.XXX.X.XX
const PORT = 3000;

try {
  if (NativeModules.SourceCode && NativeModules.SourceCode.scriptURL) {
    const scriptURL = NativeModules.SourceCode.scriptURL;

    if (scriptURL.startsWith("http")) {
      host = scriptURL.split("://")[1].split(":")[0];
    } else if (scriptURL.startsWith("https")) {
      host = scriptURL.split("://")[1].split(":")[0];
    } else {
      console.warn("Unrecognized scriptURL format:", scriptURL);
    }
  } else {
    console.warn("Fallback to default host because scriptURL is unavailable.");
  }
} catch (error) {
  console.error("Error determining host:", error);
}

let API_URL = `http://${host}:${PORT}`;
if (process.env.NODE_ENV === "production") {
  API_URL = "https://your-production-server.com";
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export default api;
