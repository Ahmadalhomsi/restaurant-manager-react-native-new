// utils/api.js

import axios from "axios";
import { NativeModules } from "react-native";

let host = "localhost";

const PORT = 3000;

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
  console.error("Unable to get scriptURL from NativeModules.SourceCode");
}

const API_URL = `http://${host}:${PORT}`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export default api;
