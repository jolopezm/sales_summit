import { mount } from "svelte";
import App from "./App.svelte";
import "./css/app.css";

const target = document.getElementById("app");

if (!target) {
  throw new Error("Application root element was not found.");
}

mount(App, { target });
